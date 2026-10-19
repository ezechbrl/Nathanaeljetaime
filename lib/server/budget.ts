import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import type { PlanId } from "@/lib/api/types";
import { HttpError } from "./http";
import { db, must } from "./supabase";

// Deux limites d'IA par client et par offre, comme Claude :
//   - une recharge toutes les SESSION_HOURS heures (session) ;
//   - une limite par semaine glissante, puis 24 h de pause.
// Montants en euros. À garder cohérents avec la page Tarifs (lib/content/pricing.ts).
export const AI_LIMITS: Record<PlanId, { session: number; week: number }> = {
  free: { session: 0, week: 0 }, // sans abonnement : pas d'IA
  pro: { session: 1, week: 3 }, // offre Starter
  agency: { session: 2, week: 7 }, // offre Pro
};
export const SESSION_HOURS = 5;
const USD_TO_EUR = 0.92; // à ajuster si le taux de change bouge beaucoup
const micros = (eur: number) => Math.round(eur * 1_000_000);

async function planOf(userId: string): Promise<PlanId> {
  const row = must(await db().from("users").select("plan").eq("id", userId).maybeSingle()) as { plan: PlanId } | null;
  return row?.plan ?? "free";
}

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

const eurText = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });

function blockedError(until: string, reason: "week" | "session", plan: PlanId) {
  const l = AI_LIMITS[plan];
  const upsell = plan === "free" ? " Active un abonnement Vitrio pour utiliser l'IA." : plan === "pro" ? " Passe à l'offre Pro pour 2× plus de crédit." : "";
  return reason === "session"
    ? new HttpError(429, "ai_session_blocked", `Tu as utilisé ton crédit d'IA (${eurText(l.session)} €) pour ces ${SESSION_HOURS} heures. Il se recharge dans ${wait(until)}.${upsell}`)
    : new HttpError(429, "ai_budget_blocked", `Tu as atteint ta limite d'IA de la semaine (${eurText(l.week)} €). Elle se débloque dans ${wait(until)}.${upsell}`);
}

// Renvoie la fin du blocage (et sa raison) si le client ne peut pas utiliser l'IA, sinon null.
export async function aiBlock(userId: string, plan?: PlanId): Promise<{ until: string; reason: "week" | "session" } | null> {
  const l = AI_LIMITS[plan ?? (await planOf(userId))];
  const rows = must(await db().rpc("ai_budget_check", { p_user: userId, p_week_budget: micros(l.week), p_session_budget: micros(l.session), p_session_seconds: SESSION_HOURS * 3600 })) as
    { blocked_until: string | null; reason: "week" | "session" | null }[];
  const r = rows?.[0];
  return r?.blocked_until && r.reason ? { until: r.blocked_until, reason: r.reason } : null;
}

export async function assertAiBudget(userId: string, plan?: PlanId) {
  const p = plan ?? (await planOf(userId));
  // Pas d'offre gratuite : l'IA est réservée aux abonnés.
  if (p === "free") throw new HttpError(402, "subscription_required", "Choisis ton offre pour utiliser l'IA : dès 50 € par mois, sans engagement.");
  const b = await aiBlock(userId, p);
  if (b) throw blockedError(b.until, b.reason, p);
}

export async function chargeAi(userId: string, cost: number) {
  if (cost <= 0) return;
  const l = AI_LIMITS[await planOf(userId)];
  must(await db().rpc("ai_budget_add", { p_user: userId, p_micros: cost, p_week_budget: micros(l.week) }));
}

export async function aiBudgetStatus(userId: string, plan: PlanId) {
  const l = AI_LIMITS[plan];
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
    spentEur: weekBlocked ? l.week : weekExpired ? 0 : eur(row!.ai_spent_micros),
    limitEur: l.week,
    blockedUntil: weekBlocked,
    resetsAt: weekBlocked ?? (weekExpired ? null : new Date(new Date(row!.ai_window_start).getTime() + 7 * 86_400_000).toISOString()),
    session: {
      spentEur: eur(sessionSpent),
      limitEur: l.session,
      hours: SESSION_HOURS,
      resetsAt: sessionActive ? sessionEnd!.toISOString() : null,
      blockedUntil: sessionActive && sessionSpent >= micros(l.session) ? sessionEnd!.toISOString() : null,
    },
  };
}
