import "server-only";
import { CANCEL_REASONS, cancelLabel } from "@/lib/content/cancel";
import Stripe from "stripe";
import type { Invoice, PlanId, Subscription } from "@/lib/api/types";
import { formatMoney } from "@/lib/format";
import { LAUNCH_OFFER, PLANS, SINGLE, WAITLIST_PRICES, withOffer } from "@/lib/content/pricing";
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

type SubRow = { stripe_subscription_id: string | null; current_period_end: string | null; plan: PlanId; test: boolean; cancel_at_period_end: boolean | null } | null;
const subRow = async (userId: string) =>
  must(await db().from("subscriptions").select("stripe_subscription_id, current_period_end, plan, test, cancel_at_period_end").eq("user_id", userId).maybeSingle()) as SubRow;

// Fin de l'offre (24 h après l'inscription, premier abonnement seulement), ou null.
export async function launchOfferEndsAt(user: UserRow) {
  const ends = new Date(user.created_at).getTime() + LAUNCH_OFFER.hours * 3_600_000;
  if (ends <= Date.now()) return null;
  const sub = await subRow(user.id);
  return sub?.stripe_subscription_id ? null : new Date(ends).toISOString();
}

// Offre en cours, pendant 24 h après l'inscription : prix spécial (abonnements) ou bienvenue (« Ma boutique » à 39 €).
export async function launchOffer(user: UserRow, cookie?: string | null) {
  const endsAt = await launchOfferEndsAt(user);
  return { endsAt, kind: endsAt ? ((await isWaitlistMember(user, cookie)) ? "waitlist" as const : "launch" as const) : null };
}

// Prix payé à chaque période, en euros, selon l'offre (le même que celui affiché sur le site).
// Réduction personnelle encore valable (ex. −15 % envoyée par e-mail), en %, ou 0.
export const activeDiscount = (user: Pick<UserRow, "discount_percent" | "discount_until">) =>
  user.discount_percent && user.discount_until && new Date(user.discount_until).getTime() > Date.now() ? user.discount_percent : 0;
// Prix avec la réduction personnelle (arrondi à l'euro), pour le site et pour Stripe.
export const discounted = (base: number, percent: number) => Math.round(base * (1 - percent / 100));

export function priceFor(plan: PaidPlan, interval: "month" | "year", offer: "waitlist" | "launch" | null) {
  const info = PLANS.find((p) => p.id === plan)!;
  const base = interval === "year" ? info.yearly : info.monthly;
  if (offer === "waitlist") return WAITLIST_PRICES[plan][interval === "year" ? "yearly" : "monthly"];
  if (offer === "launch") return withOffer(base);
  return base;
}

// Client Stripe introuvable avec la clé actuelle (ex. créé en mode test, puis passage en mode réel).
const missing = (e: unknown) => (e as { code?: string })?.code === "resource_missing";

// Nouveau client Stripe (aucun, ou l'ancien n'existe plus avec cette clé) : on remplace l'identifiant enregistré.
async function newCustomer(user: UserRow) {
  const c = await stripe().customers.create({ email: user.email, name: user.first_name || undefined, metadata: { user_id: user.id } });
  await db().from("users").update({ stripe_customer_id: c.id }).eq("id", user.id);
  return c.id;
}

// Page de paiement Stripe pour l'offre choisie. Le client enregistré est utilisé tel quel (un appel Stripe de
// moins) ; s'il n'existe plus (ex. créé en mode test), on en crée un et on recommence une seule fois.
export async function checkoutUrl(user: UserRow, plan: PaidPlan, interval: "month" | "year", cookie?: string | null) {
  const [{ kind: offer }, saved] = await Promise.all([launchOffer(user, cookie), user.stripe_customer_id ?? newCustomer(user)]);
  try {
    return await createSession(user, plan, interval, offer, saved);
  } catch (e) {
    if (!missing(e) || !user.stripe_customer_id) throw e;
    return createSession(user, plan, interval, offer, await newCustomer(user));
  }
}

async function createSession(user: UserRow, plan: PaidPlan, interval: "month" | "year", offer: "waitlist" | "launch" | null, customer: string) {
  const percent = activeDiscount(user);
  const base = (interval === "year" ? PLANS.find((p) => p.id === plan)!.yearly : PLANS.find((p) => p.id === plan)!.monthly);
  // Réduction personnelle : on garde le prix le plus bas (elle reste valable à vie sur cet abonnement).
  const amount = percent ? Math.min(priceFor(plan, interval, offer), discounted(base, percent)) : priceFor(plan, interval, offer);
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
        product_data: {
          name: NAMES[plan],
          description: `${percent ? `Réduction personnelle −${percent} % à vie. ` : offer === "waitlist" ? "Prix spécial à vie. " : ""}Ta boutique Shopify complète : textes, photos, éditeur IA et mise en ligne guidée. Sans engagement.`,
          images: [`${env.appUrl()}/brand/icon-512.png`],
        },
      },
    }],
    subscription_data: { metadata: { user_id: user.id, plan, interval, offer: percent ? `discount-${percent}` : offer ?? "none" } },
    ...(offer || percent ? {} : { allow_promotion_codes: true }),
    locale: "fr",
    // Rassure juste au-dessus du bouton de paiement.
    custom_text: { submit: { message: "Sans engagement : tu peux arrêter ton abonnement en un clic depuis ton compte Vigenia. Ta boutique se crée juste après le paiement." } },
    success_url: `${env.appUrl()}/app/abonnement?checkout=success`,
    cancel_url: `${env.appUrl()}/app/abonnement`,
  });
  if (!session.url) throw new HttpError(502, "billing_failed", "Le paiement n'a pas pu être préparé. Réessaie dans un instant.");
  return session.url;
}

// Paiement unique « Ma boutique » (39 €) pour une boutique d'aperçu.
export async function singleCheckoutUrl(user: UserRow, storeId: string) {
  const amount = SINGLE.price;
  const create = (customer: string) => stripe().checkout.sessions.create({
    mode: "payment",
    customer,
    client_reference_id: user.id,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "eur",
        unit_amount: amount * 100,
        product_data: {
          name: "Vigenia · Ma boutique",
          description: `Ta boutique complète (textes, photos, design, thème Shopify) et ${SINGLE.days} jours de retouches avec l'IA. Paiement unique, sans abonnement.`,
          images: [`${env.appUrl()}/brand/icon-512.png`],
        },
      },
    }],
    metadata: { kind: "single", user_id: user.id, store_id: storeId },
    payment_intent_data: { metadata: { kind: "single", user_id: user.id, store_id: storeId } },
    locale: "fr",
    custom_text: { submit: { message: "Paiement unique, sans abonnement. Ta boutique complète se crée juste après le paiement." } },
    success_url: `${env.appUrl()}/app/abonnement?checkout=success`,
    cancel_url: `${env.appUrl()}/app/boutiques/${storeId}`,
  });
  let session;
  try {
    session = await create(user.stripe_customer_id ?? await newCustomer(user));
  } catch (e) {
    if (!missing(e) || !user.stripe_customer_id) throw e;
    session = await create(await newCustomer(user));
  }
  if (!session.url) throw new HttpError(502, "billing_failed", "Le paiement n'a pas pu être préparé. Réessaie dans un instant.");
  return session.url;
}

// Paiement « Ma boutique » réussi (webhook) : 7 jours de droits Starter pour cette boutique, vente enregistrée.
export async function singlePaid(s: Stripe.Checkout.Session) {
  const userId = s.metadata?.user_id;
  const storeId = s.metadata?.store_id;
  if (s.metadata?.kind !== "single" || !userId || s.payment_status !== "paid") return;
  const until = new Date(Date.now() + SINGLE.days * 86_400_000).toISOString();
  await db().from("users").update({ single_until: until, single_store_id: storeId ?? null }).eq("id", userId);
  // La boutique reste marquée comme payée, même si le client en achète une autre plus tard.
  if (storeId) await db().from("stores").update({ single_paid_at: new Date().toISOString() }).eq("id", storeId).eq("user_id", userId);
  const user = must(await db().from("users").select("email").eq("id", userId).maybeSingle()) as { email: string } | null;
  const amount = s.amount_total ?? 0;
  await notifyOwner(`💰 Nouvelle vente Vigenia${s.livemode ? "" : " (test)"}`, saleMessage(user?.email ?? "Un client", "Ma boutique (paiement unique)", formatMoney(amount, "EUR")));
  if (s.livemode) await logRevenue({ user_id: userId, kind: "payment", plan: "single" as PlanId, amount_cents: amount, currency: "EUR", external_id: `single:${s.id}` });
}

export async function portalUrl(user: UserRow) {
  if (!user.stripe_customer_id) throw new HttpError(404, "not_found", "Aucun abonnement sur ce compte.");
  try {
    const s = await stripe().billingPortal.sessions.create({ customer: user.stripe_customer_id, return_url: `${env.appUrl()}/app/abonnement` });
    return s.url;
  } catch (e) {
    if (missing(e)) throw new HttpError(404, "not_found", "Aucun abonnement sur ce compte.");
    throw e;
  }
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
    // Un abonnement marqué « test » à la main (paiement d'essai du fondateur) le reste.
    test: !sub.livemode || (before?.test === true && before.stripe_subscription_id === sub.id),
    updated_at: new Date().toISOString(),
  });
  await db().from("users").update({ plan }).eq("id", userId);

  // Arrêt programmé depuis l'espace Stripe : on garde la réponse à l'enquête de résiliation de Stripe.
  const why = sub.cancellation_details;
  if (sub.cancel_at_period_end && !before?.cancel_at_period_end && (why?.feedback || why?.comment)) {
    try {
      await db().from("cancel_feedback").insert({ user_id: userId, email: user?.email ?? null, plan: before?.plan ?? plan, reason: why.feedback ? `stripe:${why.feedback}` : null, wish: null, details: why.comment || null });
      await notifyOwner("👋 Un client arrête son abonnement", `${user?.email ?? "Un client"} (via Stripe) : ${cancelLabel(CANCEL_REASONS, why.feedback ? `stripe:${why.feedback}` : null) || "—"}${why.comment ? ` · « ${why.comment.slice(0, 200)} »` : ""}`);
    } catch (e) {
      console.warn("cancel_feedback stripe", e);
    }
  }

  const was = user?.plan ?? "free";
  const info = PLANS.find((p) => p.id === plan);
  if (was === "free" && plan !== "free" && info) {
    const offer = sub.metadata?.offer;
    await notifyOwner(`💰 Nouvelle vente Vigenia${sub.livemode ? "" : " (test)"}`, saleMessage(user?.email ?? "Un client", info.name, `${formatMoney(amount ?? 0, "EUR")}/${interval === "year" ? "an" : "mois"}${offer === "waitlist" ? " avec le prix spécial" : ""}`));
    if (sub.livemode && before?.stripe_subscription_id !== sub.id) await logRevenue({ user_id: userId, kind: "new", plan, amount_cents: amount ?? 0, currency: "EUR", external_id: `new:${sub.id}` });
  } else if (was !== "free" && plan === "free") {
    await notifyOwner("Abonné parti", `${user?.email ?? "Un client"} a arrêté son abonnement Vigenia.`);
    if (sub.livemode && !before?.test && before?.plan && before.plan !== "free") await logRevenue({ user_id: userId, kind: "cancel", plan: before.plan, external_id: `cancel:${sub.id}` });
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
  const list = await stripe().subscriptions.list({ customer: user.stripe_customer_id, status: "all", limit: 5 }).catch((e) => {
    if (missing(e)) return null;
    throw e;
  });
  if (!list) return;
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
      if (!missing(e)) console.error("Factures Stripe", e);
    }
  }
  return { subscription, invoices, billingUrl: null };
}
