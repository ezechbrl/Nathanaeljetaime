import "server-only";
import Stripe from "stripe";
import type { Invoice, PlanId, Subscription } from "@/lib/api/types";
import { formatMoney } from "@/lib/format";
import { LAUNCH_OFFER, PLANS, WAITLIST_PRICES, withOffer } from "@/lib/content/pricing";
import { env } from "./env";
import { HttpError } from "./http";
import { notifyOwner, saleMessage } from "./notify";
import { db, must } from "./supabase";
import { isWaitlistMember } from "./waitlist";
import type { UserRow } from "./auth";

// Abonnements Vigenia payés par carte sur vigenia.com (Stripe Checkout).
// Le prix est fixé au moment du paiement (prix liste d'attente, offre de lancement ou prix normal) et
// reste le même à vie pour cet abonnement : aucun identifiant de prix à configurer dans Stripe.

type PaidPlan = "pro" | "agency";
const NAMES: Record<PaidPlan, string> = { pro: "Vigenia Starter", agency: "Vigenia Pro" };

let client: Stripe | null = null;
export const stripe = () => (client ??= new Stripe(env.stripeKey()));

type SubRow = { stripe_subscription_id: string | null; current_period_end: string | null; plan: PlanId; test: boolean } | null;
const subRow = async (userId: string) =>
  must(await db().from("subscriptions").select("stripe_subscription_id, current_period_end, plan, test").eq("user_id", userId).maybeSingle()) as SubRow;

// Fin de l'offre (24 h après l'inscription, premier abonnement seulement), ou null.
export async function launchOfferEndsAt(user: UserRow) {
  const ends = new Date(user.created_at).getTime() + LAUNCH_OFFER.hours * 3_600_000;
  if (ends <= Date.now()) return null;
  const sub = await subRow(user.id);
  return sub?.stripe_subscription_id ? null : new Date(ends).toISOString();
}

// Offre en cours : liste d'attente (prix réservé) ou lancement (−50 %), pendant 24 h après l'inscription.
export async function launchOffer(user: UserRow, cookie?: string | null) {
  const endsAt = await launchOfferEndsAt(user);
  return { endsAt, kind: endsAt ? ((await isWaitlistMember(user, cookie)) ? "waitlist" as const : "launch" as const) : null };
}

// Prix payé à chaque période, en euros, selon l'offre (le même que celui affiché sur le site).
export function priceFor(plan: PaidPlan, interval: "month" | "year", offer: "waitlist" | "launch" | null) {
  const info = PLANS.find((p) => p.id === plan)!;
  const base = interval === "year" ? info.yearly : info.monthly;
  if (offer === "waitlist") return WAITLIST_PRICES[plan][interval === "year" ? "yearly" : "monthly"];
  if (offer === "launch") return withOffer(base);
  return base;
}

async function customerFor(user: UserRow) {
  if (user.stripe_customer_id) return user.stripe_customer_id;
  const c = await stripe().customers.create({ email: user.email, name: user.first_name || undefined, metadata: { user_id: user.id } });
  await db().from("users").update({ stripe_customer_id: c.id }).eq("id", user.id);
  return c.id;
}

// Page de paiement Stripe pour l'offre choisie.
export async function checkoutUrl(user: UserRow, plan: PaidPlan, interval: "month" | "year", cookie?: string | null) {
  const [{ kind: offer }, customer] = await Promise.all([launchOffer(user, cookie), customerFor(user)]);
  const amount = priceFor(plan, interval, offer);
  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer,
    client_reference_id: user.id,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "eur",
        unit_amount: amount * 100,
        recurring: { interval },
        product_data: { name: NAMES[plan], description: offer === "waitlist" ? "Prix réservé à vie (liste d'attente)" : offer === "launch" ? "Offre de lancement −50 % à vie" : undefined },
      },
    }],
    subscription_data: { metadata: { user_id: user.id, plan, interval, offer: offer ?? "none" } },
    ...(offer ? {} : { allow_promotion_codes: true }),
    locale: "fr",
    success_url: `${env.appUrl()}/app/abonnement?checkout=success`,
    cancel_url: `${env.appUrl()}/app/abonnement`,
  });
  if (!session.url) throw new HttpError(502, "billing_failed", "Le paiement n'a pas pu être préparé. Réessaie dans un instant.");
  return session.url;
}

export async function portalUrl(user: UserRow) {
  if (!user.stripe_customer_id) throw new HttpError(404, "not_found", "Aucun abonnement sur ce compte.");
  const s = await stripe().billingPortal.sessions.create({ customer: user.stripe_customer_id, return_url: `${env.appUrl()}/app/abonnement` });
  return s.url;
}

const planOf = (sub: Stripe.Subscription): PaidPlan | null => {
  const m = sub.metadata?.plan;
  return m === "pro" || m === "agency" ? m : null;
};

// Abonnement Stripe → base de données (appelé par le webhook, au retour du paiement et par le cron).
export async function syncSubscription(sub: Stripe.Subscription) {
  const userId = sub.metadata?.user_id
    ?? (must(await db().from("users").select("id").eq("stripe_customer_id", String(sub.customer)).maybeSingle()) as { id: string } | null)?.id;
  if (!userId) return;
  const before = await subRow(userId);
  const user = must(await db().from("users").select("plan, email").eq("id", userId).maybeSingle()) as { plan: PlanId; email: string } | null;
  const item = sub.items.data[0];
  const mapped = planOf(sub);
  const active = ["active", "trialing", "past_due"].includes(sub.status);
  const plan: PlanId = active && mapped ? mapped : "free";
  const interval = item?.price.recurring?.interval === "year" ? "year" : "month";
  const amount = item?.price.unit_amount ?? null;
  const periodEnd = item?.current_period_end ? new Date(item.current_period_end * 1000).toISOString() : null;
  await db().from("subscriptions").upsert({
    user_id: userId,
    stripe_subscription_id: sub.id,
    plan,
    status: sub.status === "canceled" || sub.status === "incomplete_expired" ? "canceled" : sub.status === "past_due" ? "past_due" : sub.status === "trialing" ? "trialing" : "active",
    interval,
    current_period_end: periodEnd,
    cancel_at_period_end: sub.cancel_at_period_end,
    amount_cents: amount,
    currency: (item?.price.currency ?? "eur").toUpperCase(),
    test: !sub.livemode,
    updated_at: new Date().toISOString(),
  });
  await db().from("users").update({ plan }).eq("id", userId);

  const was = user?.plan ?? "free";
  const info = PLANS.find((p) => p.id === plan);
  if (was === "free" && plan !== "free" && info) {
    const offer = sub.metadata?.offer;
    await notifyOwner(`💰 Nouvelle vente Vigenia${sub.livemode ? "" : " (test)"}`, saleMessage(user?.email ?? "Un client", info.name, `${formatMoney(amount ?? 0, "EUR")}/${interval === "year" ? "an" : "mois"}${offer === "waitlist" ? " avec le prix liste d'attente" : offer === "launch" ? " avec l'offre −50 %" : ""}`));
    if (sub.livemode && before?.stripe_subscription_id !== sub.id) await logRevenue({ user_id: userId, kind: "new", plan, amount_cents: amount ?? 0, currency: "EUR", external_id: `new:${sub.id}` });
  } else if (was !== "free" && plan === "free") {
    await notifyOwner("Abonné parti", `${user?.email ?? "Un client"} a arrêté son abonnement Vigenia.`);
    if (sub.livemode && before?.plan && before.plan !== "free") await logRevenue({ user_id: userId, kind: "cancel", plan: before.plan, external_id: `cancel:${sub.id}` });
  }
}

// Facture payée : historique des encaissements (tableau de bord) et commission d'affiliation.
export async function invoicePaid(invoice: Stripe.Invoice) {
  if (!invoice.amount_paid || !invoice.customer || !invoice.livemode) return;
  const user = must(await db().from("users").select("id, plan, referred_by").eq("stripe_customer_id", String(invoice.customer)).maybeSingle()) as { id: string; plan: PlanId; referred_by: string | null } | null;
  if (!user) return;
  await logRevenue({ user_id: user.id, kind: "payment", plan: user.plan, amount_cents: invoice.amount_paid, currency: invoice.currency.toUpperCase(), external_id: `pay:${invoice.id}` });
  if (!user.referred_by) return;
  const aff = must(await db().from("affiliates").select("user_id, commission_rate").eq("code", user.referred_by).maybeSingle()) as { user_id: string; commission_rate: number } | null;
  if (!aff || aff.user_id === user.id) return;
  const first = must(await db().from("affiliate_events").select("created_at").eq("kind", "payment").eq("referred_user_id", user.id).order("created_at").limit(1).maybeSingle()) as { created_at: string } | null;
  if (first && Date.now() - new Date(first.created_at).getTime() > 365 * 86_400_000) return; // 12 premiers mois
  await db().from("affiliate_events").upsert(
    { code: user.referred_by, kind: "payment", amount_cents: Math.round(invoice.amount_paid * Number(aff.commission_rate)), referred_user_id: user.id, external_id: invoice.id },
    { onConflict: "external_id", ignoreDuplicates: true },
  );
}

async function logRevenue(row: { user_id: string; kind: "new" | "payment" | "cancel"; plan: PlanId; amount_cents?: number; currency?: string; external_id: string }) {
  await db().from("revenue_events").upsert(row, { onConflict: "external_id", ignoreDuplicates: true });
}

// Relit chez Stripe le dernier abonnement du client (retour du paiement, bouton « Actualiser », cron).
export async function syncFromStripe(userId: string) {
  const user = must(await db().from("users").select("stripe_customer_id").eq("id", userId).maybeSingle()) as { stripe_customer_id: string | null } | null;
  if (!user?.stripe_customer_id) return;
  const list = await stripe().subscriptions.list({ customer: user.stripe_customer_id, status: "all", limit: 5 });
  const sub = list.data.find((s) => ["active", "trialing", "past_due"].includes(s.status)) ?? list.data[0];
  if (sub) await syncSubscription(sub);
}

// Arrêt de l'abonnement : il reste actif jusqu'à la fin de la période déjà payée.
export async function cancelSubscriptionNow(userId: string) {
  const row = await subRow(userId);
  if (!row?.stripe_subscription_id) return;
  await syncSubscription(await stripe().subscriptions.update(row.stripe_subscription_id, { cancel_at_period_end: true }));
}

export async function billingFor(user: UserRow): Promise<{ subscription: Subscription; invoices: Invoice[]; billingUrl: string | null }> {
  const row = must(await db().from("subscriptions").select("*").eq("user_id", user.id).maybeSingle()) as Record<string, any> | null;
  const subscription: Subscription = row
    ? { plan: row.plan, status: row.status, interval: row.interval, renewsAt: row.current_period_end, cancelAtPeriodEnd: row.cancel_at_period_end, amount: row.amount_cents ?? null, currency: row.currency ?? "EUR" }
    : { plan: user.plan, status: "active", interval: null, renewsAt: null, cancelAtPeriodEnd: false };
  let invoices: Invoice[] = [];
  if (user.stripe_customer_id) {
    try {
      const list = await stripe().invoices.list({ customer: user.stripe_customer_id, limit: 24 });
      invoices = list.data.filter((i) => i.status !== "draft" && (i.amount_paid || i.amount_due) > 0).map((i) => ({
        id: i.id!, number: i.number ?? "", amount: i.amount_paid || i.amount_due, currency: i.currency.toUpperCase(),
        status: i.status === "paid" ? "paid" : i.status === "void" ? "void" : "open", pdfUrl: i.invoice_pdf ?? "#", createdAt: new Date(i.created * 1000).toISOString(),
      }));
    } catch (e) {
      console.error("Factures Stripe", e);
    }
  }
  return { subscription, invoices, billingUrl: null };
}
