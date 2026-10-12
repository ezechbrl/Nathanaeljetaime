import { NextResponse } from "next/server";
import { recommend } from "@/lib/server/ai";
import { decrypt, safeEqual } from "@/lib/server/crypto";
import { env } from "@/lib/server/env";
import { dailyOrders, dailySessions } from "@/lib/server/shopify";
import { db, must } from "@/lib/server/supabase";
import type { StorePlan } from "@/lib/store-schema";

export const maxDuration = 300;

// Tâche quotidienne (Vercel Cron, voir vercel.json) : statistiques Shopify + recommandations de l'IA.
export async function GET(req: Request) {
  const secret = env.cronSecret();
  const auth = req.headers.get("authorization") ?? "";
  if (!secret || !safeEqual(auth, `Bearer ${secret}`)) return new NextResponse("non autorisé", { status: 401 });

  const stores = must(await db().from("stores").select("id, plan, shop_connection_id, shop_connections(shop_domain, access_token_encrypted, status)").eq("status", "published")) as Record<string, any>[];
  const report: Record<string, string> = {};

  for (const s of stores) {
    const conn = s.shop_connections;
    if (!conn || conn.status !== "active" || !conn.access_token_encrypted) continue;
    try {
      const token = decrypt(conn.access_token_encrypted);
      const [orders, sessions] = await Promise.all([dailyOrders(conn.shop_domain, token, 30), dailySessions(conn.shop_domain, token, 30)]);
      const days = new Set([...orders.keys(), ...sessions.keys()]);
      const rows = [...days].map((date) => ({ store_id: s.id, date, sessions: sessions.get(date) ?? 0, orders: orders.get(date)?.orders ?? 0, revenue_cents: orders.get(date)?.revenue ?? 0 }));
      if (rows.length) await db().from("metrics_daily").upsert(rows, { onConflict: "store_id,date" });

      const previous = (must(await db().from("recommendations").select("title").eq("store_id", s.id).order("created_at", { ascending: false }).limit(15)) as { title: string }[]).map((r) => r.title);
      const metrics = rows.sort((a, b) => a.date.localeCompare(b.date)).map((r) => ({ date: r.date, sessions: r.sessions, orders: r.orders, revenue: r.revenue_cents }));
      const out = await recommend({ plan: s.plan as StorePlan, metrics, previous });
      await db().from("insights").insert({ store_id: s.id, summary: out.insight });
      await db().from("recommendations").update({ status: "dismissed" }).eq("store_id", s.id).eq("status", "proposed");
      await db().from("recommendations").insert(out.recommendations.map((r) => ({ store_id: s.id, title: r.title, rationale: r.rationale, area: r.area, expected_impact: r.expectedImpact, instruction: r.instruction })));
      report[s.id] = "ok";
    } catch (e) {
      report[s.id] = (e as Error).message;
      console.error("Pilotage", s.id, e);
    }
  }
  return NextResponse.json({ processed: Object.keys(report).length, report });
}
