import { ownedStore, requireUser } from "@/lib/server/auth";
import { json, notFound, route } from "@/lib/server/http";
import { toStore } from "@/lib/server/mappers";
import { db, must } from "@/lib/server/supabase";

export const POST = route<{ params: Promise<{ id: string; versionId: string }> }>(async (_req, { params }) => {
  const user = await requireUser();
  const { id, versionId } = await params;
  const store = await ownedStore(user.id, id);
  const v = must(await db().from("store_versions").select("*").eq("id", versionId).eq("store_id", store.id).maybeSingle()) as Record<string, any> | null;
  if (!v) throw notFound();
  const updated = must(await db().from("stores").update({ plan: v.snapshot.plan, theme: v.snapshot.theme, updated_at: new Date().toISOString() }).eq("id", store.id).select("*").single());
  await db().from("store_versions").insert({ store_id: store.id, label: `Restauration : ${v.label}`, snapshot: v.snapshot });
  return json({ store: toStore(updated) });
});
