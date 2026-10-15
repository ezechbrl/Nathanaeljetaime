import "server-only";
import type { StoreTheme } from "@/lib/api/types";
import type { JobStepKey } from "@/lib/api/types";
import type { StorePlan } from "@/lib/store-schema";
import { generatePages, generateStrategy } from "./ai";
import { fetchProductPageText } from "@/lib/fetch-product-page";
import { generateImage, storeImage, type AspectRatio } from "./images";
import { connectionFor, installTheme, publish, readStoreContent, type ShopifyIds } from "./shopify";
import { themeZipUrl } from "./theme/link";
import { db, must } from "./supabase";
import type { StoreRow } from "./auth";
import { env } from "./env";

type Step = { key: JobStepKey; label: string; status: "pending" | "running" | "done" | "failed" };

export const GENERATE_STEPS: Omit<Step, "status">[] = [
  { key: "strategy", label: "Analyse du marché et de la promesse" },
  { key: "brand", label: "Identité de marque" },
  { key: "pages", label: "Page d'accueil, FAQ et pages" },
  { key: "product", label: "Fiche produit et SEO" },
  { key: "images", label: "Visuels" },
  { key: "theme", label: "Réglages du thème" },
];

export const PUBLISH_STEPS: Omit<Step, "status">[] = [
  { key: "product", label: "Produit, prix et images" },
  { key: "publish", label: "Mise en vente" },
  { key: "pages", label: "Pages À propos et FAQ" },
  { key: "theme", label: "Installation du thème Vitrio" },
];

export async function createJob(storeId: string, userId: string, kind: "generate" | "publish" | "image" | "recraft", steps: Omit<Step, "status">[], input: Record<string, unknown> = {}) {
  return must(await db().from("jobs").insert({ store_id: storeId, user_id: userId, kind, steps: steps.map((s) => ({ ...s, status: "pending" })), input }).select("*").single()) as Record<string, any>;
}

// Suivi de progression : chaque appel marque l'étape `key` en cours et les précédentes terminées.
function tracker(jobId: string, steps: Step[]) {
  return async (key: string) => {
    const i = steps.findIndex((s) => s.key === key);
    steps.forEach((s, j) => (s.status = j < i ? "done" : j === i ? "running" : s.status === "done" ? "done" : "pending"));
    await db().from("jobs").update({ status: "running", steps, progress: Math.round((i / steps.length) * 100) }).eq("id", jobId);
  };
}

async function finish(jobId: string, steps: Step[], error?: string) {
  steps.forEach((s) => { if (s.status !== "done") s.status = error ? (s.status === "running" ? "failed" : s.status) : "done"; });
  await db().from("jobs").update({ status: error ? "failed" : "succeeded", progress: error ? undefined : 100, steps, error: error ?? null, finished_at: new Date().toISOString() }).eq("id", jobId);
}

const errorMessage = (e: unknown) => (e instanceof Error && e.message ? e.message : "Erreur inattendue.");

const FONTS = { serif: "Instrument Serif", sans: "DM Sans" } as const;

// Génération complète d'une boutique. Exécutée après la réponse HTTP (voir `after()` dans la route).
export async function runGeneration(job: Record<string, any>, store: StoreRow) {
  const steps: Step[] = job.steps;
  const step = tracker(job.id, steps);
  try {
    await step("strategy");
    let sourceText: string | undefined;
    let existingStore: string | undefined;
    if (store.mode === "link" && store.source_url) sourceText = await fetchProductPageText(store.source_url);
    if (store.mode === "recraft") {
      const conn = await connectionFor(store.user_id, store.shop_connection_id);
      existingStore = await readStoreContent(conn.shop, conn.token);
    }
    const strategy = await generateStrategy({ brief: store.brief, language: store.language, sourceText, existingStore, userId: store.user_id });

    await step("brand");
    await db().from("stores").update({ name: strategy.brand.name, theme: { colors: strategy.brand.colors, headingFont: FONTS[strategy.headingStyle], bodyFont: "DM Sans" } }).eq("id", store.id);

    await step("pages");
    const plan: StorePlan = await generatePages({ brief: store.brief, language: store.language, strategy, sourceText, userId: store.user_id });
    await step("product");

    await step("images");
    await generateStoreImages(store.id, plan);

    await step("theme");
    const theme = { colors: plan.brand.colors, headingFont: FONTS[strategy.headingStyle], bodyFont: "DM Sans" };
    await db().from("stores").update({ plan, theme, name: plan.brand.name, status: "ready", updated_at: new Date().toISOString() }).eq("id", store.id);
    await db().from("store_versions").insert({ store_id: store.id, label: "Version initiale", snapshot: { plan, theme } });
    await db().from("users").update({ free_store_used: true }).eq("id", store.user_id); // boutique offerte utilisée (une seule fois)
    await finish(job.id, steps);
  } catch (e) {
    console.error("Génération échouée", e);
    await db().from("stores").update({ status: "failed", updated_at: new Date().toISOString() }).eq("id", store.id);
    await finish(job.id, steps, errorMessage(e));
  }
}

// Visuels de départ (packshot, détail, en situation, ambiance) : illustrations IA que le marchand
// remplacera idéalement par ses vraies photos. Sans FAL_KEY, la boutique reste utilisable sans visuel.
export async function generateStoreImages(storeId: string, plan: StorePlan) {
  if (!env.falKey()) return;
  const c = plan.brand.colors;
  const subject = `${plan.product.title} (${plan.product.subtitle})`;
  const shots: [string, AspectRatio, string][] = [
    ["product", "1:1", `Professional e-commerce studio packshot of ${subject}. Product centered, full view, on a seamless backdrop in ${c.background}, soft diffused light, subtle shadow, photorealistic, sharp focus, high-end catalog photography, no text, no logo`],
    ["product", "1:1", `Macro close-up photo showing the materials and finish of ${subject}. Shallow depth of field, natural light, photorealistic, premium catalog detail shot, no text, no logo`],
    ["lifestyle", "4:5", `Lifestyle photo of ${subject} being used in everyday life by the target customer (${plan.strategy.market}). Natural setting, warm natural light, candid, editorial magazine style, photorealistic, color accents ${c.accent}, no text, no logo`],
    ["banner", "16:9", `Wide editorial hero photograph for the brand ${plan.brand.name}: ${plan.strategy.promise}. Featuring ${subject} in a beautiful styled scene, mood: ${plan.brand.tone}. Palette ${c.background} and ${c.accent}, soft light, lots of negative space, photorealistic, no text, no logo`],
  ];
  await Promise.all(shots.map(async ([kind, ratio, prompt]) => {
    try {
      const img = await generateImage(prompt, ratio);
      const saved = await storeImage(storeId, img.bytes, img.contentType);
      await db().from("assets").insert({ store_id: storeId, kind, storage_path: saved.path, url: saved.url, width: img.width, height: img.height, prompt });
    } catch (e) {
      console.warn("Image non générée :", errorMessage(e));
    }
  }));
}

export async function runPublish(job: Record<string, any>, store: StoreRow) {
  const steps: Step[] = job.steps;
  const step = tracker(job.id, steps);
  const previousStatus = store.shopify && (store.shopify as ShopifyIds).productId ? "published" : "ready";
  try {
    const conn = await connectionFor(store.user_id, store.shop_connection_id);
    const listAssets = async () => must(await db().from("assets").select("url, kind").eq("store_id", store.id).order("created_at")) as { url: string; kind: string }[];
    let assets = await listAssets();
    // Boutique créée avant l'activation des visuels : on les génère maintenant.
    if (!assets.length && env.falKey()) {
      await step("product");
      await generateStoreImages(store.id, store.plan as StorePlan);
      assets = await listAssets();
    }
    const title = (store.plan as StorePlan).product.title;
    const brand = (store.plan as StorePlan).brand.name;
    const rank = { upload: 0, product: 1, lifestyle: 2, banner: 3 } as Record<string, number>;
    let productShots = 0;
    const images = assets
      .filter((a) => a.kind in rank)
      .sort((a, b) => rank[a.kind] - rank[b.kind])
      .map((a) => ({
        url: a.url,
        alt: a.kind === "banner" ? `${brand} — ambiance` : a.kind === "lifestyle" ? `${title} — en situation` : a.kind === "product" && productShots++ > 0 ? `${title} — détail` : title,
      }));
    const ids = await publish(conn.shop, conn.token, store.plan as StorePlan, images, store.shopify as ShopifyIds, step, store.theme as StoreTheme | undefined);
    const liveUrl = `https://${conn.shop}`;
    await db().from("stores").update({ shopify: ids, status: "published", live_url: liveUrl, shop_connection_id: conn.id, updated_at: new Date().toISOString() }).eq("id", store.id);

    // Thème Vitrio : produit et pages sont déjà enregistrés, un échec ici ne crée pas de doublon.
    await step("theme");
    const plan = store.plan as StorePlan;
    const themeId = await installTheme(conn.shop, conn.token, {
      zipUrl: themeZipUrl(store.id),
      name: `Vitrio · ${plan.brand.name}`,
      publish: Boolean((job.input as { publishTheme?: boolean } | null)?.publishTheme),
      previousThemeId: ids.themeId,
    });
    await db().from("stores").update({ shopify: { ...ids, themeId } }).eq("id", store.id);
    await finish(job.id, steps);
  } catch (e) {
    console.error("Publication échouée", e);
    const { data: now } = await db().from("stores").select("shopify").eq("id", store.id).maybeSingle();
    const saved = (now?.shopify ?? {}) as ShopifyIds;
    await db().from("stores").update({ status: saved.productId ? "published" : previousStatus }).eq("id", store.id);
    await finish(job.id, steps, errorMessage(e));
  }
}

export async function runImage(job: Record<string, any>, storeId: string) {
  const steps: Step[] = job.steps;
  const step = tracker(job.id, steps);
  const { prompt, kind, aspectRatio } = job.input as { prompt: string; kind: string; aspectRatio: AspectRatio };
  try {
    await step("images");
    const img = await generateImage(prompt, aspectRatio);
    const saved = await storeImage(storeId, img.bytes, img.contentType);
    await db().from("assets").insert({ store_id: storeId, kind, storage_path: saved.path, url: saved.url, width: img.width, height: img.height, prompt });
    await finish(job.id, steps);
  } catch (e) {
    await finish(job.id, steps, errorMessage(e));
  }
}
