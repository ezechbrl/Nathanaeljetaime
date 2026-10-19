import { after } from "next/server";
import { ownedStore, requireUser } from "@/lib/server/auth";
import { env } from "@/lib/server/env";
import { HttpError, json, route } from "@/lib/server/http";
import { createJob, runRegenerateImages } from "@/lib/server/jobs";
import { toJob } from "@/lib/server/mappers";
import { rateLimit } from "@/lib/server/quota";

export const maxDuration = 300;

// Refait toutes les photos générées de la boutique (environ 0,30 $ de visuels).
export const POST = route<{ params: Promise<{ id: string }> }>(async (_req, { params }) => {
  const user = await requireUser();
  const store = await ownedStore(user.id, (await params).id);
  if (!env.falKey()) throw new HttpError(503, "not_configured", "La génération d'images n'est pas encore activée.");
  if (user.plan === "free") throw new HttpError(402, "subscription_required", "Choisis ton offre pour générer des images.");
  if (!store.plan) throw new HttpError(409, "conflict", "La boutique est encore en cours de génération.");
  await rateLimit(`regen:${user.id}`, 3, 3600);
  const job = await createJob(store.id, user.id, "image", [{ key: "images", label: "Nouvelles photos de la boutique" }]);
  after(() => runRegenerateImages(job, store));
  return json({ job: toJob(job) }, 202);
});
