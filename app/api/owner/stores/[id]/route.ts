import { json, notFound, route } from "@/lib/server/http";
import { toAsset, toStore } from "@/lib/server/mappers";
import { requireOwner } from "@/lib/server/owner";
import { db, must } from "@/lib/server/supabase";

// Pour le fondateur uniquement : voir la boutique d'un client (support), avec ses images et
// l'historique des créations (succès ou erreur).
export const GET = route<{ params: Promise<{ id: string }> }>(async (_req, { params }) => {
  await requireOwner();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw notFound();
  const row = must(await db().from("stores").select("*, users(email)").eq("id", id).maybeSingle()) as Record<string, any> | null;
  if (!row) throw notFound();
  const [assets, jobs] = await Promise.all([
    db().from("assets").select("*").eq("store_id", id).order("created_at"),
    db().from("jobs").select("kind, status, error, created_at, finished_at").eq("store_id", id).order("created_at"),
  ]);
  return json({
    store: toStore(row as never),
    email: row.users?.email ?? null,
    assets: (must(assets) as Record<string, any>[]).map(toAsset),
    jobs: must(jobs) as { kind: string; status: string; error: string | null; created_at: string; finished_at: string | null }[],
  });
});
