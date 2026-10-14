import "server-only";
import type { StoreTheme } from "@/lib/api/types";
import type { JobStepKey } from "@/lib/api/types";
import type { StorePlan } from "@/lib/store-schema";
import { generatePages, generateStrategy } from "./ai";
import { fetchProductPageText } from "@/lib/fetch-product-page";
import { generateImage, storeImage, type AspectRatio } from "./images";
import { connectionFor, publish, readStoreContent, type ShopifyIds } from "./shopify";
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
    if (env.falKey()) {
      for (const [kind, ratio, prompt] of [
        ["product", "1:1", `Studio product photo of ${plan.product.title}, ${plan.product.subtitle}, clean background in ${plan.brand.colors.background}, soft light, e-commerce packshot, no text`],
        ["banner", "16:9", `Lifestyle hero photo for the brand ${plan.brand.name}: ${plan.strategy.promise}. Mood: ${plan.brand.tone}. Color palette ${plan.brand.colors.accent} and ${plan.brand.colors.background}, no text`],
      ] as const) {
        try {
          const img = await generateImage(prompt, ratio as AspectRatio);
          const saved = await storeImage(store.id, img.bytes, img.contentType);
          await db().from("assets").insert({ store_id: store.id, kind, storage_path: saved.path, url: saved.url, width: img.width, height: img.height, prompt });
        } catch (e) {
          console.warn("Image non générée :", errorMessage(e)); // la boutique reste utilisable sans visuel
        }
      }
    }

    await step("theme");
    const theme = { colors: plan.brand.colors, headingFont: FONTS[strategy.headingStyle], bodyFont: "DM Sans" };
    await db().from("stores").update({ plan, theme, name: plan.brand.name, status: "ready", updated_at: new Date().toISOString() }).eq("id", store.id);
    await db().from("store_versions").insert({ store_id: store.id, label: "Version initiale", snapshot: { plan, theme } });
    await finish(job.id, steps);
  } catch (e) {
    console.error("Génération échouée", e);
    await db().from("stores").update({ status: "failed", updated_at: new Date().toISOString() }).eq("id", store.id);
    await finish(job.id, steps, errorMessage(e));
  }
}

export async function runPublish(job: Record<string, any>, store: StoreRow) {
  const steps: Step[] = job.steps;
  const step = tracker(job.id, steps);
  const previousStatus = store.shopify && (store.shopify as ShopifyIds).productId ? "published" : "ready";
  try {
    const conn = await connectionFor(store.user_id, store.shop_connection_id);
    const assets = must(await db().from("assets").select("url, kind").eq("store_id", store.id).order("created_at")) as { url: string; kind: string }[];
    const images = assets.filter((a) => a.kind === "product" || a.kind === "upload" || a.kind === "lifestyle").map((a) => a.url);
    const ids = await publish(conn.shop, conn.token, store.plan as StorePlan, images, store.shopify as ShopifyIds, step, store.theme as StoreTheme | undefined);
    const liveUrl = ids.productHandle ? `https://${conn.shop}/products/${ids.productHandle}` : `https://${conn.shop}`;
    await db().from("stores").update({ shopify: ids, status: "published", live_url: liveUrl, shop_connection_id: conn.id, updated_at: new Date().toISOString() }).eq("id", store.id);
    await finish(job.id, steps);
  } catch (e) {
    console.error("Publication échouée", e);
    await db().from("stores").update({ status: previousStatus }).eq("id", store.id);
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
