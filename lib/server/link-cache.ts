import "server-only";
import { createHash } from "node:crypto";
import { fetchProductPage, type ProductPage } from "@/lib/fetch-product-page";
import { db } from "./supabase";

// Page produit gardée quelques heures après sa première lecture : la vérification du lien (au collage)
// et la génération qui suit ne paient qu'une seule lecture ScraperAPI.
const TTL_MS = 6 * 3600_000;
const pathFor = (url: string) => `link-cache/${createHash("sha256").update(url.trim()).digest("hex")}.json`;

export async function cachedProductPage(url: string): Promise<ProductPage> {
  const path = pathFor(url);
  try {
    const { data } = await db().storage.from("assets").download(path);
    if (data) {
      const saved = JSON.parse(await data.text()) as { at: number; page: ProductPage };
      if (Date.now() - saved.at < TTL_MS && saved.page?.text) return saved.page;
    }
  } catch { /* pas de copie : lecture normale */ }
  const page = await fetchProductPage(url);
  try {
    const bytes = new TextEncoder().encode(JSON.stringify({ at: Date.now(), page }));
    await db().storage.from("assets").upload(path, bytes, { contentType: "application/json", upsert: true });
  } catch (e) {
    console.warn("Copie de la page produit non enregistrée :", (e as Error).message);
  }
  return page;
}
