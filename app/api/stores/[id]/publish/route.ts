import { after } from "next/server";
import { z } from "zod";
import { ownedStore, requireUser } from "@/lib/server/auth";
import { body, HttpError, json, route } from "@/lib/server/http";
import { createJob, PUBLISH_STEPS, runPublish } from "@/lib/server/jobs";
import { toJob } from "@/lib/server/mappers";
import { connectionFor } from "@/lib/server/shopify";
import { db } from "@/lib/server/supabase";

export const maxDuration = 300;

export const POST = route<{ params: Promise<{ id: string }> }>(async (req, { params }) => {
  const user = await requireUser();
  const store = await ownedStore(user.id, (await params).id);
  const { publishTheme } = await body(req, z.object({ publishTheme: z.boolean() }));
  void publishTheme; // le thème reste celui de la boutique (voir docs/BACKEND.md, section Shopify)
  if (!store.plan) throw new HttpError(409, "conflict", "La boutique est encore en cours de génération.");
  if (store.status === "publishing") throw new HttpError(409, "conflict", "Une publication est déjà en cours.");
  await connectionFor(user.id, store.shop_connection_id);
  await db().from("stores").update({ status: "publishing" }).eq("id", store.id);
  const job = await createJob(store.id, user.id, "publish", PUBLISH_STEPS);
  after(() => runPublish(job, store));
  return json({ job: toJob(job) }, 202);
});
