import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { HttpError } from "./http";
import { db, must } from "./supabase";

// Deux limites d'IA par client, comme Claude :
//   - une recharge toutes les 5 h : SESSION_AI_BUDGET_EUR par tranche de SESSION_HOURS heures ;
//   - WEEKLY_AI_BUDGET_EUR par semaine glissante, puis 24 h de pause.
export const WEEKLY_AI_BUDGET_EUR = 5;
export const SESSION_AI_BUDGET_EUR = 1;
export const SESSION_HOURS = 5;
const USD_TO_EUR = 0.92; // à ajuster si le taux de change bouge beaucoup
const BUDGET_MICROS = WEEKLY_AI_BUDGET_EUR * 1_000_000;
const SESSION_MICROS = SESSION_AI_BUDGET_EUR * 1_000_000;

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

function wait(until: string) {
  const min = Math.max(1, Math.ceil((new Date(until).getTime() - Date.now()) / 60_000));
  return min < 60 ? `${min} min` : `${Math.floor(min / 60)} h${min % 60 ? ` ${String(min % 60).padStart(2, "0")}` : ""}`;
}

function blockedError(until: string, reason: "week" | "session") {
  return reason === "session"
    ? new HttpError(429, "ai_session_blocked", `Tu as utilisé ton crédit d'IA de ${SESSION_AI_BUDGET_EUR} € pour ces ${SESSION_HOURS} heures. Il se recharge dans ${wait(until)}.`)
    : new HttpError(429, "ai_budget_blocked", `Tu as atteint ta limite d'IA de ${WEEKLY_AI_BUDGET_EUR} € pour la semaine. Elle se débloque dans ${wait(until)}.`);
}

// Renvoie la fin du blocage (et sa raison) si le client ne peut pas utiliser l'IA, sinon null.
export async function aiBlock(userId: string): Promise<{ until: string; reason: "week" | "session" } | null> {
  const rows = must(await db().rpc("ai_budget_check", { p_user: userId, p_week_budget: BUDGET_MICROS, p_session_budget: SESSION_MICROS, p_session_seconds: SESSION_HOURS * 3600 })) as
    { blocked_until: string | null; reason: "week" | "session" | null }[];
  const r = rows?.[0];
  return r?.blocked_until && r.reason ? { until: r.blocked_until, reason: r.reason } : null;
}

export async function assertAiBudget(userId: string) {
  const b = await aiBlock(userId);
  if (b) throw blockedError(b.until, b.reason);
}

export async function chargeAi(userId: string, micros: number) {
  if (micros <= 0) return;
  must(await db().rpc("ai_budget_add", { p_user: userId, p_micros: micros, p_week_budget: BUDGET_MICROS }));
}

export async function aiBudgetStatus(userId: string) {
  const row = must(await db().from("users").select("ai_spent_micros, ai_window_start, ai_blocked_until, ai_session_start, ai_session_spent_micros").eq("id", userId).maybeSingle()) as
    { ai_spent_micros: number; ai_window_start: string; ai_blocked_until: string | null; ai_session_start: string | null; ai_session_spent_micros: number } | null;
  const now = Date.now();
  const eur = (micros: number) => Math.round(micros / 10_000) / 100;
  const weekBlocked = row?.ai_blocked_until && new Date(row.ai_blocked_until).getTime() > now ? row.ai_blocked_until : null;
  const weekExpired = !row || row.ai_blocked_until || new Date(row.ai_window_start).getTime() < now - 7 * 86_400_000;
  const sessionEnd = row?.ai_session_start ? new Date(new Date(row.ai_session_start).getTime() + SESSION_HOURS * 3_600_000) : null;
  const sessionActive = !weekBlocked && sessionEnd && sessionEnd.getTime() > now;
  const sessionSpent = sessionActive ? row!.ai_session_spent_micros : 0;
  return {
    spentEur: weekBlocked ? WEEKLY_AI_BUDGET_EUR : weekExpired ? 0 : eur(row!.ai_spent_micros),
    limitEur: WEEKLY_AI_BUDGET_EUR,
    blockedUntil: weekBlocked,
    resetsAt: weekBlocked ?? (weekExpired ? null : new Date(new Date(row!.ai_window_start).getTime() + 7 * 86_400_000).toISOString()),
    session: {
      spentEur: eur(sessionSpent),
      limitEur: SESSION_AI_BUDGET_EUR,
      hours: SESSION_HOURS,
      resetsAt: sessionActive ? sessionEnd!.toISOString() : null,
      blockedUntil: sessionActive && sessionSpent >= SESSION_MICROS ? sessionEnd!.toISOString() : null,
    },
  };
}
