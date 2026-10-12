import { ownedStore, requireUser } from "@/lib/server/auth";
import { json, route } from "@/lib/server/http";
import { db, must } from "@/lib/server/supabase";
import type { MetricsPoint, StoreMetrics } from "@/lib/api/types";

const DAYS = { "7d": 7, "30d": 30, "90d": 90 } as const;

export const GET = route<{ params: Promise<{ id: string }> }>(async (req, { params }) => {
  const user = await requireUser();
  const store = await ownedStore(user.id, (await params).id);
  const r = new URL(req.url).searchParams.get("range");
  const range: StoreMetrics["range"] = r === "7d" || r === "90d" ? r : "30d";
  const days = DAYS[range];
  const day = (offset: number) => new Date(Date.now() - offset * 86_400_000).toISOString().slice(0, 10);
  const rows = must(await db().from("metrics_daily").select("*").eq("store_id", store.id).gte("date", day(days * 2 - 1)).order("date")) as { date: string; sessions: number; orders: number; revenue_cents: number }[];
  const byDate = new Map(rows.map((x) => [x.date, x]));

  const build = (from: number, to: number): MetricsPoint[] =>
    Array.from({ length: to - from }, (_, i) => {
      const d = day(to - 1 - i);
      const x = byDate.get(d);
      const sessions = x?.sessions ?? 0;
      const orders = x?.orders ?? 0;
      return { date: d, sessions, orders, revenue: x?.revenue_cents ?? 0, conversionRate: sessions ? +((orders / sessions) * 100).toFixed(2) : 0 };
    });
  const totals = (pts: MetricsPoint[]) => {
    const sessions = pts.reduce((s, p) => s + p.sessions, 0);
    const orders = pts.reduce((s, p) => s + p.orders, 0);
    const revenue = pts.reduce((s, p) => s + p.revenue, 0);
    return { sessions, orders, revenue, conversionRate: sessions ? +((orders / sessions) * 100).toFixed(2) : 0, averageOrderValue: orders ? Math.round(revenue / orders) : 0 };
  };
  const series = build(0, days);
  return json({ range, totals: totals(series), previous: totals(build(days, days * 2)), series } satisfies StoreMetrics);
});
