import { after } from "next/server";
import { ownedStore, requireUser } from "@/lib/server/auth";
import { assertAiBudget } from "@/lib/server/budget";
import { HttpError, json, route } from "@/lib/server/http";
import { createJob, GENERATE_STEPS, runGeneration } from "@/lib/server/jobs";
import { toJob, toStore } from "@/lib/server/mappers";
import { db, must } from "@/lib/server/supabase";

export const maxDuration = 300; // la génération complète continue après la réponse

// Après l'abonnement : la boutique d'aperçu (floutée) devient une vraie boutique complète.
export const POST = route<{ params: Promise<{ id: string }> }>(async (_req, { params }) => {
  const user = await requireUser();
  const store = await ownedStore(user.id, (await params).id);
  if (store.status !== "locked") throw new HttpError(409, "conflict", "Cette boutique est déjà débloquée.");
  await assertAiBudget(user.id, user.plan); // abonnement requis
  // Une seule génération, même si le bouton est cliqué deux fois.
  const claimed = must(await db().from("stores").update({ status: "generating", updated_at: new Date().toISOString() }).eq("id", store.id).eq("status", "locked").select("*")) as typeof store[];
  if (!claimed.length) throw new HttpError(409, "conflict", "Le déblocage est déjà en cours.");
  const prev = must(await db().from("jobs").select("input").eq("store_id", store.id).order("created_at", { ascending: false }).limit(1).maybeSingle()) as { input?: { screenshots?: string[] } } | null;
  const job = await createJob(store.id, user.id, store.mode === "recraft" ? "recraft" : "generate", GENERATE_STEPS, { screenshots: prev?.input?.screenshots ?? [] });
  after(() => runGeneration(job, claimed[0]));
  return json({ store: toStore(claimed[0]), job: toJob(job) }, 202);
});
