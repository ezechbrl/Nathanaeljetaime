import "server-only";
import type { PlanId, Usage } from "@/lib/api/types";
import { HttpError } from "./http";
import { db, must } from "./supabase";

// Quotas par offre (doivent correspondre à lib/content/pricing.ts).
export const LIMITS: Record<PlanId, { stores: number; conversations: number; images: number; shops: number }> = {
  free: { stores: 1, conversations: 20, images: 10, shops: 1 },
  pro: { stores: 999, conversations: 500, images: 200, shops: 3 },
  agency: { stores: 999, conversations: 2000, images: 1000, shops: 10 },
};

export const period = () => new Date().toISOString().slice(0, 7);

export async function getUsage(userId: string, plan: PlanId): Promise<Usage> {
  const [u, stores] = await Promise.all([
    db().from("usage").select("conversations, images").eq("user_id", userId).eq("period", period()).maybeSingle(),
    db().from("stores").select("id", { count: "exact", head: true }).eq("user_id", userId),
  ]);
  const row = must(u) as { conversations: number; images: number } | null;
  const now = new Date();
  const l = LIMITS[plan];
  return {
    conversations: { used: row?.conversations ?? 0, limit: l.conversations },
    images: { used: row?.images ?? 0, limit: l.images },
    stores: { used: stores.count ?? 0, limit: l.stores },
    resetsAt: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString(),
  };
}

export async function assertQuota(userId: string, plan: PlanId, kind: "conversations" | "images" | "stores") {
  const u = await getUsage(userId, plan);
  if (u[kind].used >= u[kind].limit) {
    const what = { conversations: "messages à l'IA", images: "images", stores: "boutiques" }[kind];
    throw new HttpError(402, "quota_exceeded", `Tu as atteint la limite de ${what} de ton offre. Passe à l'offre supérieure pour continuer.`);
  }
}

export async function consume(userId: string, kind: "conversations" | "images", by = 1) {
  must(await db().rpc("increment_usage", { p_user: userId, p_period: period(), p_field: kind, p_by: by }));
}

// Limitation de débit stockée en base (fonctionne entre les instances serverless).
export async function rateLimit(key: string, max: number, windowSeconds: number) {
  const allowed = must(await db().rpc("hit_rate_limit", { p_key: key, p_window_seconds: windowSeconds, p_max: max })) as boolean;
  if (!allowed) throw new HttpError(429, "rate_limited", "Trop de tentatives, réessaie dans quelques minutes.");
}
