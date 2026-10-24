import { json, route } from "@/lib/server/http";
import { isOwnerEmail, requireOwner } from "@/lib/server/owner";
import { LAUNCH_OFFER } from "@/lib/content/pricing";
import { impactConfigured, trackerLabel } from "@/lib/server/impact";
import { USD_PER_EUR } from "@/lib/server/shopify-billing";
import { db, must } from "@/lib/server/supabase";

// Tableau de bord du fondateur : MRR, ventes, inscrits et affiliation (montants en centimes d'euro).
const DAY = 86_400_000;
const isShopifyTester = (email: string) => /@shopify\.com$/i.test(email ?? "");
const parisDay = (d: Date | string) => new Date(d).toLocaleDateString("fr-CA", { timeZone: "Europe/Paris" });
const toEur = (cents: number, currency: string | null) => Math.round(currency === "USD" ? cents / USD_PER_EUR : cents);

type Dated = { created_at: string };

export const GET = route(async () => {
  const owner = await requireOwner({ issueDevice: true });
  const since = new Date(Date.now() - 30 * DAY).toISOString();
  const [subs, events, waitlist, users, stores, affiliates, affEvents, errors, visits, reminders, conns, impact] = await Promise.all([
    db().from("subscriptions").select("plan, status, interval, amount_cents, currency, test, shopify_subscription_id"),
    db().from("revenue_events").select("kind, plan, amount_cents, currency, user_id, created_at, users(email)").order("created_at", { ascending: false }).limit(1000),
    db().from("waitlist").select("email, ref, created_at").order("created_at", { ascending: false }),
    db().from("users").select("id, email, created_at").order("created_at", { ascending: false }),
    db().from("stores").select("user_id, status, created_at").gte("created_at", since),
    db().from("affiliates").select("code, commission_rate, users(email, first_name)"),
    db().from("affiliate_events").select("code, kind, amount_cents, referred_user_id, created_at"),
    db().from("app_errors").select("path, status, message, created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(200),
    db().from("site_sessions").select("first_seen, last_seen").gte("last_seen", since).limit(50000),
    db().from("webhook_events").select("id, created_at").like("id", "offer-%").gte("created_at", since),
    db().from("shop_connections").select("user_id, shop_domain, shopify_plan").eq("status", "active"),
    db().from("impact_actions").select("tracker, state, payout_cents, currency, event_at").order("event_at", { ascending: false }).limit(500),
  ]).then((rs) => rs.map((r) => must(r) as Record<string, any>[]));

  // Les comptes des évaluateurs Shopify et le fondateur ne comptent pas dans les chiffres.
  const realUsers = users.filter((u) => !isShopifyTester(u.email) && !isOwnerEmail(u.email));
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
      visits: visits.filter((v) => f({ created_at: v.first_seen })).length,
      revenue: sum(ev.filter((e) => e.kind === "payment")),
      sales: ev.filter((e) => e.kind === "payment").length,
      newSubs: ev.filter((e) => e.kind === "new").length,
      cancels: ev.filter((e) => e.kind === "cancel").length,
      waitlist: waitlist.filter((w) => f(w as Dated)).length,
      accounts: realUsers.filter((u) => f(u as Dated)).length,
      stores: stores.filter((s) => f(s as Dated)).length,
    }];
  }));

  // 30 derniers jours, jour par jour (heure de Paris).
  const days = Array.from({ length: 30 }, (_, i) => parisDay(new Date(Date.now() - (29 - i) * DAY)));
  const series = days.map((day) => ({
    day,
    revenue: sum(events.filter((e) => e.kind === "payment" && parisDay(e.created_at) === day)),
    signups: waitlist.filter((w) => parisDay(w.created_at) === day).length + realUsers.filter((u) => parisDay(u.created_at) === day).length,
    visits: visits.filter((v) => parisDay(v.first_seen) === day).length,
  }));
  // Aujourd'hui, heure par heure (heure de Paris).
  const parisHour = (d: string) => Number(new Date(d).toLocaleString("en-GB", { timeZone: "Europe/Paris", hour: "2-digit", hour12: false }));
  const todayRows = (rows: Record<string, any>[]) => rows.filter((r) => parisDay(r.created_at) === today);
  const hours = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    revenue: sum(todayRows(events).filter((e) => e.kind === "payment" && parisHour(e.created_at) === h)),
    signups: todayRows(waitlist).filter((w) => parisHour(w.created_at) === h).length + todayRows(realUsers).filter((u) => parisHour(u.created_at) === h).length,
    visits: visits.filter((v) => parisDay(v.first_seen) === today && parisHour(v.first_seen) === h).length,
  }));
  // Entonnoir sur 30 jours : où les gens s'arrêtent avant d'acheter.
  const last30 = inLast(30);
  const uniq = (rows: Record<string, any>[]) => new Set(rows.map((r) => r.user_id)).size;
  const funnel = [
    { step: "Visiteurs du site", count: visits.filter((v) => last30({ created_at: v.first_seen })).length },
    { step: "Comptes créés", count: realUsers.filter((u) => last30(u as Dated)).length },
    { step: "Aperçu de boutique créé", count: uniq(stores) },
    { step: "Page de paiement ouverte", count: uniq(events.filter((e) => e.kind === "checkout" && last30(e as Dated))) },
    { step: "Abonnés", count: uniq(events.filter((e) => e.kind === "new" && last30(e as Dated))) },
  ];
  const signups = [
    ...waitlist.slice(0, 15).map((w) => ({ email: w.email as string, kind: "waitlist" as const, ref: (w.ref as string | null) ?? null, at: w.created_at as string })),
    ...users.filter((u) => !isOwnerEmail(u.email)).slice(0, 15).map((u) => {
      // Offre de lancement (−50 %, 24 h) : temps restant, rappel de 12 h envoyé, abonnement pris ou non.
      const sub = events.filter((e) => e.kind === "new" && e.user_id === u.id).at(-1);
      return {
        email: u.email as string, kind: "account" as const, ref: null, at: u.created_at as string, tester: isShopifyTester(u.email),
        shop: (() => { const c = conns.find((x) => x.user_id === u.id); return c ? { domain: c.shop_domain as string, plan: (c.shopify_plan as string | null) ?? null } : null; })(),
        offer: {
          endsAt: new Date(new Date(u.created_at).getTime() + LAUNCH_OFFER.hours * 3_600_000).toISOString(),
          reminderAt: (reminders.find((r) => r.id === `offer-reminder:${u.id}`)?.created_at as string | undefined) ?? null,
          lastCallAt: (reminders.find((r) => r.id === `offer-last:${u.id}`)?.created_at as string | undefined) ?? null,
          subscribedAt: (sub?.created_at as string | undefined) ?? null,
          amount: sub ? toEur(Number(sub.amount_cents), sub.currency) : null,
        },
      };
    }),
  ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 12);
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

  // Affiliation Shopify (Impact) : parrainages et commissions (montants en dollars, comme Impact).
  const shopifyAffiliation = {
    configured: impactConfigured(),
    trials: impact.filter((a) => trackerLabel(a.tracker) === "Essai gratuit").length,
    paid: impact.filter((a) => trackerLabel(a.tracker) !== "Essai gratuit").length,
    pending: impact.filter((a) => a.state === "PENDING").reduce((t, a) => t + Number(a.payout_cents), 0),
    approved: impact.filter((a) => a.state === "APPROVED").reduce((t, a) => t + Number(a.payout_cents), 0),
    currency: (impact[0]?.currency as string | undefined) ?? "USD",
    recent: impact.slice(0, 5).map((a) => ({ label: trackerLabel(a.tracker), state: a.state as string | null, payout: Number(a.payout_cents), at: a.event_at as string | null })),
  };

  return json({
    shopifyAffiliation,
    deviceToken: owner.newDeviceToken ?? null,
    mrr,
    arr: mrr * 12,
    subscribers: { total: active.length, starter: active.filter((s) => s.plan === "pro").length, pro: active.filter((s) => s.plan === "agency").length },
    arpu: active.length ? Math.round(mrr / active.length) : 0,
    churn: active.length + monthCancels ? monthCancels / (active.length + monthCancels) : 0,
    conversion: realUsers.length ? active.length / realUsers.length : 0,
    hours,
    totals: { waitlist: waitlist.length, accounts: realUsers.length },
    periods,
    series,
    sources,
    affiliates: affiliateRows,
    liveNow: visits.filter((v) => Date.now() - new Date(v.last_seen).getTime() < 2 * 60_000).length,
    funnel,
    signups,
    errors: { day: errors.filter((e) => inLast(1)(e as Dated)).length, month: errors.length, recent: errors.slice(0, 5).map((e) => ({ path: e.path, status: e.status, message: e.message, at: e.created_at })) },
    recent: events.filter((e) => e.kind !== "checkout").slice(0, 12).map((e) => ({ kind: e.kind, plan: e.plan, amount: toEur(Number(e.amount_cents), e.currency), email: e.users?.email ?? null, at: e.created_at })),
  });
});
