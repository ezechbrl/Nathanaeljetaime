import { after } from "next/server";
import { z } from "zod";
import { ownedStore, requireUser } from "@/lib/server/auth";
import { env } from "@/lib/server/env";
import { body, HttpError, json, route } from "@/lib/server/http";
import { createJob, runImage } from "@/lib/server/jobs";
import { toJob } from "@/lib/server/mappers";
import { assertQuota, consume, rateLimit } from "@/lib/server/quota";

export const maxDuration = 120;

const Input = z.object({
  prompt: z.string().trim().min(5, "Décris l'image en quelques mots.").max(800),
  kind: z.enum(["product", "lifestyle", "banner", "logo"]),
  aspectRatio: z.enum(["1:1", "4:5", "16:9"]),
});

export const POST = route<{ params: Promise<{ id: string }> }>(async (req, { params }) => {
  const user = await requireUser();
  const store = await ownedStore(user.id, (await params).id);
  if (!env.falKey()) throw new HttpError(503, "not_configured", "La génération d'images n'est pas encore activée.");
  const input = await body(req, Input);
  await rateLimit(`image:${user.id}`, 10, 60);
  await assertQuota(user.id, user.plan, "images");
  await consume(user.id, "images");
  const job = await createJob(store.id, user.id, "image", [{ key: "images", label: "Génération de l'image" }], input);
  after(() => runImage(job, store.id));
  return json({ job: toJob(job) }, 202);
});
