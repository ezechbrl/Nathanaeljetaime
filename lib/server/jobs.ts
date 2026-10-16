import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { StoreTheme } from "@/lib/api/types";
import type { JobStepKey } from "@/lib/api/types";
import type { StorePlan } from "@/lib/store-schema";
import { generatePages, generateStrategy } from "./ai";
import { fetchProductPage, UnreadablePageError } from "@/lib/fetch-product-page";
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
// Poids de chaque étape (≈ sa durée réelle) : la barre avance au rythme du travail, pas des étapes.
export const GENERATE_WEIGHTS: Partial<Record<JobStepKey, number>> = { strategy: 14, brand: 2, pages: 34, product: 2, images: 44, theme: 4 };
export const PUBLISH_WEIGHTS: Partial<Record<JobStepKey, number>> = { product: 45, publish: 25, theme: 30 };

type Tracker = ((key: JobStepKey) => Promise<void>) & { sub: (fraction: number) => Promise<void> };

function tracker(jobId: string, steps: Step[], weights: Partial<Record<JobStepKey, number>> = {}): Tracker {
  const w = (k: JobStepKey) => weights[k] ?? 1;
  const total = steps.reduce((n, s) => n + w(s.key), 0);
  let current = -1;
  let last = -1;
  const write = async (fraction: number) => {
    const before = steps.slice(0, Math.max(0, current)).reduce((n, s) => n + w(s.key), 0);
    // Jamais 100 % avant la vraie fin (finish).
    const progress = Math.min(99, Math.round((100 * (before + (current >= 0 ? w(steps[current].key) * fraction : 0))) / total));
    if (progress === last) return;
    last = progress;
    await db().from("jobs").update({ status: "running", steps, progress }).eq("id", jobId);
  };
  const step = (async (key: JobStepKey) => {
    current = steps.findIndex((s) => s.key === key);
    steps.forEach((s, j) => (s.status = j < current ? "done" : j === current ? "running" : s.status === "done" ? "done" : "pending"));
    last = -1;
    await write(0);
  }) as Tracker;
  step.sub = (fraction) => write(Math.max(0, Math.min(1, fraction))).catch(() => {});
  return step;
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
  const step = tracker(job.id, steps, GENERATE_WEIGHTS);
  try {
    await step("strategy");
    let sourceText: string | undefined;
    let sourceImages: string[] = [];
    let existingStore: string | undefined;
    const screenshots = ((job.input as { screenshots?: string[] } | null)?.screenshots ?? []).slice(0, 3);
    if (store.mode === "link" && store.source_url) {
      try {
        const page = await fetchProductPage(store.source_url);
        sourceText = page.text;
        sourceImages = page.images;
      } catch (e) {
        // Lien illisible (AliExpress bloque parfois) : on continue avec les captures ou la description.
        const hasBrief = store.brief.trim().length >= 25 && store.brief !== "Boutique à partir du lien produit";
        if (!screenshots.length && !hasBrief) {
          throw new Error(`On n'a pas pu lire ce lien${e instanceof UnreadablePageError ? ` (${e.message.replace(/\.$/, "")})` : ""}. Recommence en ajoutant 1 à 3 captures d'écran de la page produit, ou décris le produit en une phrase.`);
        }
        console.warn("Lien produit illisible, génération à partir des captures ou de la description :", (e as Error).message);
      }
    }
    if (store.mode === "recraft") {
      const conn = await connectionFor(store.user_id, store.shop_connection_id);
      existingStore = await readStoreContent(conn.shop, conn.token);
    }
    const strategy = await generateStrategy({ brief: store.brief, language: store.language, sourceText, screenshots, existingStore, userId: store.user_id });

    await step("brand");
    await db().from("stores").update({ name: strategy.brand.name, theme: { colors: strategy.brand.colors, headingFont: FONTS[strategy.headingStyle], bodyFont: "DM Sans" } }).eq("id", store.id);

    await step("pages");
    const plan: StorePlan = await generatePages({ brief: store.brief, language: store.language, strategy, sourceText, screenshots, userId: store.user_id }, (d, t) => void step.sub(d / t));
    if (sourceImages.length) plan.sourceImages = sourceImages;
    await step("product");

    await step("images");
    await generateStoreImages(store.id, plan, (d, t) => void step.sub(d / t), screenshots[0]);

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

// Visuels de la boutique : un packshot, puis des mises en scène construites à partir de ce packshot pour
// que le produit reste strictement le même partout. Jamais de personnes : seulement le produit, sur
// différents fonds et décors. Ce sont des illustrations IA : le marchand peut les remplacer par ses vraies photos.
export async function generateStoreImages(storeId: string, plan: StorePlan, onProgress?: (done: number, total: number) => void, screenshot?: string) {
  if (!env.falKey()) return;
  const c = plan.brand.colors;
  const look = plan.visual?.productLook || `${plan.product.title}, ${plan.product.subtitle}`;
  // Les descriptions de décor écrites par l'IA peuvent mentionner des gens : on retire ces passages.
  const PEOPLE = /\b(people|person|persons|man|men|woman|women|girl|boy|kid|kids|child|children|friends?|family|couple|gamers?|players?|users?|customers?|hands?|face|faces|someone|teen|teens|student|students|athlete|athletes|crowd|he|she|they)\b/i;
  const noPeople = (t: string) => t.split(/[.;,]/).map((x) => x.trim()).filter((x) => x && !PEOPLE.test(x)).join(", ");
  const scene = noPeople(plan.visual?.scene ?? "") || `${plan.brand.tone}, soft natural light`;
  const CLEAN = "photorealistic high-end commercial product photography, the product is the only subject, no people, no hands, no faces, no added text, no logos, no watermark";
  const save = async (slot: Slot, kind: string, img: { bytes: Uint8Array; contentType: string; width: number; height: number }, prompt: string) => {
    const saved = await storeImage(storeId, img.bytes, img.contentType, slot);
    await db().from("assets").insert({ store_id: storeId, kind, storage_path: saved.path, url: saved.url, width: img.width, height: img.height, prompt });
    return saved.url;
  };

  // 1. Packshot de référence, produit sans marque visible.
  const packPrompt = `Professional e-commerce studio packshot of ${look}. Plain unbranded product without any logo or lettering. Product centered, full view, on a seamless backdrop in ${c.background}, soft diffused light, subtle shadow, sharp focus, ${CLEAN}`;
  // Lien importé : le packshot part de la vraie photo du fournisseur (ou d'une capture de sa page),
  // nettoyée de ses textes et logos. Ainsi toutes les photos montrent le produit que le client recevra.
  const supplier = plan.sourceImages?.[0] ?? screenshot;
  const fromPhoto = `Isolate the main product shown in this image and turn it into a professional e-commerce studio packshot: the product alone, centered, full view, on a seamless backdrop in ${c.background}, soft diffused light, subtle shadow. Remove every text, price, badge, watermark, logo, sticker, hand, person and other object. Keep the product exactly as it is: same shape, colors, materials and details. ${CLEAN}`;
  let reference: string | undefined;
  if (supplier) {
    try {
      reference = await save("packshot", "product", await editImage(supplier, fromPhoto, "1:1"), fromPhoto);
    } catch (e) {
      console.warn("Packshot depuis la photo fournisseur impossible, génération à partir du texte :", errorMessage(e));
    }
  }
  try {
    reference ??= await save("packshot", "product", await generateImage(packPrompt, "1:1"), packPrompt);
  } catch (e) {
    console.warn("Packshot non généré :", errorMessage(e));
    return;
  }

  // 2. Mises en scène du même produit (aucune personne).
  const keep = "It must be the exact same product as in the reference image: same design, shape, proportions, colors, materials and details, only the camera angle and the setting change. Do not add any logo or text. Do not add any person or hand.";
  // Chaque photo montre le produit sous un angle franchement différent (le produit tourne, pas seulement le décor),
  // et dans un décor différent : pas tout sur un bureau.
  const shots: [Slot, string, AspectRatio, string][] = [
    ["white", "product", "1:1", `Rotate the product so it faces the camera straight on (front view). Place it on a clean pure white seamless background. Behind it, small blurred glowing LED light dots and sparkles in the brand color ${c.accent}, soft colored glow on the white surface, bright modern premium look. ${keep} ${CLEAN}`],
    ["studio", "product", "1:1", `Rotate the product to a strict side profile view (90 degrees from the front). It stands upright on a glossy pure black surface, pure black background, dramatic studio rim lighting outlining its silhouette, subtle reflection. ${keep} ${CLEAN}`],
    ["detail", "product", "1:1", `Extreme macro close-up on one characteristic part of this product, showing its materials, texture and finish, shallow depth of field, soft light. ${keep} ${CLEAN}`],
    ["inuse", "lifestyle", "4:5", `Top-down flat lay, camera directly above: the product lying flat on a textured surface (linen, slate or light wood) with a few tasteful related accessories around it, styled editorial composition, soft natural light. ${keep} ${CLEAN}`],
    ["hero", "banner", "16:9", `Wide cinematic shot: the product seen from a low angle, floating slightly above a minimal pedestal, abstract background with soft gradients in ${c.background} and ${c.accent}, light beams, product on the right third, generous empty space on the left. ${keep} ${CLEAN}`],
    ["moment1", "product", "1:1", `Rotate the product to show it from behind (rear three-quarter view), resting on a rough natural stone block, warm soft side light, neutral beige background. ${keep} ${CLEAN}`],
    ["moment2", "product", "1:1", `Show the product lying on its side (or folded flat if it can fold), seen from a high three-quarter angle, on a soft draped fabric in a muted tone close to ${c.background}, gentle window light. ${keep} ${CLEAN}`],
    ["moment3", "lifestyle", "16:9", `Wide atmospheric shot, ${scene}: the product seen from a slightly high front three-quarter angle, placed in an empty, tidy setting that fits the brand, warm evening light with subtle ${c.accent} accent lights, lots of space around it. Only the product and objects, nobody in the scene. ${keep} ${CLEAN}`],
  ];
  // Le packshot compte pour une photo ; chaque mise en scène terminée fait avancer la barre.
  let done = 1;
  onProgress?.(done, shots.length + 1);
  await Promise.all(shots.map(async ([slot, kind, ratio, prompt]) => {
    try {
      await save(slot, kind, await editImage(reference, prompt, ratio), prompt);
    } catch (e) {
      console.warn(`Image ${slot} non générée :`, errorMessage(e));
    }
    onProgress?.(++done, shots.length + 1);
  }));
}

// Refait toutes les photos générées d'une boutique (les photos importées par le marchand sont gardées).
export async function runRegenerateImages(job: Record<string, any>, store: StoreRow) {
  const steps: Step[] = job.steps;
  const step = tracker(job.id, steps, { images: 1 });
  try {
    await step("images");
    const old = must(await db().from("assets").select("id, kind, storage_path").eq("store_id", store.id).neq("kind", "upload").neq("kind", "logo")) as { id: string; kind: string; storage_path: string | null }[];
    if (old.length) {
      const paths = old.map((a) => a.storage_path).filter(Boolean) as string[];
      if (paths.length) await db().storage.from("assets").remove(paths);
      await db().from("assets").delete().in("id", old.map((a) => a.id));
    }
    await generateStoreImages(store.id, store.plan as StorePlan, (d, t) => void step.sub(d / t));
    await db().from("stores").update({ updated_at: new Date().toISOString() }).eq("id", store.id);
    await finish(job.id, steps);
  } catch (e) {
    await finish(job.id, steps, errorMessage(e));
  }
}

export async function runPublish(job: Record<string, any>, store: StoreRow) {
  const steps: Step[] = job.steps;
  const step = tracker(job.id, steps, PUBLISH_WEIGHTS);
  const previousStatus = store.shopify && (store.shopify as ShopifyIds).productId ? "published" : "ready";
  try {
    const conn = await connectionFor(store.user_id, store.shop_connection_id);
    const listAssets = async () => must(await db().from("assets").select("url, kind, storage_path").eq("store_id", store.id).order("created_at")) as { url: string; kind: string; storage_path: string | null }[];
    let assets = await listAssets();
    // Boutique créée avant l'activation des visuels : on les génère maintenant.
    if (!assets.some((a) => a.kind !== "upload" && a.kind !== "logo") && env.falKey()) {
      await step("product");
      await generateStoreImages(store.id, store.plan as StorePlan, (d, t) => void step.sub((d / t) * 0.6));
      assets = await listAssets();
    }
    const plan0 = store.plan as StorePlan;
    const title = plan0.product.title;
    // Photos du produit (galerie) : celles du marchand d'abord, puis packshot, détail, en situation.
    // Les autres visuels (héros, moments, histoire) vont dans les fichiers Shopify et dans le thème.
    let productIndex = 0;
    const tagged = assets.map((a) => ({ ...a, slot: a.kind === "upload" ? null : slotOf(a, a.kind === "product" ? productIndex++ : 0) }));
    const order: Record<string, number> = { upload: 0, packshot: 1, white: 2, studio: 3, moment1: 4, moment2: 5, detail: 6, inuse: 7 };
    const images = tagged
      .filter((a) => a.kind === "upload" || (a.slot && a.slot in order))
      .sort((x, y) => order[x.slot ?? "upload"] - order[y.slot ?? "upload"])
      .map((a) => ({ url: a.url, alt: a.slot === "detail" ? `${title} — détail` : a.slot === "inuse" ? `${title} — en situation` : title }));
    const sceneFiles: Partial<Record<Slot, string>> = {};
    for (const a of tagged) if (a.slot && !(a.slot in order)) sceneFiles[a.slot] = a.url; // le plus récent l'emporte
    const ids = await publish(conn.shop, conn.token, store.plan as StorePlan, images, store.shopify as ShopifyIds, (k) => step(k as JobStepKey), store.theme as StoreTheme | undefined);
    await step.sub(0.4);
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
    // Sans dérogation « thèmes » accordée par Shopify, l'installation automatique est interdite :
    // la publication réussit quand même et le marchand importe le thème (fichier .zip) en 3 clics.
    const noExemption = (e: unknown) => /access denied|exemption/i.test(errorMessage(e));
    try {
      const themeId = await install(true).catch((e) => {
        if (noExemption(e) || !Object.keys(ids.files ?? {}).length) throw e;
        console.warn("Thème refusé avec les visuels, nouvel essai sans :", errorMessage(e));
        return install(false);
      });
      await db().from("stores").update({ shopify: { ...ids, themeId, themeManual: false } }).eq("id", store.id);
    } catch (e) {
      if (!noExemption(e)) throw e;
      console.warn("Installation de thème non autorisée (dérogation Shopify manquante) : import manuel.");
      await db().from("stores").update({ shopify: { ...ids, themeManual: true } }).eq("id", store.id);
    }
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
