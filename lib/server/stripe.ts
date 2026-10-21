import "server-only";
import Stripe from "stripe";
import type { Invoice, PlanId, Subscription } from "@/lib/api/types";
import { LAUNCH_OFFER, PLANS, euro } from "@/lib/content/pricing";
import { env } from "./env";
import { notifyOwner, saleMessage } from "./notify";
import { db, must } from "./supabase";
import type { UserRow } from "./auth";

let client: Stripe | null = null;
export const stripe = () => (client ??= new Stripe(env.stripeKey()));

function planForPrice(priceId: string): { plan: PlanId; interval: "month" | "year" } | null {
  for (const plan of ["pro", "agency"] as const) {
    for (const interval of ["month", "year"] as const) {
      try {
        if (env.stripePrice(plan, interval) === priceId) return { plan, interval };
      } catch {
        // prix non configuré
      }
    }
  }
  return null;
}

export async function customerFor(user: UserRow) {
  if (user.stripe_customer_id) return user.stripe_customer_id;
  const c = await stripe().customers.create({ email: user.email, name: user.first_name || undefined, metadata: { user_id: user.id } });
  await db().from("users").update({ stripe_customer_id: c.id }).eq("id", user.id);
  return c.id;
}

// Fin de l'offre de lancement pour ce compte (48 h après l'inscription, premier abonnement seulement), ou null.
// Le paiement n'est ouvert que si le coupon existe (voir billingConfigured) : le prix affiché est toujours celui payé.
export async function launchOfferEndsAt(user: UserRow) {
  const ends = new Date(user.created_at).getTime() + LAUNCH_OFFER.hours * 3_600_000;
  if (ends <= Date.now()) return null;
  const sub = must(await db().from("subscriptions").select("stripe_subscription_id").eq("user_id", user.id).maybeSingle()) as { stripe_subscription_id: string | null } | null;
  return sub?.stripe_subscription_id ? null : new Date(ends).toISOString();
}

export async function checkoutUrl(user: UserRow, plan: "pro" | "agency", interval: "month" | "year") {
  const [offer, customer] = await Promise.all([launchOfferEndsAt(user), customerFor(user)]);
  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer,
    line_items: [{ price: env.stripePrice(plan, interval), quantity: 1 }],
    client_reference_id: user.id,
    subscription_data: { metadata: { user_id: user.id } },
    // Stripe refuse les deux ensemble : coupon de lancement, sinon codes promo.
    ...(offer ? { discounts: [{ coupon: process.env.STRIPE_LAUNCH_COUPON! }] } : { allow_promotion_codes: true }),
    locale: "fr",
    // Retour sur l'accueil : le projet mis de côté avant le paiement se relance tout seul.
    success_url: `${env.appUrl()}/app?checkout=success`,
    cancel_url: `${env.appUrl()}/app`,
  });
  return session.url!;
}

export async function portalUrl(user: UserRow) {
  const s = await stripe().billingPortal.sessions.create({ customer: await customerFor(user), return_url: `${env.appUrl()}/app/abonnement` });
  return s.url;
}

// Synchronise l'abonnement Stripe vers la base (appelé par les webhooks).
export async function syncSubscription(sub: Stripe.Subscription) {
  const userId = sub.metadata.user_id ?? (must(await db().from("users").select("id").eq("stripe_customer_id", String(sub.customer)).maybeSingle()) as { id: string } | null)?.id;
  if (!userId) return;
  const before = must(await db().from("users").select("plan, email").eq("id", userId).maybeSingle()) as { plan: PlanId; email: string } | null;
  const item = sub.items.data[0];
  const mapped = item ? planForPrice(item.price.id) : null;
  const active = ["active", "trialing", "past_due"].includes(sub.status);
  const plan: PlanId = active && mapped ? mapped.plan : "free";
  await db().from("subscriptions").upsert({
    user_id: userId,
    stripe_subscription_id: sub.id,
    plan,
    status: sub.status === "canceled" || sub.status === "incomplete_expired" ? "canceled" : sub.status === "past_due" ? "past_due" : sub.status === "trialing" ? "trialing" : "active",
    interval: mapped?.interval ?? null,
    current_period_end: item?.current_period_end ? new Date(item.current_period_end * 1000).toISOString() : null,
    cancel_at_period_end: sub.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  });
  await db().from("users").update({ plan }).eq("id", userId);

  // Notification sur le téléphone du fondateur : nouvelle vente ou départ d'un abonné.
  const was = before?.plan ?? "free";
  const info = PLANS.find((p) => p.id === plan);
  if (was === "free" && plan !== "free" && info && mapped) {
    await notifyOwner("💰 Nouvelle vente Vigenia", saleMessage(before?.email ?? "Un client", info.name, mapped.interval === "year" ? `${euro(info.yearly)}/an` : `${euro(info.monthly)}/mois`));
  } else if (was !== "free" && plan === "free") {
    await notifyOwner("Abonné parti", `${before?.email ?? "Un client"} a arrêté son abonnement Vigenia.`);
  }
}

// Crédite la commission d'affiliation sur une facture payée.
export async function creditAffiliate(invoice: Stripe.Invoice) {
  if (!invoice.amount_paid || !invoice.customer) return;
  const user = must(await db().from("users").select("id, referred_by, created_at").eq("stripe_customer_id", String(invoice.customer)).maybeSingle()) as { id: string; referred_by: string | null } | null;
  if (!user?.referred_by) return;
  const aff = must(await db().from("affiliates").select("user_id, commission_rate").eq("code", user.referred_by).maybeSingle()) as { user_id: string; commission_rate: number } | null;
  if (!aff || aff.user_id === user.id) return;
  const first = must(await db().from("affiliate_events").select("created_at").eq("kind", "payment").eq("referred_user_id", user.id).order("created_at").limit(1).maybeSingle()) as { created_at: string } | null;
  if (first && Date.now() - new Date(first.created_at).getTime() > 365 * 86_400_000) return; // 12 mois maximum
  const net = invoice.amount_paid - (invoice.total_taxes?.reduce((s, t) => s + t.amount, 0) ?? 0);
  await db().from("affiliate_events").upsert(
    { code: user.referred_by, kind: "payment", amount_cents: Math.round(net * Number(aff.commission_rate)), referred_user_id: user.id, external_id: invoice.id },
    { onConflict: "external_id", ignoreDuplicates: true },
  );
}

export async function billingFor(user: UserRow): Promise<{ subscription: Subscription; invoices: Invoice[] }> {
  const row = must(await db().from("subscriptions").select("*").eq("user_id", user.id).maybeSingle()) as Record<string, any> | null;
  const subscription: Subscription = row
    ? { plan: row.plan, status: row.status, interval: row.interval, renewsAt: row.current_period_end, cancelAtPeriodEnd: row.cancel_at_period_end }
    : { plan: user.plan, status: "active", interval: null, renewsAt: null, cancelAtPeriodEnd: false };
  let invoices: Invoice[] = [];
  if (user.stripe_customer_id) {
    try {
      const list = await stripe().invoices.list({ customer: user.stripe_customer_id, limit: 24 });
      // Les factures à 0 € (essai, coupon 100 %) ne servent à rien au client : on les cache.
      invoices = list.data.filter((i) => i.status !== "draft" && (i.amount_paid || i.amount_due) > 0).map((i) => ({
        id: i.id!, number: i.number ?? "", amount: i.amount_paid || i.amount_due, currency: i.currency.toUpperCase(),
        status: i.status === "paid" ? "paid" : i.status === "void" ? "void" : "open", pdfUrl: i.invoice_pdf ?? "#", createdAt: new Date(i.created * 1000).toISOString(),
      }));
    } catch (e) {
      console.error("Factures Stripe", e);
    }
  }
  // Prix de l'abonnement, remise comprise : 39 € à vie pour l'offre de lancement, jamais le prix barré.
  // À défaut (Stripe indisponible), le montant de la dernière facture payée.
  subscription.amount = (row?.stripe_subscription_id ? await discountedPrice(row.stripe_subscription_id) : null)
    ?? invoices.find((i) => i.status === "paid" && i.amount > 0)?.amount ?? null;
  return { subscription, invoices };
}

async function discountedPrice(subscriptionId: string): Promise<number | null> {
  try {
    const sub = await stripe().subscriptions.retrieve(subscriptionId, { expand: ["discounts.source.coupon"] });
    const unit = sub.items.data[0]?.price.unit_amount;
    if (unit == null) return null;
    let price = unit;
    for (const d of sub.discounts) {
      if (typeof d === "string") continue;
      const coupon = d.source?.coupon;
      if (!coupon || typeof coupon === "string" || (d.end && d.end * 1000 < Date.now())) continue;
      if (coupon.percent_off) price = price * (1 - coupon.percent_off / 100);
      if (coupon.amount_off) price -= coupon.amount_off;
    }
    return Math.max(0, Math.round(price));
  } catch (e) {
    console.error("Prix de l'abonnement Stripe", e);
    return null;
  }
}

export async function cancelSubscriptionNow(userId: string) {
  const row = must(await db().from("subscriptions").select("stripe_subscription_id").eq("user_id", userId).maybeSingle()) as { stripe_subscription_id: string | null } | null;
  if (row?.stripe_subscription_id) await stripe().subscriptions.cancel(row.stripe_subscription_id);
}
