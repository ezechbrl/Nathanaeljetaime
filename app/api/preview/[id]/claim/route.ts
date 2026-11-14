import { cookies } from "next/headers";
import { requireUser } from "@/lib/server/auth";
import { safeEqual } from "@/lib/server/crypto";
import { HttpError, json, notFound, route } from "@/lib/server/http";
import { toStore } from "@/lib/server/mappers";
import { db, must } from "@/lib/server/supabase";

// Rattache l'aperçu créé sans compte au compte qui vient de se connecter : il devient une boutique
// « à débloquer » (paiement), comme un aperçu créé depuis l'app.
export const POST = route<{ params: Promise<{ id: string }> }>(async (_req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw notFound();
  const row = must(await db().from("previews").select("*").eq("id", id).maybeSingle()) as Record<string, any> | null;
  if (!row) throw notFound();
  if (row.store_id) {
    if (row.claimed_by !== user.id) throw notFound();
    const store = must(await db().from("stores").select("*").eq("id", row.store_id).maybeSingle());
    if (store) return json({ store: toStore(store as never) });
  }
  const token = (await cookies()).get(`vg_pv_${id}`)?.value ?? "";
  if (!token || !safeEqual(token, row.claim_token)) throw notFound();
  if (row.status !== "ready") throw new HttpError(409, "not_ready", "Ton aperçu n'est pas encore prêt.");
  const store = must(await db().from("stores").insert({
    user_id: user.id,
    name: row.name ?? "Ma boutique",
    niche: String(row.brief).slice(0, 80),
    language: row.language,
    mode: row.mode,
    brief: row.brief,
    source_url: row.source_url,
    status: "locked",
    teaser: row.teaser,
    theme: row.theme,
  }).select("*").single());
  await db().from("previews").update({ store_id: (store as { id: string }).id, claimed_by: user.id }).eq("id", id);
  await db().from("users").update({ free_store_used: true }).eq("id", user.id);
  return json({ store: toStore(store as never) }, 201);
});
