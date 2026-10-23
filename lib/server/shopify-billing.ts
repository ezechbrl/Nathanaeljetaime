import "server-only";
import type { Invoice, PlanId, Subscription } from "@/lib/api/types";
import { LAUNCH_OFFER, PLANS, euro } from "@/lib/content/pricing";
import { env } from "./env";
import { HttpError } from "./http";
import { notifyOwner, saleMessage } from "./notify";
import { connectionFor, graphql } from "./shopify";
import { db, must } from "./supabase";
import type { UserRow } from "./auth";

// Abonnements Vigenia facturés par Shopify (Billing API), obligatoire pour l'App Store (règle 1.2).
// Le marchand approuve la charge sur une page Shopify ; le montant s'ajoute à sa facture Shopify.

type PaidPlan = "pro" | "agency";
const NAMES: Record<PaidPlan, string> = { pro: "Vigenia Starter", agency: "Vigenia Pro" };
const planOfName = (name: string): PaidPlan | null => (name === NAMES.agency ? "agency" : name === NAMES.pro ? "pro" : null);
const USD_PER_EUR = 1.1; // boutiques facturées en dollars : prix converti et arrondi

type SubRow = { shopify_subscription_id: string | null; stripe_subscription_id: string | null; current_period_end: string | null; plan: PlanId } | null;
const subRow = async (userId: string) =>
  must(await db().from("subscriptions").select("shopify_subscription_id, stripe_subscription_id, current_period_end, plan").eq("user_id", userId).maybeSingle()) as SubRow;

// Fin de l'offre de lancement (24 h après l'inscription, premier abonnement seulement), ou null.
export async function launchOfferEndsAt(user: UserRow) {
  const ends = new Date(user.created_at).getTime() + LAUNCH_OFFER.hours * 3_600_000;
  if (ends <= Date.now()) return null;
  const sub = await subRow(user.id);
  return sub?.shopify_subscription_id || sub?.stripe_subscription_id ? null : new Date(ends).toISOString();
}

// Page de paiement Shopify pour l'offre choisie (prix en euros si la boutique paie Shopify en euros).
export async function checkoutUrl(user: UserRow, plan: PaidPlan, interval: "month" | "year") {
  const [conn, offer] = await Promise.all([connectionFor(user.id, null), launchOfferEndsAt(user)]);
  const info = PLANS.find((p) => p.id === plan)!;
  const d = await graphql<{ shop: { plan: { partnerDevelopment: boolean } }; shopBillingPreferences: { currency: string } | null }>(conn.shop, conn.token,
    `{ shop { plan { partnerDevelopment } } shopBillingPreferences { currency } }`).catch(() => null);
  const eur = !d?.shopBillingPreferences || d.shopBillingPreferences.currency === "EUR";
  const base = interval === "year" ? info.yearly : info.monthly;
  const amount = eur ? base : Math.round(base * USD_PER_EUR);
  // Boutiques de développement : Shopify n'accepte que des charges de test.
  const test = process.env.SHOPIFY_BILLING_TEST === "1" || Boolean(d?.shop.plan.partnerDevelopment);
  const res = await graphql<{ appSubscriptionCreate: { confirmationUrl: string | null; userErrors: { message: string }[] } }>(conn.shop, conn.token,
    `mutation ($name: String!, $returnUrl: URL!, $test: Boolean, $lineItems: [AppSubscriptionLineItemInput!]!) {
      appSubscriptionCreate(name: $name, returnUrl: $returnUrl, test: $test, lineItems: $lineItems, replacementBehavior: APPLY_IMMEDIATELY) {
        confirmationUrl userErrors { message }
      }
    }`,
    {
      name: NAMES[plan],
      returnUrl: `${env.appUrl()}/api/billing/shopify/return`,
      test,
      lineItems: [{ plan: { appRecurringPricingDetails: {
        price: { amount, currencyCode: eur ? "EUR" : "USD" },
        interval: interval === "year" ? "ANNUAL" : "EVERY_30_DAYS",
        // −50 % à vie pendant l'offre de lancement (sans limite de durée).
        ...(offer ? { discount: { value: { percentage: LAUNCH_OFFER.percent / 100 } } } : {}),
      } } }],
    });
  const err = res.appSubscriptionCreate.userErrors[0];
  if (err || !res.appSubscriptionCreate.confirmationUrl) throw new HttpError(502, "billing_failed", `Shopify n'a pas pu préparer le paiement : ${err?.message ?? "réessaie dans un instant"}.`);
  await registerSubscriptionWebhook(conn.shop, conn.token).catch(() => {});
  return res.appSubscriptionCreate.confirmationUrl;
}

// Shopify prévient Vigenia quand un abonnement est approuvé, annulé ou expire.
async function registerSubscriptionWebhook(shop: string, token: string) {
  await graphql(shop, token,
    `mutation ($uri: String!) { webhookSubscriptionCreate(topic: APP_SUBSCRIPTIONS_UPDATE, webhookSubscription: { uri: $uri, format: JSON }) { userErrors { message } } }`,
    { uri: `${env.appUrl()}/api/webhooks/shopify` });
}

type ActiveSub = {
  id: string; name: string; status: string; currentPeriodEnd: string | null;
  lineItems: { plan: { pricingDetails: { __typename: string; interval?: string; price?: { amount: string; currencyCode: string }; discount?: { value: { percentage?: number; amount?: { amount: string } } } | null } } }[];
};

// Relit l'abonnement actif chez Shopify et met la base à jour (retour du paiement, webhook, cron).
export async function syncFromShopify(userId: string) {
  const conn = await connectionFor(userId, null);
  const d = await graphql<{ currentAppInstallation: { activeSubscriptions: ActiveSub[] } }>(conn.shop, conn.token, `{
    currentAppInstallation { activeSubscriptions { id name status currentPeriodEnd
      lineItems { plan { pricingDetails { __typename ... on AppRecurringPricing { interval price { amount currencyCode }
        discount { value { ... on AppSubscriptionDiscountPercentage { percentage } ... on AppSubscriptionDiscountAmount { amount { amount } } } } } } } } } }
  }`);
  const sub = d.currentAppInstallation.activeSubscriptions.find((s) => planOfName(s.name) && s.status === "ACTIVE");
  const before = await subRow(userId);
  const user = must(await db().from("users").select("plan, email, referred_by").eq("id", userId).maybeSingle()) as { plan: PlanId; email: string; referred_by: string | null } | null;

  if (!sub) {
    // Plus d'abonnement Shopify actif : on ne retire que ce que Shopify facturait (pas un accès offert).
    if (before?.shopify_subscription_id) {
      await db().from("subscriptions").update({ plan: "free", status: "canceled", updated_at: new Date().toISOString() }).eq("user_id", userId);
      await db().from("users").update({ plan: "free" }).eq("id", userId);
      if (user?.plan !== "free") await notifyOwner("Abonné parti", `${user?.email ?? "Un client"} a arrêté son abonnement Vigenia.`);
    }
    return;
  }
  const plan = planOfName(sub.name)!;
  const p = sub.lineItems[0]?.plan.pricingDetails;
  const interval = p?.interval === "ANNUAL" ? "year" : "month";
  const pct = p?.discount?.value.percentage ?? 0;
  const off = Number(p?.discount?.value.amount?.amount ?? 0);
  const amount = Math.round(Math.max(0, Number(p?.price?.amount ?? 0) * (1 - pct) - off) * 100);
  await db().from("subscriptions").upsert({
    user_id: userId, shopify_subscription_id: sub.id, shop_domain: conn.shop, plan, status: "active", interval,
    current_period_end: sub.currentPeriodEnd, cancel_at_period_end: false, amount_cents: amount, currency: p?.price?.currencyCode ?? "EUR",
    updated_at: new Date().toISOString(),
  });
  await db().from("users").update({ plan }).eq("id", userId);

  const info = PLANS.find((x) => x.id === plan);
  if ((user?.plan ?? "free") === "free" && info) {
    await notifyOwner("💰 Nouvelle vente Vigenia", saleMessage(user?.email ?? "Un client", info.name, `${euro(amount / 100)}/${interval === "year" ? "an" : "mois"}`));
  }
  // Nouvelle période payée : commission d'affiliation (12 premiers mois).
  if (sub.currentPeriodEnd && sub.currentPeriodEnd !== before?.current_period_end) await creditAffiliate(userId, user?.referred_by ?? null, amount, `${sub.id}:${sub.currentPeriodEnd}`);
}

async function creditAffiliate(userId: string, code: string | null, amountCents: number, externalId: string) {
  if (!code || !amountCents) return;
  const aff = must(await db().from("affiliates").select("user_id, commission_rate").eq("code", code).maybeSingle()) as { user_id: string; commission_rate: number } | null;
  if (!aff || aff.user_id === userId) return;
  const first = must(await db().from("affiliate_events").select("created_at").eq("kind", "payment").eq("referred_user_id", userId).order("created_at").limit(1).maybeSingle()) as { created_at: string } | null;
  if (first && Date.now() - new Date(first.created_at).getTime() > 365 * 86_400_000) return;
  await db().from("affiliate_events").upsert(
    { code, kind: "payment", amount_cents: Math.round(amountCents * Number(aff.commission_rate)), referred_user_id: userId, external_id: externalId },
    { onConflict: "external_id", ignoreDuplicates: true },
  );
}

// Webhook APP_SUBSCRIPTIONS_UPDATE : on retrouve le client par sa boutique puis on relit Shopify.
export async function syncShopSubscriptions(shop: string) {
  const rows = must(await db().from("shop_connections").select("user_id").eq("shop_domain", shop).eq("status", "active")) as { user_id: string }[];
  for (const r of rows) await syncFromShopify(r.user_id).catch((e) => console.error("Abonnement Shopify", shop, e));
}

export async function cancelSubscriptionNow(userId: string) {
  const row = await subRow(userId);
  if (!row?.shopify_subscription_id) return;
  const conn = await connectionFor(userId, null);
  await graphql(conn.shop, conn.token, `mutation ($id: ID!) { appSubscriptionCancel(id: $id) { userErrors { message } } }`, { id: row.shopify_subscription_id });
  await syncFromShopify(userId);
}

export async function billingFor(user: UserRow): Promise<{ subscription: Subscription; invoices: Invoice[]; billingUrl: string | null }> {
  const row = must(await db().from("subscriptions").select("*").eq("user_id", user.id).maybeSingle()) as Record<string, any> | null;
  const subscription: Subscription = row
    ? { plan: row.plan, status: row.status, interval: row.interval, renewsAt: row.current_period_end, cancelAtPeriodEnd: row.cancel_at_period_end, amount: row.amount_cents ?? null }
    : { plan: user.plan, status: "active", interval: null, renewsAt: null, cancelAtPeriodEnd: false };
  // Les factures sont celles de Shopify : lien direct vers la page Facturation de l'admin.
  const handle = String(row?.shop_domain ?? "").replace(".myshopify.com", "");
  return { subscription, invoices: [], billingUrl: handle ? `https://admin.shopify.com/store/${handle}/settings/billing` : null };
}
