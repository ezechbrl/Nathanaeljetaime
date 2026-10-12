import "server-only";
import type { StorePlan } from "@/lib/store-schema";
import { decrypt, hmacHex, safeEqual } from "./crypto";
import { env } from "./env";
import { HttpError } from "./http";
import { db, must } from "./supabase";

export const SHOP_RE = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;

// Vérifie la signature HMAC des paramètres renvoyés par Shopify (OAuth).
export function verifyQueryHmac(params: URLSearchParams) {
  const hmac = params.get("hmac") ?? "";
  const message = [...params.entries()]
    .filter(([k]) => k !== "hmac" && k !== "signature")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  return safeEqual(hmacHex(env.shopifySecret(), message), hmac);
}

export function authorizeUrl(shop: string, state: string) {
  const u = new URL(`https://${shop}/admin/oauth/authorize`);
  u.searchParams.set("client_id", env.shopifyKey());
  u.searchParams.set("scope", env.shopifyScopes());
  u.searchParams.set("redirect_uri", `${env.appUrl()}/api/shopify/callback`);
  u.searchParams.set("state", state);
  return u.toString();
}

export async function exchangeCode(shop: string, code: string) {
  const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ client_id: env.shopifyKey(), client_secret: env.shopifySecret(), code }),
  });
  if (!res.ok) throw new HttpError(502, "upstream_error", "Shopify a refusé la connexion.");
  return (await res.json()) as { access_token: string; scope: string };
}

type Gql<T> = { data?: T; errors?: { message: string }[] | string };

export async function graphql<T>(shop: string, token: string, query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(`https://${shop}/admin/api/${env.shopifyApiVersion()}/graphql.json`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-shopify-access-token": token },
    body: JSON.stringify({ query, variables }),
  });
  if (res.status === 401 || res.status === 403) {
    await db().from("shop_connections").update({ status: "error" }).eq("shop_domain", shop);
    throw new HttpError(502, "upstream_error", "L'accès à ta boutique Shopify a expiré. Reconnecte-la dans les paramètres.");
  }
  if (!res.ok) throw new HttpError(502, "upstream_error", `Shopify a répondu ${res.status}.`);
  const json = (await res.json()) as Gql<T>;
  if (json.errors) throw new HttpError(502, "upstream_error", `Shopify : ${typeof json.errors === "string" ? json.errors : json.errors.map((e) => e.message).join(" ; ")}`);
  return json.data as T;
}

type UserError = { field: string[] | null; message: string };
function check(errors: UserError[] | undefined) {
  if (errors?.length) throw new HttpError(502, "upstream_error", `Shopify : ${errors.map((e) => e.message).join(" ; ")}`);
}

export async function connectionFor(userId: string, connectionId: string | null) {
  const q = db().from("shop_connections").select("*").eq("user_id", userId).eq("status", "active");
  const row = must(await (connectionId ? q.eq("id", connectionId) : q.order("created_at")).limit(1).maybeSingle()) as Record<string, any> | null;
  if (!row?.access_token_encrypted) throw new HttpError(409, "no_shop", "Connecte d'abord une boutique Shopify dans les paramètres.");
  return { id: row.id as string, shop: row.shop_domain as string, token: decrypt(row.access_token_encrypted) };
}

export async function shopInfo(shop: string, token: string) {
  const d = await graphql<{ shop: { name: string; email: string; shopOwnerName: string } }>(shop, token, `{ shop { name email shopOwnerName } }`);
  return d.shop;
}

// Lit le contenu d'une boutique existante (mode « refonte »).
export async function readStoreContent(shop: string, token: string) {
  const d = await graphql<{
    shop: { name: string; description: string | null };
    products: { nodes: { title: string; descriptionHtml: string; priceRangeV2: { minVariantPrice: { amount: string; currencyCode: string } } }[] };
    pages: { nodes: { title: string; body: string }[] };
  }>(shop, token, `{
    shop { name description }
    products(first: 5, sortKey: UPDATED_AT, reverse: true) { nodes { title descriptionHtml priceRangeV2 { minVariantPrice { amount currencyCode } } } }
    pages(first: 5) { nodes { title body } }
  }`);
  const strip = (h: string) => h.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 1500);
  return [
    `Boutique : ${d.shop.name}. ${d.shop.description ?? ""}`,
    ...d.products.nodes.map((p) => `Produit : ${p.title} (${p.priceRangeV2.minVariantPrice.amount} ${p.priceRangeV2.minVariantPrice.currencyCode}) — ${strip(p.descriptionHtml)}`),
    ...d.pages.nodes.map((p) => `Page : ${p.title} — ${strip(p.body)}`),
  ].join("\n").slice(0, 15000);
}

const faqHtml = (plan: StorePlan) =>
  [...plan.faq, ...plan.strategy.objections.map((o) => ({ question: o.objection, answer: o.answer }))]
    .map((f) => `<h3>${escapeHtml(f.question)}</h3><p>${escapeHtml(f.answer)}</p>`)
    .join("");

const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export type ShopifyIds = { productId?: string; productHandle?: string; aboutPageId?: string; faqPageId?: string };

// Envoie le contenu de la boutique dans Shopify. Crée les objets la première fois, les met à jour ensuite.
export async function publish(shop: string, token: string, plan: StorePlan, imageUrls: string[], ids: ShopifyIds, onStep: (key: string) => Promise<void>): Promise<ShopifyIds> {
  const next: ShopifyIds = { ...ids };
  const productInput = {
    title: plan.product.title,
    descriptionHtml: plan.product.descriptionHtml,
    tags: plan.product.tags,
    seo: { title: plan.product.seoTitle, description: plan.product.seoDescription },
  };

  await onStep("product");
  if (next.productId) {
    const d = await graphql<{ productUpdate: { product: { id: string; handle: string } | null; userErrors: UserError[] } }>(shop, token,
      `mutation ($product: ProductUpdateInput!) { productUpdate(product: $product) { product { id handle } userErrors { field message } } }`,
      { product: { id: next.productId, ...productInput } });
    check(d.productUpdate.userErrors);
    next.productHandle = d.productUpdate.product?.handle ?? next.productHandle;
  } else {
    const d = await graphql<{ productCreate: { product: { id: string; handle: string } | null; userErrors: UserError[] } }>(shop, token,
      `mutation ($product: ProductCreateInput!, $media: [CreateMediaInput!]) { productCreate(product: $product, media: $media) { product { id handle } userErrors { field message } } }`,
      { product: { ...productInput, status: "ACTIVE" }, media: imageUrls.slice(0, 6).map((u) => ({ originalSource: u, mediaContentType: "IMAGE", alt: plan.product.title })) });
    check(d.productCreate.userErrors);
    next.productId = d.productCreate.product!.id;
    next.productHandle = d.productCreate.product!.handle;
  }

  // Prix sur la première variante.
  const v = await graphql<{ product: { variants: { nodes: { id: string }[] } } }>(shop, token,
    `query ($id: ID!) { product(id: $id) { variants(first: 1) { nodes { id } } } }`, { id: next.productId });
  const variantId = v.product.variants.nodes[0]?.id;
  if (variantId) {
    const d = await graphql<{ productVariantsBulkUpdate: { userErrors: UserError[] } }>(shop, token,
      `mutation ($productId: ID!, $variants: [ProductVariantsBulkInput!]!) { productVariantsBulkUpdate(productId: $productId, variants: $variants) { userErrors { field message } } }`,
      { productId: next.productId, variants: [{ id: variantId, price: plan.product.price, compareAtPrice: plan.product.compareAtPrice || null }] });
    check(d.productVariantsBulkUpdate.userErrors);
  }

  // Mise en vente sur la boutique en ligne.
  await onStep("publish");
  const pubs = await graphql<{ publications: { nodes: { id: string; name: string }[] } }>(shop, token, `{ publications(first: 20) { nodes { id name } } }`);
  const online = pubs.publications.nodes.find((p) => /online store|boutique en ligne/i.test(p.name));
  if (online) {
    const d = await graphql<{ publishablePublish: { userErrors: UserError[] } }>(shop, token,
      `mutation ($id: ID!, $input: [PublicationInput!]!) { publishablePublish(id: $id, input: $input) { userErrors { field message } } }`,
      { id: next.productId, input: [{ publicationId: online.id }] });
    check(d.publishablePublish.userErrors);
  }

  // Pages À propos et FAQ.
  await onStep("pages");
  const pages: [keyof ShopifyIds, string, string][] = [
    ["aboutPageId", plan.aboutPage.title, plan.aboutPage.bodyHtml],
    ["faqPageId", "FAQ", faqHtml(plan)],
  ];
  for (const [key, title, html] of pages) {
    if (next[key]) {
      const d = await graphql<{ pageUpdate: { userErrors: UserError[] } }>(shop, token,
        `mutation ($id: ID!, $page: PageUpdateInput!) { pageUpdate(id: $id, page: $page) { userErrors { field message } } }`,
        { id: next[key], page: { title, body: html, isPublished: true } });
      check(d.pageUpdate.userErrors);
    } else {
      const d = await graphql<{ pageCreate: { page: { id: string } | null; userErrors: UserError[] } }>(shop, token,
        `mutation ($page: PageCreateInput!) { pageCreate(page: $page) { page { id } userErrors { field message } } }`,
        { page: { title, body: html, isPublished: true } });
      check(d.pageCreate.userErrors);
      next[key] = d.pageCreate.page!.id as never;
    }
  }
  return next;
}

// Commandes des N derniers jours, agrégées par jour (revenus en centimes).
export async function dailyOrders(shop: string, token: string, days = 30) {
  const since = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
  const byDay = new Map<string, { orders: number; revenue: number }>();
  let cursor: string | null = null;
  for (let page = 0; page < 10; page++) {
    const d: { orders: { nodes: { createdAt: string; totalPriceSet: { shopMoney: { amount: string } } }[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } } = await graphql(shop, token,
      `query ($q: String!, $after: String) { orders(first: 250, after: $after, query: $q) { nodes { createdAt totalPriceSet { shopMoney { amount } } } pageInfo { hasNextPage endCursor } } }`,
      { q: `created_at:>=${since}`, after: cursor });
    for (const o of d.orders.nodes) {
      const day = o.createdAt.slice(0, 10);
      const cur = byDay.get(day) ?? { orders: 0, revenue: 0 };
      cur.orders += 1;
      cur.revenue += Math.round(Number(o.totalPriceSet.shopMoney.amount) * 100);
      byDay.set(day, cur);
    }
    if (!d.orders.pageInfo.hasNextPage) break;
    cursor = d.orders.pageInfo.endCursor;
  }
  return byDay;
}

// Visites par jour via ShopifyQL (scope read_reports). Renvoie une carte vide si indisponible.
export async function dailySessions(shop: string, token: string, days = 30) {
  const out = new Map<string, number>();
  try {
    const d = await graphql<{ shopifyqlQuery: { tableData?: { columns: { name: string }[]; rows: unknown } | null; parseErrors?: unknown } }>(shop, token,
      `query ($q: String!) { shopifyqlQuery(query: $q) { tableData { columns { name } rows } parseErrors } }`,
      { q: `FROM sessions SHOW sessions TIMESERIES day SINCE -${days}d UNTIL today` });
    const t = d.shopifyqlQuery.tableData;
    if (!t || !Array.isArray(t.rows)) return out;
    const cols = t.columns.map((c) => c.name);
    for (const row of t.rows as (Record<string, unknown> | unknown[])[]) {
      const get = (name: string) => (Array.isArray(row) ? row[cols.indexOf(name)] : (row as Record<string, unknown>)[name]);
      const day = String(get("day") ?? "").slice(0, 10);
      if (day) out.set(day, Number(get("sessions") ?? 0));
    }
  } catch (e) {
    console.warn("ShopifyQL indisponible :", (e as Error).message);
  }
  return out;
}
