import { after } from "next/server";
import { z } from "zod";
import { requireUser, type StoreRow } from "@/lib/server/auth";
import { badRequest, body, HttpError, json, route } from "@/lib/server/http";
import { createJob, GENERATE_STEPS, runGeneration, runTeaser, TEASER_STEPS } from "@/lib/server/jobs";
import { toJob, toStore } from "@/lib/server/mappers";
import { storeImage } from "@/lib/server/images";
import { assertQuota, rateLimit } from "@/lib/server/quota";
import { assertAiBudget } from "@/lib/server/budget";
import { connectionFor } from "@/lib/server/shopify";
import { db, must } from "@/lib/server/supabase";

export const maxDuration = 300; // la génération continue après la réponse (after)

export const GET = route(async () => {
  const user = await requireUser();
  const rows = must(await db().from("stores").select("*").eq("user_id", user.id).order("updated_at", { ascending: false })) as StoreRow[];
  return json({ stores: rows.map(toStore) });
});

const Input = z.object({
  mode: z.enum(["start", "link", "recraft"]),
  brief: z.string().trim().min(3, "Décris ton projet en une ou deux phrases.").max(4000),
  productUrl: z.string().trim().url("Lien invalide.").optional(),
  // Captures de la page produit (data URL JPEG/PNG/WebP compressées côté navigateur).
  screenshots: z.array(z.string().regex(/^data:image\/(jpeg|png|webp);base64,/, "Image invalide.").max(3_000_000, "Image trop lourde.")).max(3).optional(),
  language: z.string().trim().min(2).max(40),
  shopConnectionId: z.string().uuid().optional(),
});

export const POST = route(async (req) => {
  const user = await requireUser();
  const input = await body(req, Input);
  if (input.mode === "link" && !input.productUrl) throw badRequest("Colle le lien de la page produit.", "productUrl");
  await rateLimit(`generate:${user.id}`, 5, 3600);
  // Sans abonnement : une seule boutique d'aperçu (floutée), débloquée après le paiement.
  const teaser = user.plan === "free";
  if (teaser) {
    if (input.mode === "recraft" || user.free_store_used) throw new HttpError(402, "subscription_required", "Choisis ton offre pour créer ta boutique (sans engagement).");
    const claimed = must(await db().from("users").update({ free_store_used: true }).eq("id", user.id).eq("free_store_used", false).select("id")) as unknown[];
    if (!claimed.length) throw new HttpError(402, "subscription_required", "Choisis ton offre pour créer ta boutique (sans engagement).");
  } else {
    await assertAiBudget(user.id, user.plan); // abonnement requis
    await assertQuota(user.id, user.plan, "stores");
    if (input.mode === "recraft") await connectionFor(user.id, input.shopConnectionId ?? null);
  }

  const store = must(await db().from("stores").insert({
    user_id: user.id,
    shop_connection_id: input.shopConnectionId ?? null,
    name: "Nouvelle boutique",
    niche: input.brief.slice(0, 80),
    language: input.language,
    mode: input.mode,
    brief: input.brief,
    source_url: input.productUrl ?? null,
    status: "generating",
  }).select("*").single()) as StoreRow;
  const screenshots: string[] = [];
  for (const shot of input.screenshots ?? []) {
    const [head, b64] = shot.split(",");
    const type = head.match(/^data:(image\/[a-z]+);/)![1];
    screenshots.push((await storeImage(store.id, Buffer.from(b64, "base64"), type, "source")).url);
  }
  const job = await createJob(store.id, user.id, input.mode === "recraft" ? "recraft" : "generate", teaser ? TEASER_STEPS : GENERATE_STEPS, { screenshots, teaser });
  after(() => (teaser ? runTeaser(job, store) : runGeneration(job, store)));
  return json({ store: toStore(store), job: toJob(job) }, 201);
});
