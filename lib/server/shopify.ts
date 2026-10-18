import "server-only";
import type { StoreTheme } from "@/lib/api/types";
import type { StorePlan } from "@/lib/store-schema";
import { bundleLabel } from "./theme/build";
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

// Webhook de désinstallation, enregistré boutique par boutique (le flux d'installation hérité ne permet
// pas de le déclarer dans shopify.app.toml). Une boutique déjà abonnée renvoie une erreur sans gravité.
export async function registerUninstallWebhook(shop: string, token: string) {
  await graphql(shop, token,
    `mutation ($uri: String!) { webhookSubscriptionCreate(topic: APP_UNINSTALLED, webhookSubscription: { uri: $uri, format: JSON }) { userErrors { message } } }`,
    { uri: `${env.appUrl()}/api/webhooks/shopify` });
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
  return { id: row.id as string, shop: row.shop_domain as string, token: decrypt(row.access_token_encrypted), scopes: String(row.scopes ?? "") };
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


export type ShopifyIds = { productId?: string; productHandle?: string; aboutPageId?: string; faqPageId?: string; aboutPageHandle?: string; faqPageHandle?: string; themeId?: string; files?: Record<string, { url: string; filename: string }>; bundleOption?: string; themeManual?: boolean; mediaIds?: string[]; mediaSources?: string[] };

// Envoie le contenu de la boutique dans Shopify. Crée les objets la première fois, les met à jour ensuite.
const rgb = (hex: string) => {
  const h = hex.replace("#", "").padEnd(6, "0");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) || 0);
};
const triplet = (hex: string) => rgb(hex).join(",");
// Texte lisible (blanc ou presque noir) sur une couleur donnée.
const onColor = (hex: string) => {
  const [r, g, b] = rgb(hex).map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? "18,18,18" : "255,255,255";
};

// Couleurs et polices de la marque, lues par l'extension de thème « Couleurs de marque »
// (métachamp de l'installation de l'app : aucun fichier du thème n'est modifié).
export async function saveBrandForTheme(shop: string, token: string, theme: StoreTheme) {
  const { currentAppInstallation } = await graphql<{ currentAppInstallation: { id: string } }>(shop, token, `{ currentAppInstallation { id } }`);
  const { colors } = theme;
  const value = {
    primaryRgb: triplet(colors.primary), onPrimaryRgb: onColor(colors.primary),
    accentRgb: triplet(colors.accent), onAccentRgb: onColor(colors.accent),
    backgroundRgb: triplet(colors.background), textRgb: onColor(colors.background) === "255,255,255" ? "245,245,245" : "24,24,24",
    headingFont: theme.headingFont, bodyFont: theme.bodyFont,
  };
  const d = await graphql<{ metafieldsSet: { userErrors: UserError[] } }>(shop, token,
    `mutation ($metafields: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $metafields) { metafields { id } userErrors { field message } } }`,
    { metafields: [{ ownerId: currentAppInstallation.id, namespace: "vitrio", key: "brand", type: "json", value: JSON.stringify(value) }] });
  check(d.metafieldsSet.userErrors);
}

// Met le produit en vente sur la boutique en ligne. Le titre du canal varie selon les boutiques
// (et le catalogue peut être illisible) : à défaut de le reconnaître, on publie sur tous les canaux.
type Pub = { id: string; name?: string | null; catalog: { title: string } | null };
async function publishToOnlineStore(shop: string, token: string, productId: string) {
  let nodes: Pub[];
  try {
    nodes = (await graphql<{ publications: { nodes: Pub[] } }>(shop, token, `{ publications(first: 50) { nodes { id name catalog { title } } } }`)).publications.nodes;
  } catch {
    nodes = (await graphql<{ publications: { nodes: Pub[] } }>(shop, token, `{ publications(first: 50) { nodes { id catalog { title } } } }`)).publications.nodes;
  }
  const isOnline = (p: Pub) => /online store|boutique en ligne|onlinestore/i.test(`${p.catalog?.title ?? ""} ${p.name ?? ""}`);
  const online = nodes.filter(isOnline);
  const targets = online.length ? online : nodes;
  if (!online.length) console.warn("Canal « Boutique en ligne » non reconnu, publication sur tous les canaux :", nodes.map((p) => p.catalog?.title ?? p.name));
  let ok = 0;
  let lastError: unknown = null;
  for (const p of targets) {
    try {
      const d = await graphql<{ publishablePublish: { userErrors: UserError[] } }>(shop, token,
        `mutation ($id: ID!, $input: [PublicationInput!]!) { publishablePublish(id: $id, input: $input) { userErrors { field message } } }`,
        { id: productId, input: [{ publicationId: p.id }] });
      check(d.publishablePublish.userErrors);
      ok += 1;
    } catch (e) {
      lastError = e;
      console.warn("Publication sur un canal refusée", p.catalog?.title ?? p.name, (e as Error).message);
    }
  }
  if (!ok && targets.length) throw lastError;
  if (!targets.length) throw new Error("Aucun canal de vente trouvé dans la boutique Shopify (vérifie que la Boutique en ligne est installée).");
}

export async function publish(shop: string, token: string, plan: StorePlan, images: { url: string; alt: string }[], ids: ShopifyIds, onStep: (key: string) => Promise<void>, theme?: StoreTheme): Promise<ShopifyIds> {
  const next: ShopifyIds = { ...ids };
  const productInput = {
    title: plan.product.title,
    descriptionHtml: plan.product.descriptionHtml,
    tags: plan.product.tags,
    seo: { title: plan.product.seoTitle, description: plan.product.seoDescription },
  };

  await onStep("product");
  // Garde-fous : jamais de produit à 0 € ni sans vrai nom sur une boutique en ligne.
  const unitPrice = parsePrice(plan.product.price);
  if (unitPrice <= 0) throw new HttpError(422, "invalid_plan", `Le prix du produit est vide ou à 0 € (« ${plan.product.price} »). Corrige-le dans l'éditeur IA (ex. « Mets le prix à 59,90 € »), puis republie.`);
  if (plan.product.title.trim().length < 3) throw new HttpError(422, "invalid_plan", `Le nom du produit est trop court (« ${plan.product.title} »). Corrige-le dans l'éditeur IA, puis republie.`);
  if (next.productId) {
    const d = await graphql<{ productUpdate: { product: { id: string; handle: string } | null; userErrors: UserError[] } }>(shop, token,
      `mutation ($product: ProductUpdateInput!) { productUpdate(product: $product) { product { id handle } userErrors { field message } } }`,
      { product: { id: next.productId, ...productInput } });
    check(d.productUpdate.userErrors);
    next.productHandle = d.productUpdate.product?.handle ?? next.productHandle;
    // Photos : si la sélection a changé (photos refaites…), on remplace celles posées par Vitrio
    // pour que la fiche Shopify montre exactement les photos du studio. Celles du marchand restent.
    const wanted = images.slice(0, 8);
    const same = next.mediaSources?.length === wanted.length && wanted.every((i, k) => next.mediaSources![k] === i.url);
    if (!same) {
      const m = await graphql<{ product: { media: { nodes: { id: string }[] } } }>(shop, token, `query ($id: ID!) { product(id: $id) { media(first: 50) { nodes { id } } } }`, { id: next.productId });
      // Boutiques publiées avant le suivi des photos : toutes les photos venaient de Vitrio.
      const ours = next.mediaIds ? m.product.media.nodes.filter((n) => next.mediaIds!.includes(n.id)) : m.product.media.nodes;
      if (ours.length) {
        const del = await graphql<{ productDeleteMedia: { mediaUserErrors: UserError[] } }>(shop, token,
          `mutation ($productId: ID!, $mediaIds: [ID!]!) { productDeleteMedia(productId: $productId, mediaIds: $mediaIds) { mediaUserErrors { field message } } }`,
          { productId: next.productId, mediaIds: ours.map((n) => n.id) });
        check(del.productDeleteMedia.mediaUserErrors);
      }
      if (wanted.length) {
        const u = await graphql<{ productUpdate: { product: { media: { nodes: { id: string }[] } } | null; userErrors: UserError[] } }>(shop, token,
          `mutation ($product: ProductUpdateInput!, $media: [CreateMediaInput!]) { productUpdate(product: $product, media: $media) { product { media(first: 50) { nodes { id } } } userErrors { field message } } }`,
          { product: { id: next.productId }, media: wanted.map((i) => ({ originalSource: i.url, mediaContentType: "IMAGE", alt: i.alt })) });
        check(u.productUpdate.userErrors);
        const kept = new Set(m.product.media.nodes.map((n) => n.id));
        next.mediaIds = (u.productUpdate.product?.media.nodes ?? []).map((n) => n.id).filter((id) => !kept.has(id));
      } else next.mediaIds = [];
      next.mediaSources = wanted.map((i) => i.url);
    }
  } else {
    const d = await graphql<{ productCreate: { product: { id: string; handle: string; media: { nodes: { id: string }[] } } | null; userErrors: UserError[] } }>(shop, token,
      `mutation ($product: ProductCreateInput!, $media: [CreateMediaInput!]) { productCreate(product: $product, media: $media) { product { id handle media(first: 50) { nodes { id } } } userErrors { field message } } }`,
      { product: { ...productInput, status: "ACTIVE" }, media: images.slice(0, 8).map((i) => ({ originalSource: i.url, mediaContentType: "IMAGE", alt: i.alt })) });
    check(d.productCreate.userErrors);
    next.productId = d.productCreate.product!.id;
    next.mediaIds = d.productCreate.product!.media.nodes.map((n) => n.id);
    next.mediaSources = images.slice(0, 8).map((i) => i.url);
    next.productHandle = d.productCreate.product!.handle;
  }

  // Prix sur la première variante.
  const v = await graphql<{ product: { variants: { nodes: { id: string }[] } } }>(shop, token,
    `query ($id: ID!) { product(id: $id) { variants(first: 1) { nodes { id } } } }`, { id: next.productId });
  const variantId = v.product.variants.nodes[0]?.id;
  if (variantId) {
    const d = await graphql<{ productVariantsBulkUpdate: { userErrors: UserError[] } }>(shop, token,
      `mutation ($productId: ID!, $variants: [ProductVariantsBulkInput!]!) { productVariantsBulkUpdate(productId: $productId, variants: $variants) { userErrors { field message } } }`,
      { productId: next.productId, variants: [{ id: variantId, price: unitPrice.toFixed(2), compareAtPrice: parsePrice(plan.product.compareAtPrice) > unitPrice ? parsePrice(plan.product.compareAtPrice).toFixed(2) : null, inventoryPolicy: "CONTINUE", inventoryItem: { tracked: false } }] });
    check(d.productVariantsBulkUpdate.userErrors);
  }

  // Offres par quantité : de vraies variantes Shopify, avec leur propre prix.
  if ((plan.product.bundles?.length ?? 0) > 1) {
    await syncBundles(shop, token, next.productId!, plan).then((name) => { next.bundleOption = name; }).catch((e) => console.warn("Offres par quantité non créées :", (e as Error).message));
  }

  // Mise en vente sur la boutique en ligne.
  await onStep("publish");
  await publishToOnlineStore(shop, token, next.productId!);

  // Couleurs et polices pour l'extension de thème (sans effet tant qu'elle n'est pas activée).
  if (theme) await saveBrandForTheme(shop, token, theme).catch((e) => console.error("Couleurs de marque", e));
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

// Installe le thème Vitrio de la boutique (archive générée par /api/shopify/theme) et, si demandé, le met en ligne.
// L'ancien thème Vitrio non publié est supprimé pour ne pas encombrer la bibliothèque de thèmes.
export async function installTheme(shop: string, token: string, opts: { zipUrl: string; name: string; publish: boolean; previousThemeId?: string }) {
  const c = await graphql<{ themeCreate: { theme: { id: string } | null; userErrors: UserError[] } }>(shop, token,
    `mutation ($source: URL!, $name: String!) { themeCreate(source: $source, name: $name, role: UNPUBLISHED) { theme { id } userErrors { field message } } }`,
    { source: opts.zipUrl, name: opts.name.slice(0, 50) });
  check(c.themeCreate.userErrors);
  const id = c.themeCreate.theme!.id;

  // Shopify télécharge et vérifie l'archive en arrière-plan.
  for (let i = 0; i < 40; i++) {
    const t = await graphql<{ theme: { processing: boolean; processingFailed: boolean } | null }>(shop, token, `query ($id: ID!) { theme(id: $id) { processing processingFailed } }`, { id });
    if (t.theme?.processingFailed) {
      await graphql(shop, token, `mutation ($id: ID!) { themeDelete(id: $id) { deletedThemeId } }`, { id }).catch(() => {});
      throw new HttpError(502, "upstream_error", "Shopify a refusé le thème Vitrio. Réessaie dans un instant.");
    }
    if (t.theme && !t.theme.processing) break;
    await new Promise((r) => setTimeout(r, 2000));
  }

  if (opts.publish) {
    const p = await graphql<{ themePublish: { userErrors: UserError[] } }>(shop, token,
      `mutation ($id: ID!) { themePublish(id: $id) { theme { id } userErrors { field message } } }`, { id });
    check(p.themePublish.userErrors);
  }

  if (opts.previousThemeId && opts.previousThemeId !== id) {
    const old = await graphql<{ theme: { role: string } | null }>(shop, token, `query ($id: ID!) { theme(id: $id) { role } }`, { id: opts.previousThemeId }).catch(() => null);
    if (old?.theme && old.theme.role !== "MAIN") {
      await graphql(shop, token, `mutation ($id: ID!) { themeDelete(id: $id) { deletedThemeId userErrors { field message } } }`, { id: opts.previousThemeId }).catch(() => {});
    }
  }
  return id;
}

// Visuels du thème (héros, moments, histoire) envoyés dans les fichiers Shopify, pour que le thème
// les référence (shopify://shop_images/…) et que le marchand puisse les changer dans l'éditeur.
export async function uploadSceneFiles(shop: string, token: string, scenes: Record<string, string>, known: Record<string, { url: string; filename: string }>, brand: string) {
  const out = { ...known };
  const slug = brand.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30) || "boutique";
  const todo = Object.entries(scenes).filter(([slot, url]) => out[slot]?.url !== url);
  if (!todo.length) return out;
  const files = todo.map(([slot, url]) => ({ slot, url, filename: `vitrio-${slug}-${slot}-${Math.random().toString(36).slice(2, 8)}.jpg` }));
  const d = await graphql<{ fileCreate: { files: { id: string }[] | null; userErrors: UserError[] } }>(shop, token,
    `mutation ($files: [FileCreateInput!]!) { fileCreate(files: $files) { files { id } userErrors { field message } } }`,
    { files: files.map((f) => ({ originalSource: f.url, filename: f.filename, contentType: "IMAGE", alt: `${brand} — ${f.slot}` })) });
  check(d.fileCreate.userErrors);
  // Le thème ne doit référencer que des fichiers prêts : on attend leur traitement (30 s maximum).
  const ids = (d.fileCreate.files ?? []).map((f) => f.id);
  let status: Record<string, string> = {};
  for (let i = 0; i < 15 && ids.length; i++) {
    const q = await graphql<{ nodes: ({ id: string; fileStatus: string } | null)[] }>(shop, token, `query ($ids: [ID!]!) { nodes(ids: $ids) { ... on MediaImage { id fileStatus } } }`, { ids });
    status = Object.fromEntries(q.nodes.filter(Boolean).map((n) => [n!.id, n!.fileStatus]));
    if (Object.values(status).every((v) => v === "READY" || v === "FAILED")) break;
    await new Promise((r) => setTimeout(r, 2000));
  }
  files.forEach((f, i) => { if (status[ids[i]] === "READY") out[f.slot] = { url: f.url, filename: f.filename }; });
  return out;
}

export const BUNDLE_OPTION = "Offre";
const money2 = (n: number) => (Math.round(n * 100) / 100).toFixed(2);

// Prix écrit par l'IA ou le marchand (« 59,90 », « 59.90 € ») → nombre ; 0 si illisible.
export const parsePrice = (v: string | undefined) => Number(String(v ?? "").replace(/[^\d,.]/g, "").replace(",", ".")) || 0;

export function bundlePrices(plan: StorePlan) {
  const unit = parsePrice(plan.product.price);
  const cmp = parsePrice(plan.product.compareAtPrice);
  const ref = cmp > unit ? cmp : unit;
  return (plan.product.bundles ?? []).map((b) => {
    const price = unit * b.quantity * (1 - b.discountPercent / 100);
    const compare = ref * b.quantity;
    return { ...b, label: bundleLabel(b), price: money2(price), compareAtPrice: compare > price + 0.001 ? money2(compare) : null };
  });
}

async function syncBundles(shop: string, token: string, productId: string, plan: StorePlan) {
  const offers = bundlePrices(plan);
  type Q = { product: { options: { id: string; name: string; optionValues: { name: string }[] }[]; variants: { nodes: { id: string; selectedOptions: { name: string; value: string }[] }[] } } };
  const read = () => graphql<Q>(shop, token, `query ($id: ID!) { product(id: $id) { options { id name optionValues { name } } variants(first: 50) { nodes { id selectedOptions { name value } } } } }`, { id: productId });
  let q = await read();
  const opt = q.product.options.find((o) => o.name === BUNDLE_OPTION);
  if (!opt) {
    if (q.product.options.length > 1 || (q.product.options[0] && q.product.options[0].name !== "Title")) return undefined; // le marchand a ses propres options : on n'y touche pas
    const d = await graphql<{ productOptionsCreate: { userErrors: UserError[] } }>(shop, token,
      `mutation ($id: ID!, $options: [OptionCreateInput!]!) { productOptionsCreate(productId: $id, options: $options, variantStrategy: CREATE) { userErrors { field message } } }`,
      { id: productId, options: [{ name: BUNDLE_OPTION, values: offers.map((o) => ({ name: o.label })) }] });
    check(d.productOptionsCreate.userErrors);
  } else {
    const missing = offers.filter((o) => !opt.optionValues.some((v) => v.name === o.label));
    if (missing.length) {
      const d = await graphql<{ productOptionUpdate: { userErrors: UserError[] } }>(shop, token,
        `mutation ($id: ID!, $option: OptionUpdateInput!, $add: [OptionValueCreateInput!]) { productOptionUpdate(productId: $id, option: $option, optionValuesToAdd: $add, variantStrategy: MANAGE) { userErrors { field message } } }`,
        { id: productId, option: { id: opt.id }, add: missing.map((o) => ({ name: o.label })) });
      check(d.productOptionUpdate.userErrors);
    }
  }
  q = await read();
  const updates = q.product.variants.nodes.flatMap((v) => {
    const value = v.selectedOptions.find((o) => o.name === BUNDLE_OPTION)?.value;
    const o = offers.find((x) => x.label === value);
    return o ? [{ id: v.id, price: o.price, compareAtPrice: o.compareAtPrice, inventoryPolicy: "CONTINUE", inventoryItem: { tracked: false } }] : [];
  });
  const existing = new Set(q.product.variants.nodes.map((v) => v.selectedOptions.find((o) => o.name === BUNDLE_OPTION)?.value));
  const toCreate = offers.filter((o) => !existing.has(o.label));
  if (toCreate.length) {
    const c = await graphql<{ productVariantsBulkCreate: { userErrors: UserError[] } }>(shop, token,
      `mutation ($id: ID!, $variants: [ProductVariantsBulkInput!]!) { productVariantsBulkCreate(productId: $id, variants: $variants) { userErrors { field message } } }`,
      { id: productId, variants: toCreate.map((o) => ({ optionValues: [{ optionName: BUNDLE_OPTION, name: o.label }], price: o.price, compareAtPrice: o.compareAtPrice, inventoryPolicy: "CONTINUE", inventoryItem: { tracked: false } })) });
    check(c.productVariantsBulkCreate.userErrors);
  }
  if (updates.length) {
    const d = await graphql<{ productVariantsBulkUpdate: { userErrors: UserError[] } }>(shop, token,
      `mutation ($productId: ID!, $variants: [ProductVariantsBulkInput!]!) { productVariantsBulkUpdate(productId: $productId, variants: $variants) { userErrors { field message } } }`,
      { productId, variants: updates });
    check(d.productVariantsBulkUpdate.userErrors);
  }
  return BUNDLE_OPTION;
}
