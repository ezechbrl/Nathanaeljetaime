import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { HttpError } from "./http";
import { db, must } from "./supabase";

// Budget d'IA par client : au-delà, l'IA est bloquée 24 h pour lui, puis le compteur repart.
export const WEEKLY_AI_BUDGET_EUR = 5;
const USD_TO_EUR = 0.92; // à ajuster si le taux de change bouge beaucoup
const BUDGET_MICROS = WEEKLY_AI_BUDGET_EUR * 1_000_000;

// Tarifs Claude Opus 5.5, en dollars par million de tokens.
const PRICE = { input: 4, output: 20, cacheWrite: 5, cacheRead: 0.2 };

type UsageLike = Pick<Anthropic.Beta.BetaUsage, "input_tokens" | "output_tokens"> & {
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
};

// Coût réel d'une réponse, en millionièmes d'euro, à partir de l'usage renvoyé par l'API.
export function costMicros(u: UsageLike) {
  const usd =
    (u.input_tokens * PRICE.input + u.output_tokens * PRICE.output +
      (u.cache_creation_input_tokens ?? 0) * PRICE.cacheWrite + (u.cache_read_input_tokens ?? 0) * PRICE.cacheRead) / 1_000_000;
  return Math.ceil(usd * USD_TO_EUR * 1_000_000);
}

function blockedError(until: string) {
  const hours = Math.max(1, Math.ceil((new Date(until).getTime() - Date.now()) / 3_600_000));
  return new HttpError(429, "ai_budget_blocked", `Tu as atteint ta limite d'IA de ${WEEKLY_AI_BUDGET_EUR} € pour la semaine. Elle se débloque dans ${hours} h.`);
}

// Renvoie la fin du blocage si le client est bloqué, sinon null.
export async function aiBlockedUntil(userId: string): Promise<string | null> {
  return must(await db().rpc("ai_budget_check", { p_user: userId, p_budget: BUDGET_MICROS })) as string | null;
}

export async function assertAiBudget(userId: string) {
  const until = await aiBlockedUntil(userId);
  if (until) throw blockedError(until);
}

export async function chargeAi(userId: string, micros: number) {
  if (micros <= 0) return;
  must(await db().rpc("ai_budget_add", { p_user: userId, p_micros: micros, p_budget: BUDGET_MICROS }));
}

export async function aiBudgetStatus(userId: string) {
  const row = must(await db().from("users").select("ai_spent_micros, ai_window_start, ai_blocked_until").eq("id", userId).maybeSingle()) as
    { ai_spent_micros: number; ai_window_start: string; ai_blocked_until: string | null } | null;
  const now = Date.now();
  const blocked = row?.ai_blocked_until && new Date(row.ai_blocked_until).getTime() > now ? row.ai_blocked_until : null;
  const expired = !row || row.ai_blocked_until || new Date(row.ai_window_start).getTime() < now - 7 * 86_400_000;
  const spent = blocked ? BUDGET_MICROS : expired ? 0 : row!.ai_spent_micros;
  return {
    spentEur: Math.round(spent / 10_000) / 100,
    limitEur: WEEKLY_AI_BUDGET_EUR,
    blockedUntil: blocked,
    resetsAt: blocked ?? (expired ? null : new Date(new Date(row!.ai_window_start).getTime() + 7 * 86_400_000).toISOString()),
  };
}
