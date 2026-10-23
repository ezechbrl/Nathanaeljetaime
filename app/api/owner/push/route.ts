import { z } from "zod";
import { body, noContent, route } from "@/lib/server/http";
import { requireOwner } from "@/lib/server/owner";
import { db, must } from "@/lib/server/supabase";

// Abonnement du téléphone du fondateur aux notifications push (app « Vigenia Ventes »).
const Sub = z.object({ endpoint: z.string().url(), keys: z.object({ p256dh: z.string(), auth: z.string() }) });

export const POST = route(async (req) => {
  const user = await requireOwner();
  const sub = await body(req, Sub);
  must(await db().from("push_subscriptions").upsert({ endpoint: sub.endpoint, keys: sub.keys, user_id: user.id }));
  return noContent();
});

export const DELETE = route(async (req) => {
  await requireOwner();
  const { endpoint } = await body(req, z.object({ endpoint: z.string().url() }));
  await db().from("push_subscriptions").delete().eq("endpoint", endpoint);
  return noContent();
});
