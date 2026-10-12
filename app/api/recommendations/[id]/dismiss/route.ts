import { ownedStore, requireUser } from "@/lib/server/auth";
import { json, notFound, route } from "@/lib/server/http";
import { toRecommendation } from "@/lib/server/mappers";
import { db, must } from "@/lib/server/supabase";

export const POST = route<{ params: Promise<{ id: string }> }>(async (_req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const reco = must(await db().from("recommendations").select("store_id").eq("id", id).maybeSingle()) as { store_id: string } | null;
  if (!reco) throw notFound();
  await ownedStore(user.id, reco.store_id);
  const r = must(await db().from("recommendations").update({ status: "dismissed" }).eq("id", id).select("*").single());
  return json({ recommendation: toRecommendation(r) });
});
