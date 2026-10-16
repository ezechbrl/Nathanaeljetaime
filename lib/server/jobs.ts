import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { StoreTheme } from "@/lib/api/types";
import type { JobStepKey } from "@/lib/api/types";
import type { StorePlan } from "@/lib/store-schema";
import { generatePages, generateStrategy } from "./ai";
import { fetchProductPageText } from "@/lib/fetch-product-page";
import { editImage, generateImage, slotOf, storeImage, type AspectRatio, type Slot } from "./images";
import { connectionFor, installTheme, publish, readStoreContent, uploadSceneFiles, type ShopifyIds } from "./shopify";
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

// Message montré au marchand : jamais d'erreur technique brute de l'API Claude (en anglais, JSON).
// Le détail complet reste dans les journaux du serveur.
const errorMessage = (e: unknown) => {
  if (e instanceof Anthropic.APIError) {
    console.error("API Claude :", e.status, e.message);
    if (e.status === 400 && /credit balance/i.test(e.message)) return "L'IA de Vitrio est momentanément indisponible. Réessaie dans quelques minutes. (code : crédit IA)";
    if (e.status === 429 || e.status === 529 || (e.status ?? 0) >= 500) return "L'IA est très demandée en ce moment. Réessaie dans une minute.";
    return `L'IA n'a pas pu traiter la demande. Réessaie dans un instant. (code : ${e.status ?? "réseau"})`;
  }
  return e instanceof Error && e.message ? e.message : "Erreur inattendue.";
};

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

// Visuels de la boutique : un packshot, puis des scènes construites à partir de ce packshot
// pour que le produit garde la même apparence partout. Ce sont des illustrations IA : le marchand
// peut les remplacer par ses vraies photos. Sans FAL_KEY, la boutique reste utilisable sans visuel.
export async function generateStoreImages(storeId: string, plan: StorePlan) {
  if (!env.falKey()) return;
  const c = plan.brand.colors;
  const look = plan.visual?.productLook || `${plan.product.title}, ${plan.product.subtitle}`;
  const scene = plan.visual?.scene || `${plan.brand.tone}, soft natural light`;
  const NO_TEXT = "photorealistic, high-end commercial photography, no added text, no watermark";
  const save = async (slot: Slot, kind: string, img: { bytes: Uint8Array; contentType: string; width: number; height: number }, prompt: string) => {
    const saved = await storeImage(storeId, img.bytes, img.contentType, slot);
    await db().from("assets").insert({ store_id: storeId, kind, storage_path: saved.path, url: saved.url, width: img.width, height: img.height, prompt });
    return saved.url;
  };

  // 1. Packshot de référence.
  const packPrompt = `Professional e-commerce studio packshot of ${look}. Product centered, full view, on a seamless backdrop in ${c.background}, soft diffused light, subtle shadow, sharp focus, ${NO_TEXT}`;
  let reference: string;
  try {
    reference = await save("packshot", "product", await generateImage(packPrompt, "1:1"), packPrompt);
  } catch (e) {
    console.warn("Packshot non généré :", errorMessage(e));
    return;
  }

  // 2. Scènes avec le même produit.
  const keep = "Keep the exact same product (same shape, colors, materials, packaging and branding) as in the reference image.";
  const shots: [Slot, string, AspectRatio, string][] = [
    ["hero", "banner", "16:9", `Wide editorial hero photograph: the product placed in a beautiful styled scene. ${scene}. Brand palette ${c.background} and ${c.accent}. Product on the right third, generous empty space on the left for a headline, cinematic light. ${keep} ${NO_TEXT}`],
    ["detail", "product", "1:1", `Macro close-up of the product showing its materials, texture and finish, shallow depth of field. ${scene}. ${keep} ${NO_TEXT}`],
    ["inuse", "lifestyle", "4:5", `Lifestyle photo of the product being used by the target customer (${plan.strategy.market}) in everyday life, candid, natural light. ${scene}. ${keep} ${NO_TEXT}`],
    ...(plan.homepage.moments?.items ?? []).slice(0, 3).map((m, i) => [`moment${i + 1}` as Slot, "lifestyle", "4:5" as AspectRatio, `${m.imagePrompt}. ${scene}. ${keep} ${NO_TEXT}`] as [Slot, string, AspectRatio, string]),
  ];
  await Promise.all(shots.map(async ([slot, kind, ratio, prompt]) => {
    try {
      const img = await editImage(reference, prompt, ratio, `${prompt.replace(keep, "")} The product: ${look}.`);
      await save(slot, kind, img, prompt);
    } catch (e) {
      console.warn(`Image ${slot} non générée :`, errorMessage(e));
    }
  }));
}

export async function runPublish(job: Record<string, any>, store: StoreRow) {
  const steps: Step[] = job.steps;
  const step = tracker(job.id, steps);
  const previousStatus = store.shopify && (store.shopify as ShopifyIds).productId ? "published" : "ready";
  try {
    const conn = await connectionFor(store.user_id, store.shop_connection_id);
    const listAssets = async () => must(await db().from("assets").select("url, kind, storage_path").eq("store_id", store.id).order("created_at")) as { url: string; kind: string; storage_path: string | null }[];
    let assets = await listAssets();
    // Boutique créée avant l'activation des visuels : on les génère maintenant.
    if (!assets.some((a) => a.kind !== "upload" && a.kind !== "logo") && env.falKey()) {
      await step("product");
      await generateStoreImages(store.id, store.plan as StorePlan);
      assets = await listAssets();
    }
    const plan0 = store.plan as StorePlan;
    const title = plan0.product.title;
    // Photos du produit (galerie) : celles du marchand d'abord, puis packshot, détail, en situation.
    // Les autres visuels (héros, moments, histoire) vont dans les fichiers Shopify et dans le thème.
    let productIndex = 0;
    const tagged = assets.map((a) => ({ ...a, slot: a.kind === "upload" ? null : slotOf(a, a.kind === "product" ? productIndex++ : 0) }));
    const order: Record<string, number> = { upload: 0, packshot: 1, detail: 2, inuse: 3 };
    const images = tagged
      .filter((a) => a.kind === "upload" || (a.slot && a.slot in order))
      .sort((x, y) => order[x.slot ?? "upload"] - order[y.slot ?? "upload"])
      .map((a) => ({ url: a.url, alt: a.slot === "detail" ? `${title} — détail` : a.slot === "inuse" ? `${title} — en situation` : title }));
    const sceneFiles: Partial<Record<Slot, string>> = {};
    for (const a of tagged) if (a.slot && !(a.slot in order)) sceneFiles[a.slot] = a.url; // le plus récent l'emporte
    const ids = await publish(conn.shop, conn.token, store.plan as StorePlan, images, store.shopify as ShopifyIds, step, store.theme as StoreTheme | undefined);
    ids.files = await uploadSceneFiles(conn.shop, conn.token, sceneFiles, ids.files ?? {}, plan0.brand.name).catch((e) => {
      console.warn("Visuels du thème non envoyés :", errorMessage(e));
      return ids.files ?? {};
    });
    const liveUrl = `https://${conn.shop}`;
    await db().from("stores").update({ shopify: ids, status: "published", live_url: liveUrl, shop_connection_id: conn.id, updated_at: new Date().toISOString() }).eq("id", store.id);

    // Thème Vitrio : produit et pages sont déjà enregistrés, un échec ici ne crée pas de doublon.
    await step("theme");
    const plan = store.plan as StorePlan;
    const install = (withFiles: boolean) => installTheme(conn.shop, conn.token, {
      zipUrl: themeZipUrl(store.id, { withFiles }),
      name: `Vitrio · ${plan.brand.name}`,
      publish: Boolean((job.input as { publishTheme?: boolean } | null)?.publishTheme),
      previousThemeId: ids.themeId,
    });
    // Si Shopify refuse le thème à cause d'un visuel, on réessaie sans les visuels de scène.
    const themeId = await install(true).catch((e) => {
      if (!Object.keys(ids.files ?? {}).length) throw e;
      console.warn("Thème refusé avec les visuels, nouvel essai sans :", errorMessage(e));
      return install(false);
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
