import { ownedStore, requireUser } from "@/lib/server/auth";
import { json, route } from "@/lib/server/http";
import { toAsset } from "@/lib/server/mappers";
import { db, must } from "@/lib/server/supabase";

export const GET = route<{ params: Promise<{ id: string }> }>(async (_req, { params }) => {
  const user = await requireUser();
  const store = await ownedStore(user.id, (await params).id);
  const rows = must(await db().from("assets").select("*").eq("store_id", store.id).order("created_at", { ascending: false })) as Record<string, any>[];
  return json({ assets: rows.map(toAsset) });
});
