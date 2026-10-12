import { ownedStore, requireUser } from "@/lib/server/auth";
import { json, route } from "@/lib/server/http";
import { db, must } from "@/lib/server/supabase";

export const GET = route<{ params: Promise<{ id: string }> }>(async (_req, { params }) => {
  const user = await requireUser();
  const store = await ownedStore(user.id, (await params).id);
  const rows = must(await db().from("store_versions").select("id, label, created_at").eq("store_id", store.id).order("created_at", { ascending: false }).limit(50)) as Record<string, any>[];
  return json({ versions: rows.map((v) => ({ id: v.id, storeId: store.id, label: v.label, createdAt: v.created_at })) });
});
