import "server-only";
import { formatMoney } from "@/lib/format";
import { notifyOwner } from "./notify";
import { db, must } from "./supabase";

// Parrainages Shopify (lien d'affiliation Shopify, géré par Impact) : relus toutes les heures.
// Une notification (avec la pastille rouge de l'app Ventes) à chaque nouveau parrainage et quand
// une commission est validée. Clés dans Vercel : IMPACT_ACCOUNT_SID et IMPACT_AUTH_TOKEN (API d'Impact).

type Action = { Id: string; ActionTrackerName?: string; State?: string; Payout?: string; Currency?: string; EventDate?: string };

export const impactConfigured = () => Boolean(process.env.IMPACT_ACCOUNT_SID && process.env.IMPACT_AUTH_TOKEN);

// Nom lisible de l'étape Shopify (Free Trial → essai gratuit, etc.).
export function trackerLabel(name: string | null | undefined) {
  const n = (name ?? "").toLowerCase();
  if (n.includes("free")) return "Essai gratuit";
  if (n.includes("paid")) return "Essai payant";
  if (n.includes("full") || n.includes("price")) return "Boutique au plein tarif";
  return name || "Parrainage";
}

export async function syncImpact() {
  const sid = process.env.IMPACT_ACCOUNT_SID, token = process.env.IMPACT_AUTH_TOKEN;
  if (!sid || !token) return 0;
  const end = new Date(), start = new Date(end.getTime() - 30 * 86_400_000);
  const fmt = (d: Date) => d.toISOString().replace(/\.\d+Z$/, "Z");
  const res = await fetch(`https://api.impact.com/Mediapartners/${encodeURIComponent(sid)}/Actions?StartDate=${fmt(start)}&EndDate=${fmt(end)}&PageSize=200`, {
    headers: { authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`, accept: "application/json" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Impact a répondu ${res.status}`);
  const actions = ((await res.json()) as { Actions?: Action[] }).Actions ?? [];
  if (!actions.length) return 0;

  const known = must(await db().from("impact_actions").select("id, state").in("id", actions.map((a) => a.Id))) as { id: string; state: string | null }[];
  let fresh = 0;
  for (const a of actions) {
    const before = known.find((k) => k.id === a.Id);
    const payout = Math.round(Number(a.Payout ?? 0) * 100);
    const money = formatMoney(payout, a.Currency || "USD");
    await db().from("impact_actions").upsert({ id: a.Id, tracker: a.ActionTrackerName ?? null, state: a.State ?? null, payout_cents: payout, currency: a.Currency ?? null, event_at: a.EventDate ?? null, updated_at: new Date().toISOString() });
    if (!before) {
      fresh++;
      await notifyOwner("🤝 Nouveau parrainage Shopify", `${trackerLabel(a.ActionTrackerName)} grâce à ton lien${payout ? ` · ${money} de commission` : ""}.`);
    } else if (before.state !== "APPROVED" && a.State === "APPROVED" && payout) {
      await notifyOwner("💸 Commission Shopify validée", `${money} validés pour un parrainage (${trackerLabel(a.ActionTrackerName)}).`);
    }
  }
  return fresh;
}
