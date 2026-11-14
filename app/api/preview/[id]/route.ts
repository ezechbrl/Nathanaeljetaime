import { json, notFound, route } from "@/lib/server/http";
import { db, must } from "@/lib/server/supabase";

// État d'un aperçu sans compte (identifiant impossible à deviner, contenu non sensible).
export const GET = route<{ params: Promise<{ id: string }> }>(async (_req, { params }) => {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw notFound();
  const row = must(await db().from("previews").select("id, status, name, teaser, theme, error, created_at, store_id").eq("id", id).maybeSingle()) as Record<string, any> | null;
  if (!row) throw notFound();
  // Préparation bloquée (fonction interrompue) : marquée en échec après 3 minutes.
  if (row.status === "generating" && Date.now() - new Date(row.created_at).getTime() > 3 * 60_000) {
    await db().from("previews").update({ status: "failed", error: "La préparation a été interrompue. Réessaie." }).eq("id", id);
    row.status = "failed";
    row.error = "La préparation a été interrompue. Réessaie.";
  }
  return json({ preview: { id: row.id, status: row.status, name: row.name, teaser: row.teaser, theme: row.theme, error: row.error, claimed: !!row.store_id } });
});
