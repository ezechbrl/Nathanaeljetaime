import { NextResponse } from "next/server";
import { recommend } from "@/lib/server/ai";
import { aiBlock } from "@/lib/server/budget";
import { safeEqual } from "@/lib/server/crypto";
import { sendEmail } from "@/lib/server/email";
import { env } from "@/lib/server/env";
import { accessToken, dailyOrders, dailySessions } from "@/lib/server/shopify";
import { db, must } from "@/lib/server/supabase";
import type { StorePlan } from "@/lib/store-schema";

export const maxDuration = 300;

// Tâche quotidienne (Vercel Cron, voir vercel.json) : statistiques Shopify + recommandations de l'IA.
export async function GET(req: Request) {
  const secret = env.cronSecret();
  const auth = req.headers.get("authorization") ?? "";
  if (!secret || !safeEqual(auth, `Bearer ${secret}`)) return new NextResponse("non autorisé", { status: 401 });

  const stores = must(await db().from("stores").select("id, user_id, plan, shop_connection_id, shop_connections(id, shop_domain, access_token_encrypted, status)").eq("status", "published")) as Record<string, any>[];
  const report: Record<string, string> = {};

  for (const s of stores) {
    const conn = s.shop_connections;
    if (!conn || conn.status !== "active" || !conn.access_token_encrypted) continue;
    try {
      const token = await accessToken(conn);
      const [orders, sessions] = await Promise.all([dailyOrders(conn.shop_domain, token, 30), dailySessions(conn.shop_domain, token, 30)]);
      const days = new Set([...orders.keys(), ...sessions.keys()]);
      const rows = [...days].map((date) => ({ store_id: s.id, date, sessions: sessions.get(date) ?? 0, orders: orders.get(date)?.orders ?? 0, revenue_cents: orders.get(date)?.revenue ?? 0 }));
      if (rows.length) await db().from("metrics_daily").upsert(rows, { onConflict: "store_id,date" });

      // Sans abonnement : statistiques seulement, pas de recommandations (pas de coût d'IA).
      const owner = must(await db().from("users").select("plan").eq("id", s.user_id).maybeSingle()) as { plan: string } | null;
      if (!owner || owner.plan === "free") { report[s.id] = "sans abonnement"; continue; }
      // Client bloqué (budget d'IA atteint) : on enregistre les stats mais pas de nouvelles recommandations.
      if ((await aiBlock(s.user_id))?.reason === "week") { report[s.id] = "budget IA de la semaine atteint"; continue; }
      const previous = (must(await db().from("recommendations").select("title").eq("store_id", s.id).order("created_at", { ascending: false }).limit(15)) as { title: string }[]).map((r) => r.title);
      const metrics = rows.sort((a, b) => a.date.localeCompare(b.date)).map((r) => ({ date: r.date, sessions: r.sessions, orders: r.orders, revenue: r.revenue_cents }));
      const out = await recommend({ plan: s.plan as StorePlan, metrics, previous, userId: s.user_id });
      await db().from("insights").insert({ store_id: s.id, summary: out.insight });
      await db().from("recommendations").update({ status: "dismissed" }).eq("store_id", s.id).eq("status", "proposed");
      await db().from("recommendations").insert(out.recommendations.map((r) => ({ store_id: s.id, title: r.title, rationale: r.rationale, area: r.area, expected_impact: r.expectedImpact, instruction: r.instruction })));
      report[s.id] = "ok";
    } catch (e) {
      report[s.id] = (e as Error).message;
      console.error("Pilotage", s.id, e);
    }
  }
  // Rappel de l'offre de lancement : un e-mail quand il reste moins de 24 h et que la personne n'est pas abonnée.
  // La tâche passe une fois par jour : chaque compte traverse la fenêtre « 24 h à 48 h » une seule fois.
  const now = Date.now();
  const late = must(await db().from("users").select("id, email, first_name, created_at").eq("plan", "free")
    .lte("created_at", new Date(now - 24 * 3_600_000).toISOString()).gt("created_at", new Date(now - 48 * 3_600_000).toISOString())) as { id: string; email: string; first_name: string; created_at: string }[];
  let reminders = 0;
  for (const u of late) {
    const { error: dup } = await db().from("webhook_events").insert({ id: `offer-reminder:${u.id}` });
    if (dup || !u.email) continue;
    const hours = Math.max(1, Math.round((new Date(u.created_at).getTime() + 48 * 3_600_000 - now) / 3_600_000));
    const ok = await sendEmail(u.email, `Plus que ${hours} h pour ton prix de lancement (−50 % à vie)`,
      `Salut${u.first_name ? ` ${u.first_name}` : ""},\n\nTon offre de lancement Vitrio se termine dans ${hours} h : −50 % à vie sur ton abonnement (40 € par mois au lieu de 80 € pour Starter).\n\nAprès, le prix normal s'applique.\n\nChoisir mon offre : ${env.appUrl()}/app/abonnement\n\nÀ tout de suite,\nL'équipe Vitrio`);
    if (ok) reminders++;
    else await db().from("webhook_events").delete().eq("id", `offer-reminder:${u.id}`); // réessai demain si encore dans la fenêtre
  }

  return NextResponse.json({ processed: Object.keys(report).length, report, reminders });
}
