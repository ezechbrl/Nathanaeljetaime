import "server-only";
import { randomToken } from "./crypto";
import { env } from "./env";
import { HttpError } from "./http";
import { db, must } from "./supabase";

const SIZES = { "1:1": { width: 1024, height: 1024 }, "4:5": { width: 896, height: 1120 }, "16:9": { width: 1344, height: 768 } } as const;
export type AspectRatio = keyof typeof SIZES;

// Génère une image via fal.ai (FAL_KEY), puis la copie dans le stockage Supabase.
export async function generateImage(prompt: string, ratio: AspectRatio) {
  const key = env.falKey();
  if (!key) throw new HttpError(503, "not_configured", "La génération d'images n'est pas encore activée (FAL_KEY manquante).");
  const size = SIZES[ratio];
  const res = await fetch(`https://fal.run/${process.env.FAL_MODEL ?? "fal-ai/flux/dev"}`, {
    method: "POST",
    headers: { authorization: `Key ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ prompt, image_size: size, num_images: 1, enable_safety_checker: true }),
  });
  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).slice(0, 160);
    console.error("fal.ai", res.status, detail);
    throw new HttpError(502, "upstream_error", `Le service d'images a refusé la demande (code ${res.status}${res.status === 401 || res.status === 403 ? " : clé FAL_KEY invalide" : res.status === 402 || /balance|credit/i.test(detail) ? " : crédit fal.ai épuisé" : ""}).`);
  }
  const out = (await res.json()) as { images?: { url: string; content_type?: string }[] };
  const url = out.images?.[0]?.url;
  if (!url) throw new HttpError(502, "upstream_error", "Aucune image renvoyée.");
  const img = await fetch(url);
  return { bytes: new Uint8Array(await img.arrayBuffer()), contentType: img.headers.get("content-type") ?? "image/jpeg", ...size };
}

// Variante d'une image existante (même produit, nouvelle scène) via FLUX Kontext.
// Pas de repli sur une génération libre : elle inventerait un autre produit. En cas d'échec, la scène est
// simplement abandonnée (le thème se rabat sur les photos du produit).
const KONTEXT_RATIO: Record<AspectRatio, string> = { "1:1": "1:1", "4:5": "3:4", "16:9": "16:9" };
export async function editImage(referenceUrl: string, prompt: string, ratio: AspectRatio) {
  const key = env.falKey();
  if (!key) throw new HttpError(503, "not_configured", "La génération d'images n'est pas encore activée (FAL_KEY manquante).");
  const res = await fetch(`https://fal.run/${process.env.FAL_EDIT_MODEL ?? "fal-ai/flux-pro/kontext"}`, {
    method: "POST",
    headers: { authorization: `Key ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ prompt, image_url: referenceUrl, aspect_ratio: KONTEXT_RATIO[ratio], num_images: 1, output_format: "jpeg" }),
  });
  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).slice(0, 200);
    console.error("fal.ai kontext", res.status, detail);
    throw new HttpError(502, "upstream_error", `Retouche d'image refusée (code ${res.status}).`);
  }
  const out = (await res.json()) as { images?: { url: string; width?: number; height?: number }[] };
  const first = out.images?.[0];
  if (!first?.url) throw new HttpError(502, "upstream_error", "Aucune image renvoyée.");
  const img = await fetch(first.url);
  return { bytes: new Uint8Array(await img.arrayBuffer()), contentType: img.headers.get("content-type") ?? "image/jpeg", width: first.width ?? SIZES[ratio].width, height: first.height ?? SIZES[ratio].height };
}

export async function storeImage(storeId: string, bytes: Uint8Array, contentType: string, slot?: string) {
  const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
  const path = `${storeId}/${slot ? `${slot}-` : ""}${Date.now()}-${randomToken(6)}.${ext}`;
  must(await db().storage.from("assets").upload(path, bytes, { contentType, upsert: false }));
  const { data } = db().storage.from("assets").getPublicUrl(path);
  return { path, url: data.publicUrl };
}

// Emplacement d'un visuel dans la boutique, lu dans le nom du fichier (ex. « hero-… »).
export const SLOTS = ["packshot", "white", "studio", "detail", "inuse", "hero", "moment1", "moment2", "moment3", "story"] as const;
export type Slot = (typeof SLOTS)[number];
export function slotOf(asset: { storage_path?: string | null; kind: string }, productIndex = 0): Slot | null {
  const name = (asset.storage_path ?? "").split("/").pop() ?? "";
  const s = SLOTS.find((x) => name.startsWith(`${x}-`));
  if (s) return s;
  if (asset.kind === "banner") return "hero";
  if (asset.kind === "lifestyle") return "inuse";
  if (asset.kind === "product") return productIndex === 0 ? "packshot" : "detail";
  return null;
}
