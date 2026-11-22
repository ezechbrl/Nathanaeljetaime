import { z } from "zod";
import { clientIp, noContent, route } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/quota";
import { db } from "@/lib/server/supabase";

// Avancée dans le quiz (anonyme) : la question atteinte la plus loin, et si le quiz a été fini.
const Input = z.object({
  id: z.string().regex(/^[a-z0-9]{12,40}$/),
  vid: z.string().regex(/^[a-z0-9]{12,40}$/).optional(),
  step: z.string().max(20),
  index: z.number().int().min(0).max(60),
  total: z.number().int().min(1).max(60),
  hasIdea: z.boolean().nullable().optional(),
  done: z.boolean().optional(),
});
const BOT = /bot|crawl|spider|headless|lighthouse|preview|curl|wget|python/i;

export const POST = route(async (req) => {
  if (BOT.test(req.headers.get("user-agent") ?? "")) return noContent();
  const x = Input.parse(await req.json().catch(() => ({})));
  try { await rateLimit(`quiz-track:${clientIp(req)}`, 120, 3600); } catch { return noContent(); }
  const { data: row } = await db().from("quiz_runs").select("max_index, finished").eq("id", x.id).maybeSingle();
  const now = new Date().toISOString();
  if (!row) {
    await db().from("quiz_runs").upsert({ id: x.id, visitor: x.vid ?? null, max_index: x.index, last_step: x.step, total: x.total, has_idea: x.hasIdea ?? null, finished: !!x.done, updated_at: now }, { onConflict: "id", ignoreDuplicates: true });
  } else if (x.index > row.max_index || (x.done && !row.finished)) {
    await db().from("quiz_runs").update({ max_index: Math.max(x.index, row.max_index), last_step: x.step, total: x.total, has_idea: x.hasIdea ?? null, finished: row.finished || !!x.done, updated_at: now }).eq("id", x.id);
  }
  return noContent();
});
