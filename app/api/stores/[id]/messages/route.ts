import { z } from "zod";
import { ownedStore, requireUser } from "@/lib/server/auth";
import { editPlan } from "@/lib/server/ai";
import { body, HttpError, json, route } from "@/lib/server/http";
import { toMessage, toStore } from "@/lib/server/mappers";
import { assertQuota, consume, rateLimit } from "@/lib/server/quota";
import { assertAiBudget } from "@/lib/server/budget";
import { db, must } from "@/lib/server/supabase";
import type { StorePlan } from "@/lib/store-schema";

export const maxDuration = 300;
type Ctx = { params: Promise<{ id: string }> };

export const GET = route<Ctx>(async (req, { params }) => {
  const user = await requireUser();
  const store = await ownedStore(user.id, (await params).id);
  const before = new URL(req.url).searchParams.get("before");
  let q = db().from("chat_messages").select("*").eq("store_id", store.id).order("created_at", { ascending: false }).limit(50);
  if (before) {
    const ref = must(await db().from("chat_messages").select("created_at").eq("id", before).maybeSingle()) as { created_at: string } | null;
    if (ref) q = q.lt("created_at", ref.created_at);
  }
  const rows = (must(await q) as Record<string, any>[]).reverse();
  const welcome = { id: "welcome", store_id: store.id, role: "assistant", changes: [], created_at: store.created_at, content: `Ta boutique ${store.name} est prête. Demande-moi n'importe quelle modification : un texte, une couleur, une offre, une section.` };
  return json({ messages: (before || rows.length ? rows : [welcome]).map(toMessage) });
});

// « Change la couleur principale en #e11d48 » : appliqué tout de suite, sans passer par l'IA.
const COLOR_REQUEST = /couleur (?:principale|de (?:la )?marque|du fond)[^#]{0,40}(#[0-9a-f]{6})\b/i;

// Même teinte, très foncée : sert au texte et aux bandeaux, toujours lisible sur un fond clair.
function deepShade(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => Math.round(c * 0.22));
  return `#${ch.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

function colorEdit(plan: StorePlan, hex: string) {
  const colors = { ...plan.brand.colors, accent: hex.toLowerCase(), primary: deepShade(hex) };
  const next = { ...plan, brand: { ...plan.brand, colors } };
  return {
    plan: next,
    reply: `C'est fait : la couleur principale est maintenant ${colors.accent}. Boutons, badges et fonds teintés ont changé sur l'accueil et la fiche produit.`,
    changes: [{ path: "brand.colors.accent", label: "Couleur principale", before: plan.brand.colors.accent, after: colors.accent }],
  };
}

export const POST = route<Ctx>(async (req, { params }) => {
  const user = await requireUser();
  const store = await ownedStore(user.id, (await params).id);
  if (!store.plan) throw new HttpError(409, "conflict", "La boutique est encore en cours de génération.");
  const { content } = await body(req, z.object({ content: z.string().trim().min(1).max(2000) }));
  // Chaque accès à la base est étiqueté : une erreur dit à quelle étape elle a eu lieu.
  const step = <T,>(label: string, fn: () => Promise<T>) => fn().catch((e: unknown) => { throw e instanceof Error && e.message.startsWith("Supabase") ? new Error(`${e.message} [${label}]`) : e; });
  await step("limite", () => rateLimit(`chat:${user.id}`, 20, 60));
  const color = content.match(COLOR_REQUEST)?.[1];
  let result: { plan: StorePlan; reply: string; changes: { path: string; label: string; before: string; after: string }[] };
  if (color) {
    result = colorEdit(store.plan as StorePlan, color);
  } else {
    await step("crédit", () => assertAiBudget(user.id, user.plan)); // abonnement requis + crédit d'IA
    await step("quota", () => assertQuota(user.id, user.plan, "conversations"));
    const history = (await step("historique", async () => must(await db().from("chat_messages").select("role, content").eq("store_id", store.id).order("created_at", { ascending: false }).limit(10))) as { role: "user" | "assistant"; content: string }[]).reverse();
    result = await step("IA", () => editPlan({ plan: store.plan as StorePlan, language: store.language, history, message: content, userId: user.id }));
    await step("compteur", () => consume(user.id, "conversations"));
  }

  const theme = { ...(store.theme as Record<string, unknown>), colors: result.plan.brand.colors };
  const updated = result.changes.length
    ? await step("boutique", async () => must(await db().from("stores").update({ plan: result.plan, theme, name: result.plan.brand.name, updated_at: new Date().toISOString() }).eq("id", store.id).select("*").single()))
    : store;
  if (result.changes.length) {
    await db().from("store_versions").insert({ store_id: store.id, label: result.changes.map((c) => c.label).join(", ").slice(0, 120), snapshot: { plan: result.plan, theme } });
  }
  const [userMessage, assistantMessage] = await step("messages", async () => must(await db().from("chat_messages").insert([
    // Horodatages distincts pour garder l'ordre question → réponse.
    { store_id: store.id, role: "user", content, changes: [], created_at: new Date(Date.now() - 1).toISOString() },
    { store_id: store.id, role: "assistant", content: result.reply, changes: result.changes, created_at: new Date().toISOString() },
  ]).select("*"))) as Record<string, any>[];
  return json({ userMessage: toMessage(userMessage), assistantMessage: toMessage(assistantMessage), store: toStore(updated) });
});
