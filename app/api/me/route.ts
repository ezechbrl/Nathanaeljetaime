import { z } from "zod";
import { requireUser, type UserRow } from "@/lib/server/auth";
import { body, HttpError, json, noContent, route } from "@/lib/server/http";
import { toUser } from "@/lib/server/mappers";
import { getUsage } from "@/lib/server/quota";
import { authClient, db, must } from "@/lib/server/supabase";
import { billingFor } from "@/lib/server/billing";

export const GET = route(async () => {
  const user = await requireUser();
  return json({ user: toUser(user), usage: await getUsage(user.id, user.plan) });
});

const Patch = z.object({
  firstName: z.string().trim().min(1).max(60).optional(),
  email: z.string().trim().email().optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

export const PATCH = route(async (req) => {
  const user = await requireUser();
  const input = await body(req, Patch);
  if (input.email && input.email !== user.email) {
    const supa = await authClient();
    const { error } = await supa.auth.updateUser({ email: input.email });
    if (error) throw new HttpError(400, "invalid_input", error.message, "email");
  }
  const row: UserRow = must(await db().from("users").update({
    ...(input.firstName !== undefined && { first_name: input.firstName }),
    ...(input.avatarUrl !== undefined && { avatar_url: input.avatarUrl }),
    updated_at: new Date().toISOString(),
  }).eq("id", user.id).select("*").single());
  return json({ user: toUser({ ...row, email_verified: user.email_verified }) });
});

export const DELETE = route(async (req) => {
  const user = await requireUser();
  const { confirm } = await body(req, z.object({ confirm: z.literal("SUPPRIMER") }));
  void confirm;
  // Stripe facture tant que l'abonnement est actif : il faut d'abord l'arrêter.
  const { subscription } = await billingFor(user);
  if (subscription.plan !== "free" && subscription.status !== "canceled") {
    throw new HttpError(409, "subscription_active", "Arrête d'abord ton abonnement depuis la page Abonnement, puis supprime ton compte.");
  }
  const assets = must(await db().from("assets").select("storage_path, stores!inner(user_id)").eq("stores.user_id", user.id)) as { storage_path: string | null }[];
  const paths = assets.map((a) => a.storage_path).filter(Boolean) as string[];
  if (paths.length) await db().storage.from("assets").remove(paths);
  await db().auth.admin.deleteUser(user.id); // supprime aussi toutes les données liées (on delete cascade)
  const supa = await authClient();
  await supa.auth.signOut();
  return noContent();
});
