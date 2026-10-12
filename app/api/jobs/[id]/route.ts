import { requireUser } from "@/lib/server/auth";
import { json, notFound, route } from "@/lib/server/http";
import { toJob } from "@/lib/server/mappers";
import { db, must } from "@/lib/server/supabase";

export const GET = route<{ params: Promise<{ id: string }> }>(async (_req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw notFound();
  const job = must(await db().from("jobs").select("*").eq("id", id).eq("user_id", user.id).maybeSingle()) as Record<string, any> | null;
  if (!job) throw notFound();
  // Une tâche bloquée plus de 10 minutes (fonction interrompue) est marquée en échec.
  if ((job.status === "queued" || job.status === "running") && Date.now() - new Date(job.created_at).getTime() > 10 * 60_000) {
    await db().from("jobs").update({ status: "failed", error: "La tâche a été interrompue. Réessaie.", finished_at: new Date().toISOString() }).eq("id", id);
    if (job.kind !== "image") await db().from("stores").update({ status: job.kind === "publish" ? "ready" : "failed" }).eq("id", job.store_id).in("status", ["generating", "publishing"]);
    return json({ job: toJob({ ...job, status: "failed", error: "La tâche a été interrompue. Réessaie." }) });
  }
  return json({ job: toJob(job) });
});
