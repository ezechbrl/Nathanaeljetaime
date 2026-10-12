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
  const res = await fetch("https://fal.run/fal-ai/flux/schnell", {
    method: "POST",
    headers: { authorization: `Key ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ prompt, image_size: size, num_images: 1, enable_safety_checker: true }),
  });
  if (!res.ok) throw new HttpError(502, "upstream_error", "Le service d'images n'a pas répondu.");
  const out = (await res.json()) as { images?: { url: string; content_type?: string }[] };
  const url = out.images?.[0]?.url;
  if (!url) throw new HttpError(502, "upstream_error", "Aucune image renvoyée.");
  const img = await fetch(url);
  return { bytes: new Uint8Array(await img.arrayBuffer()), contentType: img.headers.get("content-type") ?? "image/jpeg", ...size };
}

export async function storeImage(storeId: string, bytes: Uint8Array, contentType: string) {
  const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
  const path = `${storeId}/${Date.now()}-${randomToken(6)}.${ext}`;
  must(await db().storage.from("assets").upload(path, bytes, { contentType, upsert: false }));
  const { data } = db().storage.from("assets").getPublicUrl(path);
  return { path, url: data.publicUrl };
}
