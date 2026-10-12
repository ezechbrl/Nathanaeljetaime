import { ownedStore, requireUser } from "@/lib/server/auth";
import { json, route } from "@/lib/server/http";
import { toRecommendation } from "@/lib/server/mappers";
import { db, must } from "@/lib/server/supabase";

export const GET = route<{ params: Promise<{ id: string }> }>(async (_req, { params }) => {
  const user = await requireUser();
  const store = await ownedStore(user.id, (await params).id);
  const [recos, insight] = await Promise.all([
    db().from("recommendations").select("*").eq("store_id", store.id).order("created_at", { ascending: false }).limit(30),
    db().from("insights").select("*").eq("store_id", store.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  const i = must(insight) as Record<string, any> | null;
  return json({
    recommendations: (must(recos) as Record<string, any>[]).map(toRecommendation),
    insight: i ? { storeId: store.id, summary: i.summary, createdAt: i.created_at } : null,
  });
});
