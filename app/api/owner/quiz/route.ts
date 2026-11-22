import { json, route } from "@/lib/server/http";
import { requireOwner } from "@/lib/server/owner";
import { db, must } from "@/lib/server/supabase";

// Quiz (Ventes) : sur les 7 derniers jours, combien commencent, combien finissent, et où les autres s'arrêtent.
export const GET = route(async () => {
  await requireOwner();
  const since = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const runs = must(await db().from("quiz_runs").select("last_step, finished, max_index, total").gte("started_at", since).limit(5000)) as { last_step: string | null; finished: boolean; max_index: number; total: number | null }[];
  const stops: Record<string, number> = {};
  for (const r of runs) if (!r.finished) stops[r.last_step ?? "level"] = (stops[r.last_step ?? "level"] ?? 0) + 1;
  return json({ started: runs.length, finished: runs.filter((r) => r.finished).length, stops });
});
