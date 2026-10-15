import { ownedStore, requireUser } from "@/lib/server/auth";
import { editPlan } from "@/lib/server/ai";
import { HttpError, json, notFound, route } from "@/lib/server/http";
import { toRecommendation, toStore } from "@/lib/server/mappers";
import { assertQuota, consume } from "@/lib/server/quota";
import { assertAiBudget } from "@/lib/server/budget";
import { db, must } from "@/lib/server/supabase";
import type { StorePlan } from "@/lib/store-schema";

export const maxDuration = 300;

// Applique une recommandation en la rejouant comme une demande dans l'éditeur IA.
export const POST = route<{ params: Promise<{ id: string }> }>(async (_req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const reco = must(await db().from("recommendations").select("*").eq("id", id).maybeSingle()) as Record<string, any> | null;
  if (!reco) throw notFound();
  const store = await ownedStore(user.id, reco.store_id);
  if (!store.plan) throw new HttpError(409, "conflict", "La boutique n'est pas prête.");
  await assertQuota(user.id, user.plan, "conversations");
  await assertAiBudget(user.id, user.plan);
  const result = await editPlan({ plan: store.plan as StorePlan, language: store.language, history: [], message: reco.instruction || reco.title, userId: user.id });
  await consume(user.id, "conversations");
  const theme = { ...(store.theme as Record<string, unknown>), colors: result.plan.brand.colors };
  const updated = must(await db().from("stores").update({ plan: result.plan, theme, updated_at: new Date().toISOString() }).eq("id", store.id).select("*").single());
  await db().from("store_versions").insert({ store_id: store.id, label: `Recommandation : ${reco.title}`.slice(0, 120), snapshot: { plan: result.plan, theme } });
  await db().from("chat_messages").insert({ store_id: store.id, role: "assistant", content: `Recommandation appliquée : ${reco.title}. ${result.reply}`, changes: result.changes });
  const r = must(await db().from("recommendations").update({ status: "applied" }).eq("id", id).select("*").single());
  return json({ recommendation: toRecommendation(r), store: toStore(updated) });
});
