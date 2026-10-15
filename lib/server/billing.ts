import "server-only";
import type { Invoice, PlanId, Subscription } from "@/lib/api/types";
import type { UserRow } from "./auth";
import { env } from "./env";
import { HttpError } from "./http";
import { connectionFor, graphql } from "./shopify";
import { db, must } from "./supabase";

// Abonnements facturés par Shopify (« Shopify App Pricing ») :
// - les offres sont créées dans le Partner Dashboard (identifiants contenant « pro » et « agence ») ;
// - le marchand choisit son offre sur la page hébergée par Shopify ;
// - on vérifie l'abonnement avec la Partner API (activeSubscription).

const PARTNER_API_VERSION = "2026-07";

export function billingConfigured() {
  return Boolean(env.shopifyAppHandle() && env.shopifyAppId() && env.partnerOrgId() && env.partnerToken());
}

function planFromHandle(handle: string | undefined): PlanId {
  const h = (handle ?? "").toLowerCase();
  if (h.includes("agenc")) return "agency";
  if (h.includes("pro")) return "pro";
  return "free";
}

// Page Shopify où le marchand choisit, change ou quitte son offre.
export async function planSelectionUrl(user: UserRow) {
  if (!billingConfigured()) throw new HttpError(503, "not_configured", "Le paiement en ligne arrive très bientôt. Écris-nous pour passer à Pro dès maintenant.");
  const { shop } = await connectionFor(user.id, null);
  return `https://admin.shopify.com/store/${shop.replace(/\.myshopify\.com$/, "")}/charges/${env.shopifyAppHandle()}/pricing_plans`;
}

type ActiveSubscription = {
  billingPeriod: "EVERY_30_DAYS" | "ANNUAL" | string;
  cancelAtEndOfCycle: boolean;
  trialEndsAt: string | null;
  currentBillingCycle: { startTime: string; endTime: string } | null;
  items: { handle: string; price: { __typename: string; amount?: string; currency: string } }[];
} | null;

async function partner<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(`https://partners.shopify.com/${env.partnerOrgId()}/api/${PARTNER_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-shopify-access-token": env.partnerToken()! },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new HttpError(502, "upstream_error", `Shopify Partner API a répondu ${res.status}.`);
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new HttpError(502, "upstream_error", `Shopify : ${json.errors.map((e) => e.message).join(" ; ")}`);
  return json.data as T;
}

async function activeSubscription(shop: string, token: string): Promise<ActiveSubscription> {
  const { shop: info } = await graphql<{ shop: { id: string } }>(shop, token, `{ shop { id } }`);
  const data = await partner<{ activeSubscription: ActiveSubscription }>(
    `query ActiveSubscription($appId: ID!, $shopId: ID!) {
      activeSubscription(appId: $appId, shopId: $shopId) {
        billingPeriod cancelAtEndOfCycle trialEndsAt
        currentBillingCycle { startTime endTime }
        items { handle price { __typename currency ... on FlatRatePrice { amount } } }
      }
    }`,
    { appId: `gid://shopify/App/${env.shopifyAppId()}`, shopId: info.id },
  );
  return data.activeSubscription;
}

// Relit l'abonnement chez Shopify et met la base à jour (retour de la page d'offres, tâche quotidienne).
export async function syncShopifySubscription(userId: string) {
  if (!billingConfigured()) return;
  let conn: { shop: string; token: string };
  try {
    conn = await connectionFor(userId, null);
  } catch {
    return; // pas de boutique active : rien à synchroniser
  }
  const sub = await activeSubscription(conn.shop, conn.token);
  const item = sub?.items.find((i) => planFromHandle(i.handle) !== "free") ?? sub?.items[0];
  const plan = planFromHandle(item?.handle);
  await db().from("subscriptions").upsert({
    user_id: userId,
    shop_domain: conn.shop,
    plan,
    status: !sub ? "canceled" : sub.trialEndsAt && new Date(sub.trialEndsAt) > new Date() ? "trialing" : "active",
    interval: sub ? (sub.billingPeriod === "ANNUAL" ? "year" : "month") : null,
    current_period_end: sub?.currentBillingCycle?.endTime ?? null,
    cancel_at_period_end: sub?.cancelAtEndOfCycle ?? false,
    updated_at: new Date().toISOString(),
  });
  await db().from("users").update({ plan }).eq("id", userId);

  // Commission d'affiliation : une fois par période payée, pendant 12 mois.
  const amount = Number(item?.price.amount ?? 0);
  if (sub?.currentBillingCycle && amount > 0) await creditAffiliate(userId, Math.round(amount * 100), `${conn.shop}:${sub.currentBillingCycle.startTime}`);
}

async function creditAffiliate(userId: string, amountCents: number, externalId: string) {
  const user = must(await db().from("users").select("id, referred_by").eq("id", userId).maybeSingle()) as { id: string; referred_by: string | null } | null;
  if (!user?.referred_by) return;
  const aff = must(await db().from("affiliates").select("user_id, commission_rate").eq("code", user.referred_by).maybeSingle()) as { user_id: string; commission_rate: number } | null;
  if (!aff || aff.user_id === user.id) return;
  const first = must(await db().from("affiliate_events").select("created_at").eq("kind", "payment").eq("referred_user_id", user.id).order("created_at").limit(1).maybeSingle()) as { created_at: string } | null;
  if (first && Date.now() - new Date(first.created_at).getTime() > 365 * 86_400_000) return; // 12 mois maximum
  const net = amountCents / 1.2; // montant hors TVA (approximation au taux français)
  await db().from("affiliate_events").upsert(
    { code: user.referred_by, kind: "payment", amount_cents: Math.round(net * Number(aff.commission_rate)), referred_user_id: user.id, external_id: externalId },
    { onConflict: "external_id", ignoreDuplicates: true },
  );
}

// Les factures sont dans l'admin Shopify du marchand : on n'en liste pas ici.
export async function billingFor(user: UserRow): Promise<{ subscription: Subscription; invoices: Invoice[] }> {
  const row = must(await db().from("subscriptions").select("*").eq("user_id", user.id).maybeSingle()) as Record<string, any> | null;
  const subscription: Subscription = row
    ? { plan: row.plan, status: row.status, interval: row.interval, renewsAt: row.current_period_end, cancelAtPeriodEnd: row.cancel_at_period_end }
    : { plan: user.plan, status: "active", interval: null, renewsAt: null, cancelAtPeriodEnd: false };
  return { subscription, invoices: [] };
}

// Désinstallation de l'app : Shopify arrête la facturation, l'utilisateur repasse sans abonnement.
export async function endSubscriptionForShop(shop: string) {
  const rows = must(await db().from("subscriptions").select("user_id").eq("shop_domain", shop)) as { user_id: string }[];
  for (const r of rows) {
    await db().from("subscriptions").update({ plan: "free", status: "canceled", updated_at: new Date().toISOString() }).eq("user_id", r.user_id);
    await db().from("users").update({ plan: "free" }).eq("id", r.user_id);
  }
}
