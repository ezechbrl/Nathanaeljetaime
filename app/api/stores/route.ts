import { after } from "next/server";
import { z } from "zod";
import { requireUser, type StoreRow } from "@/lib/server/auth";
import { badRequest, body, json, route } from "@/lib/server/http";
import { createJob, GENERATE_STEPS, runGeneration } from "@/lib/server/jobs";
import { toJob, toStore } from "@/lib/server/mappers";
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
  language: z.string().trim().min(2).max(40),
  shopConnectionId: z.string().uuid().optional(),
});

export const POST = route(async (req) => {
  const user = await requireUser();
  const input = await body(req, Input);
  if (input.mode === "link" && !input.productUrl) throw badRequest("Colle le lien de la page produit.", "productUrl");
  await rateLimit(`generate:${user.id}`, 5, 3600);
  await assertQuota(user.id, user.plan, "stores");
  await assertAiBudget(user.id);
  if (input.mode === "recraft") await connectionFor(user.id, input.shopConnectionId ?? null);

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
  const job = await createJob(store.id, user.id, input.mode === "recraft" ? "recraft" : "generate", GENERATE_STEPS);
  after(() => runGeneration(job, store));
  return json({ store: toStore(store), job: toJob(job) }, 201);
});
