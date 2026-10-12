import { requireUser } from "@/lib/server/auth";
import { noContent, notFound, route } from "@/lib/server/http";
import { db, must } from "@/lib/server/supabase";

export const DELETE = route<{ params: Promise<{ id: string }> }>(async (_req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw notFound();
  const row = must(await db().from("assets").select("id, storage_path, stores!inner(user_id)").eq("id", id).eq("stores.user_id", user.id).maybeSingle()) as { id: string; storage_path: string | null } | null;
  if (!row) throw notFound();
  if (row.storage_path) await db().storage.from("assets").remove([row.storage_path]);
  await db().from("assets").delete().eq("id", id);
  return noContent();
});
