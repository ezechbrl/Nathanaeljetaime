import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const MAX_CHARS = 20_000;
const BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

function isPrivateAddress(ip: string): boolean {
  if (ip.includes(":")) {
    const v = ip.toLowerCase();
    return v === "::1" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80") || v.startsWith("::ffff:");
  }
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 10 || a === 127 || a === 0 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127)
  );
}

// La page n'a pas pu être lue (site qui bloque les robots, captcha…) : le marchand peut ajouter des captures.
export class UnreadablePageError extends Error {}

async function assertPublic(url: URL) {
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new UnreadablePageError("Ce lien n'est pas une page web.");
  const host = url.hostname.replace(/^\[|\]$/g, "");
  const addresses = isIP(host) ? [host] : (await lookup(host, { all: true })).map((r) => r.address);
  if (addresses.some(isPrivateAddress)) throw new UnreadablePageError("Adresse non autorisée.");
}

// Suit les redirections à la main (liens courts AliExpress, versions par pays…) en revérifiant chaque adresse :
// le serveur ne doit jamais servir de relais vers un réseau privé.
async function fetchHtml(raw: string): Promise<{ html: string; url: string }> {
  let url = new URL(raw);
  for (let hop = 0; hop < 6; hop++) {
    await assertPublic(url);
    const res = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(12_000),
      headers: { "user-agent": BROWSER_UA, "accept-language": "fr-FR,fr;q=0.9,en;q=0.8", accept: "text/html,application/xhtml+xml" },
    });
    const next = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && next) { url = new URL(next, url); continue; }
    if (!res.ok) throw new UnreadablePageError(`La page a répondu ${res.status}.`);
    return { html: await res.text(), url: url.toString() };
  }
  throw new UnreadablePageError("Trop de redirections.");
}

// Service de lecture optionnel (ScraperAPI) pour les sites qui bloquent les serveurs, comme AliExpress.
export async function fetchViaScraper(url: string): Promise<string | null> {
  const key = process.env.SCRAPER_API_KEY;
  if (!key) return null;
  const api = new URL("https://api.scraperapi.com/");
  api.search = new URLSearchParams({ api_key: key, url, country_code: "fr", ...(/aliexpress|amazon|temu/i.test(url) ? { premium: "true" } : {}) }).toString();
  const res = await fetch(api, { signal: AbortSignal.timeout(70_000) }).catch(() => null);
  if (!res?.ok) {
    console.warn("Lecture via ScraperAPI impossible :", res?.status);
    return null;
  }
  return res.text();
}

const BLOCKED = /_____tmd_____|\/punish\?|captcha|robot check|are you a robot|access denied|enable javascript and cookies/i;

const decode = (s: string) => s
  .replace(/\\u002F/gi, "/").replace(/\\\//g, "/").replace(/\\"/g, '"')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ");

const meta = (html: string, name: string) => {
  const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]*content=["']([^"']*)["']`, "i"))
    ?? html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${name}["']`, "i"));
  return m ? decode(m[1]).trim() : "";
};

// Photo en pleine taille (les sites ajoutent souvent un suffixe de vignette, ex. « _220x220.jpg »).
const fullSize = (u: string) => {
  let url = decode(u).trim();
  if (url.startsWith("//")) url = `https:${url}`;
  return url.replace(/(\.(?:jpe?g|png|webp))_\d+x\d+[^/]*$/i, "$1").replace(/\._[A-Z0-9_,]+_(\.(?:jpe?g|png|webp))$/i, "$1");
};

function jsonLdProducts(html: string) {
  const out: Record<string, any>[] = [];
  for (const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const walk = (n: any) => {
        if (!n || typeof n !== "object") return;
        if (Array.isArray(n)) return n.forEach(walk);
        const t = n["@type"];
        if (t === "Product" || (Array.isArray(t) && t.includes("Product"))) out.push(n);
        if (n["@graph"]) walk(n["@graph"]);
      };
      walk(JSON.parse(m[1].trim()));
    } catch { /* bloc illisible ignoré */ }
  }
  return out;
}

// Avis tels que lus sur la page (langue d'origine), avant traduction.
export type RawReview = { author: string; country?: string; rating: number; text: string; photo?: string };
export type RawReviews = { average: number; total: number; items: RawReview[] };
export type ProductPage = { text: string; images: string[]; title: string; url: string; reviews?: RawReviews };

// Lit une page produit (la sienne ou celle d'un fournisseur : AliExpress, Amazon, CJ, boutique Shopify…)
// et en tire le titre, une description et les photos du produit, pour nourrir la génération.
export async function fetchProductPage(rawUrl: string): Promise<ProductPage> {
  let html = "";
  let url = rawUrl;
  try {
    ({ html, url } = await fetchHtml(rawUrl));
  } catch (e) {
    if (!(e instanceof UnreadablePageError) || /non autorisée|pas une page/.test(e.message)) throw e;
  }
  const blocked = () => BLOCKED.test(html.slice(0, 5000)) || html.length < 3000;
  if (blocked()) {
    const viaScraper = await fetchViaScraper(url);
    if (viaScraper) html = viaScraper;
  }
  if (blocked()) throw new UnreadablePageError("Ce site bloque la lecture automatique de sa page.");
  // Un lien AliExpress qui n'arrive pas sur une fiche produit (lien expiré → page d'accueil) n'est pas exploitable.
  if (/aliexpress\./i.test(url) && !/\/item\//i.test(url) && !/"imagePathList"|"productId"\s*:\s*"?\d{8,}/.test(html)) {
    throw new UnreadablePageError("Ce lien AliExpress ne mène pas à une fiche produit (lien expiré ou page d'accueil).");
  }

  return parseProductHtml(html, url);
}

// Extraction du titre, du texte et des photos d'une page produit déjà téléchargée.
export function parseProductHtml(html: string, url: string): ProductPage {
  const ld = jsonLdProducts(html);
  const title = meta(html, "og:title") || ld[0]?.name || decode(html.match(/"subject":"([^"]{5,300})"/)?.[1] ?? "") || decode(html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? "");

  const images = new Set<string>();
  const add = (u: unknown) => { if (typeof u === "string" && /^(https?:)?\/\//.test(u) && !/sprite|logo|icon|avatar|flag/i.test(u)) images.add(fullSize(u)); };
  for (const p of ld) [p.image].flat().forEach((i: any) => add(typeof i === "string" ? i : i?.url));
  add(meta(html, "og:image"));
  add(meta(html, "twitter:image"));
  // AliExpress : liste des photos du produit dans les données de la page.
  const list = html.match(/"imagePathList"\s*:\s*\[([^\]]*)\]/)?.[1];
  if (list) for (const m of list.matchAll(/"([^"]+)"/g)) add(m[1]);
  // Amazon : photos haute résolution.
  for (const m of html.matchAll(/"hiRes"\s*:\s*"([^"]+)"/g)) add(m[1]);
  if (images.size < 3) for (const m of html.matchAll(/(?:https?:)?\/\/(?:ae\d+\.alicdn\.com|ae-pic-[a-z0-9]+\.aliexpress-media\.com)\/kf\/[^"'\s\\)]+?\.(?:jpe?g|png|webp)/gi)) add(m[0]);

  const facts = [
    title && `Titre : ${title}`,
    meta(html, "og:description") && `Description : ${meta(html, "og:description")}`,
    meta(html, "description") && meta(html, "description") !== meta(html, "og:description") && `Résumé : ${meta(html, "description")}`,
    ...ld.slice(0, 1).flatMap((p) => [
      p.description && `Description détaillée : ${String(p.description).slice(0, 3000)}`,
      p.brand?.name && `Marque d'origine (à ne pas reprendre) : ${p.brand.name}`,
      p.offers && `Prix fournisseur : ${[p.offers].flat()[0]?.price ?? ""} ${[p.offers].flat()[0]?.priceCurrency ?? ""}`,
    ]),
    `Adresse : ${url}`,
  ].filter(Boolean).join("\n");

  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const text = `${facts}\n\nTexte de la page :\n${decode(body)}`.slice(0, MAX_CHARS);
  if (!title && body.length < 200) throw new UnreadablePageError("La page ne contient pas d'informations sur le produit.");
  return { text, images: [...images].slice(0, 6), title, url, reviews: pageReviews(html, ld) };
}

// Note et avis présents dans la page elle-même : données structurées (boutiques Shopify, Amazon…)
// ou statistiques AliExpress. Les avis détaillés AliExpress sont lus à part (lib/server/reviews.ts).
function pageReviews(html: string, ld: Record<string, any>[]): RawReviews | undefined {
  const p = ld.find((x) => x.aggregateRating || x.review);
  const items: RawReview[] = [];
  for (const r of [p?.review ?? []].flat().slice(0, 30)) {
    const text = decode(String(r?.reviewBody ?? r?.description ?? "")).trim();
    const rating = Number(r?.reviewRating?.ratingValue);
    const author = typeof r?.author === "string" ? r.author : r?.author?.name;
    if (text.length >= 10 && rating >= 1 && rating <= 5) items.push({ author: String(author ?? "").trim() || "Client", rating, text });
  }
  const agg = p?.aggregateRating;
  let average = Number(agg?.ratingValue);
  let total = Number(agg?.reviewCount ?? agg?.ratingCount);
  if (!(average > 0)) {
    // AliExpress : « averageStar » / « totalValidNum » dans les données de la page.
    average = Number(html.match(/"(?:averageStar|evarageStar)"\s*:\s*"?([\d.]+)/)?.[1]);
    total = Number(html.match(/"(?:totalValidNum|totalNum)"\s*:\s*"?(\d+)/)?.[1]);
  }
  if (!(average >= 1 && average <= 5)) return items.length ? { average: avg(items), total: items.length, items } : undefined;
  return { average, total: total > 0 ? total : items.length, items };
}

export const avg = (items: { rating: number }[]) => Math.round((items.reduce((s, r) => s + r.rating, 0) / items.length) * 10) / 10;

// Compatibilité : seulement le texte.
export async function fetchProductPageText(rawUrl: string): Promise<string> {
  return (await fetchProductPage(rawUrl)).text;
}
