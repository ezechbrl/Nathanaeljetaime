import { z } from "zod";
import { ownedStore, requireUser } from "@/lib/server/auth";
import { body, json, noContent, route } from "@/lib/server/http";
import { toJob, toStore } from "@/lib/server/mappers";
import { db, must } from "@/lib/server/supabase";
import { StorePlanSchema } from "@/lib/store-schema";

type Ctx = { params: Promise<{ id: string }> };
const HEX = z.string().regex(/^#[0-9a-f]{6}$/i);

export const GET = route<Ctx>(async (_req, { params }) => {
  const user = await requireUser();
  const store = await ownedStore(user.id, (await params).id);
  const active = must(await db().from("jobs").select("*").eq("store_id", store.id).in("kind", ["generate", "recraft", "publish"]).in("status", ["queued", "running"]).order("created_at", { ascending: false }).limit(1).maybeSingle());
  // Boutique en échec : on renvoie la raison, pour l'afficher au marchand.
  const failed = store.status === "failed"
    ? (must(await db().from("jobs").select("error").eq("store_id", store.id).eq("status", "failed").order("created_at", { ascending: false }).limit(1).maybeSingle()) as { error: string | null } | null)
    : null;
  return json({ store: toStore(store), activeJob: active ? toJob(active as Record<string, any>) : null, lastError: failed?.error ?? null });
});

const Patch = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  theme: z.object({ colors: z.object({ primary: HEX, accent: HEX, background: HEX }), headingFont: z.string().max(60), bodyFont: z.string().max(60) }).optional(),
  plan: StorePlanSchema.optional(),
});

export const PATCH = route<Ctx>(async (req, { params }) => {
  const user = await requireUser();
  const store = await ownedStore(user.id, (await params).id);
  const input = await body(req, Patch);
  const updated = must(await db().from("stores").update({ ...input, updated_at: new Date().toISOString() }).eq("id", store.id).select("*").single());
  await db().from("store_versions").insert({ store_id: store.id, label: "Modification manuelle", snapshot: { plan: updated.plan, theme: updated.theme } });
  return json({ store: toStore(updated) });
});

export const DELETE = route<Ctx>(async (_req, { params }) => {
  const user = await requireUser();
  const store = await ownedStore(user.id, (await params).id);
  const assets = must(await db().from("assets").select("storage_path").eq("store_id", store.id)) as { storage_path: string | null }[];
  const paths = assets.map((a) => a.storage_path).filter(Boolean) as string[];
  if (paths.length) await db().storage.from("assets").remove(paths);
  await db().from("stores").delete().eq("id", store.id);
  return noContent();
});
