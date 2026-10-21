import "server-only";
import { avg, fetchViaScraper, type RawReview, type RawReviews } from "@/lib/fetch-product-page";
import type { Reviews } from "@/lib/store-schema";
import { translateReviews } from "./ai";
import { storeImage } from "./images";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

// Avis AliExpress : la page produit n'en contient que la note, les avis détaillés viennent de l'API
// publique de la page « Avis » du produit. Lue en direct, puis via ScraperAPI si AliExpress bloque.
async function aliExpressReviews(productId: string): Promise<RawReviews | undefined> {
  const api = `https://feedback.aliexpress.com/pc/searchEvaluation.do?${new URLSearchParams({ productId, lang: "en_US", country: "FR", page: "1", pageSize: "50", filter: "all", sort: "complex_default" })}`;
  const direct = await fetch(api, { signal: AbortSignal.timeout(10_000), headers: { "user-agent": UA, referer: "https://www.aliexpress.com/", accept: "application/json" } })
    .then((r) => (r.ok ? r.text() : null)).catch(() => null);
  for (const body of [direct, direct?.trim().startsWith("{") ? null : await fetchViaScraper(api)]) {
    if (!body) continue;
    try {
      const data = JSON.parse(body)?.data;
      const list: any[] = data?.evaViewList ?? [];
      const stats = data?.productEvaluationStatistic ?? {};
      const items: RawReview[] = list.flatMap((r) => {
        const text = String(r.buyerTranslationFeedback || r.buyerFeedback || "").trim();
        const rating = Math.round(Number(r.buyerEval) / 20);
        if (text.length < 15 || !(rating >= 1 && rating <= 5)) return [];
        const name = String(r.buyerName ?? "").trim();
        return [{ author: !name || /aliexpress|shopper/i.test(name) ? "" : name, country: r.buyerCountry || undefined, rating, text, photo: [r.images ?? []].flat().find((u: unknown) => typeof u === "string") }];
      });
      const average = Number(stats.evarageStar ?? stats.averageStar);
      const total = Number(stats.totalNum ?? data?.totalNum);
      if (!items.length && !(average > 0)) continue;
      return { average: average >= 1 && average <= 5 ? average : avg(items), total: total > 0 ? total : items.length, items };
    } catch { /* réponse illisible : essai suivant */ }
  }
  return undefined;
}

// Avis réels des acheteurs du produit, chez le fournisseur : jamais inventés ni réécrits, seulement
// traduits dans la langue de la boutique. Les photos des clients sont recopiées dans le stockage Vigenia.
export async function supplierReviews(opts: { url: string; fromPage?: RawReviews; storeId: string; language: string; userId: string }): Promise<Reviews | undefined> {
  const id = opts.url.match(/aliexpress\.[a-z.]+\/item\/(?:[^/]*\/)?(\d{6,})/i)?.[1];
  const found = (id ? await aliExpressReviews(id).catch(() => undefined) : undefined) ?? opts.fromPage;
  if (!found || (!found.items.length && found.total < 1)) return undefined;
  // Les plus parlants d'abord : avec photo, bien notés, assez détaillés.
  const score = (r: RawReview) => (r.photo ? 2 : 0) + r.rating + Math.min(r.text.length, 300) / 300;
  const picked = [...found.items].sort((a, b) => score(b) - score(a)).slice(0, 9);
  // Traduction impossible : on garde la note, sans afficher d'avis dans une autre langue.
  const texts = picked.length ? await translateReviews(picked.map((r) => r.text), opts.language, opts.userId).catch(() => null) : [];
  const items = await Promise.all((texts ? picked : []).map(async (r, i) => ({
    author: r.author || "",
    country: r.country,
    rating: r.rating,
    text: texts?.[i] ?? "",
    photo: r.photo ? await rehost(opts.storeId, r.photo) : undefined,
  })));
  return { average: Math.round(found.average * 10) / 10, total: found.total, source: id ? "aliexpress" : new URL(opts.url).hostname, items: items.filter((r) => r.text) };
}

async function rehost(storeId: string, raw: string): Promise<string | undefined> {
  try {
    const url = new URL(raw.startsWith("//") ? `https:${raw}` : raw);
    if (url.protocol !== "https:") return undefined;
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000), headers: { "user-agent": UA } });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.startsWith("image/")) return undefined;
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.length > 8_000_000) return undefined;
    return (await storeImage(storeId, bytes, type, "review")).url;
  } catch {
    return undefined;
  }
}
