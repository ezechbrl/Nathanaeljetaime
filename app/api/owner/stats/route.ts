import { json, route } from "@/lib/server/http";
import { requireOwner } from "@/lib/server/owner";
import { USD_PER_EUR } from "@/lib/server/shopify-billing";
import { db, must } from "@/lib/server/supabase";

// Tableau de bord du fondateur : MRR, ventes, inscrits et affiliation (montants en centimes d'euro).
const DAY = 86_400_000;
const parisDay = (d: Date | string) => new Date(d).toLocaleDateString("fr-CA", { timeZone: "Europe/Paris" });
const toEur = (cents: number, currency: string | null) => Math.round(currency === "USD" ? cents / USD_PER_EUR : cents);

type Dated = { created_at: string };

export const GET = route(async () => {
  await requireOwner();
  const since = new Date(Date.now() - 30 * DAY).toISOString();
  const [subs, events, waitlist, users, stores, affiliates, affEvents] = await Promise.all([
    db().from("subscriptions").select("plan, status, interval, amount_cents, currency, test, shopify_subscription_id"),
    db().from("revenue_events").select("kind, plan, amount_cents, currency, created_at, users(email)").order("created_at", { ascending: false }).limit(500),
    db().from("waitlist").select("ref, created_at"),
    db().from("users").select("created_at"),
    db().from("stores").select("status, created_at").gte("created_at", since),
    db().from("affiliates").select("code, commission_rate, users(email, first_name)"),
    db().from("affiliate_events").select("code, kind, amount_cents, referred_user_id, created_at"),
  ]).then((rs) => rs.map((r) => must(r) as Record<string, any>[]));

  const active = subs.filter((s) => s.status === "active" && s.shopify_subscription_id && !s.test && s.plan !== "free");
  const monthly = (s: Record<string, any>) => toEur(Number(s.amount_cents ?? 0), s.currency) / (s.interval === "year" ? 12 : 1);
  const mrr = Math.round(active.reduce((t, s) => t + monthly(s), 0));

  const today = parisDay(new Date());
  const inLast = (days: number) => (r: Dated) => (days === 0 ? parisDay(r.created_at) === today : Date.now() - new Date(r.created_at).getTime() < days * DAY);
  const windows = { today: 0, week: 7, month: 30 } as const;
  const sum = (rows: Record<string, any>[]) => rows.reduce((t, e) => t + toEur(Number(e.amount_cents), e.currency), 0);
  const periods = Object.fromEntries(Object.entries(windows).map(([k, d]) => {
    const f = inLast(d);
    const ev = events.filter((e) => f(e as Dated));
    return [k, {
      revenue: sum(ev.filter((e) => e.kind === "payment")),
      sales: ev.filter((e) => e.kind === "payment").length,
      newSubs: ev.filter((e) => e.kind === "new").length,
      cancels: ev.filter((e) => e.kind === "cancel").length,
      waitlist: waitlist.filter((w) => f(w as Dated)).length,
      accounts: users.filter((u) => f(u as Dated)).length,
      stores: stores.filter((s) => f(s as Dated)).length,
    }];
  }));

  // 30 derniers jours, jour par jour (heure de Paris).
  const days = Array.from({ length: 30 }, (_, i) => parisDay(new Date(Date.now() - (29 - i) * DAY)));
  const series = days.map((day) => ({
    day,
    revenue: sum(events.filter((e) => e.kind === "payment" && parisDay(e.created_at) === day)),
    signups: waitlist.filter((w) => parisDay(w.created_at) === day).length + users.filter((u) => parisDay(u.created_at) === day).length,
  }));
  // Aujourd'hui, heure par heure (heure de Paris).
  const parisHour = (d: string) => Number(new Date(d).toLocaleString("en-GB", { timeZone: "Europe/Paris", hour: "2-digit", hour12: false }));
  const todayRows = (rows: Record<string, any>[]) => rows.filter((r) => parisDay(r.created_at) === today);
  const hours = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    revenue: sum(todayRows(events).filter((e) => e.kind === "payment" && parisHour(e.created_at) === h)),
    signups: todayRows(waitlist).filter((w) => parisHour(w.created_at) === h).length + todayRows(users).filter((u) => parisHour(u.created_at) === h).length,
  }));
  const monthCancels = events.filter((e) => e.kind === "cancel" && inLast(30)(e as Dated)).length;

  const sources = Object.entries(waitlist.reduce<Record<string, number>>((m, w) => ((m[w.ref || "direct"] = (m[w.ref || "direct"] ?? 0) + 1), m), {}))
    .map(([ref, count]) => ({ ref, count })).sort((a, b) => b.count - a.count);

  const affiliateRows = affiliates.map((a) => {
    const ev = affEvents.filter((e) => e.code === a.code);
    const pay = ev.filter((e) => e.kind === "payment");
    return {
      code: a.code,
      name: a.users?.first_name || a.users?.email || a.code,
      clicks: ev.filter((e) => e.kind === "click").length,
      signups: ev.filter((e) => e.kind === "signup").length,
      customers: new Set(pay.map((e) => e.referred_user_id)).size,
      commission: pay.reduce((t, e) => t + Number(e.amount_cents), 0),
      rate: Number(a.commission_rate),
    };
  }).sort((a, b) => b.commission - a.commission || b.signups - a.signups || b.clicks - a.clicks);

  return json({
    mrr,
    arr: mrr * 12,
    subscribers: { total: active.length, starter: active.filter((s) => s.plan === "pro").length, pro: active.filter((s) => s.plan === "agency").length },
    arpu: active.length ? Math.round(mrr / active.length) : 0,
    churn: active.length + monthCancels ? monthCancels / (active.length + monthCancels) : 0,
    conversion: users.length ? active.length / users.length : 0,
    hours,
    totals: { waitlist: waitlist.length, accounts: users.length },
    periods,
    series,
    sources,
    affiliates: affiliateRows,
    recent: events.slice(0, 12).map((e) => ({ kind: e.kind, plan: e.plan, amount: toEur(Number(e.amount_cents), e.currency), email: e.users?.email ?? null, at: e.created_at })),
  });
});
