import { json, route } from "@/lib/server/http";
import { isOwnerEmail, requireOwner } from "@/lib/server/owner";
import { LAUNCH_OFFER } from "@/lib/content/pricing";
import { impactConfigured, syncImpact, trackerLabel } from "@/lib/server/impact";
import { USD_PER_EUR } from "@/lib/server/shopify-billing";
import { db, must } from "@/lib/server/supabase";
import { isBotBrief } from "@/lib/server/waitlist";

// Tableau de bord du fondateur : MRR, ventes, inscrits et affiliation (montants en centimes d'euro).
const DAY = 86_400_000;
const isShopifyTester = (email: string) => /@shopify\.com$/i.test(email ?? "");
const PARIS_DAY = new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris" });
const PARIS_HM = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
// Conversions en heure de Paris mises en cache : chaque date n'est calculée qu'une fois.
const memo = <T,>(f: (d: string) => T) => { const m = new Map<string, T>(); return (d: Date | string) => { const k = typeof d === "string" ? d : d.toISOString(); let v = m.get(k); if (v === undefined) { v = f(k); m.set(k, v); } return v; }; };
const parisDay = memo((d) => PARIS_DAY.format(new Date(d)));
const parisHM = memo((d) => PARIS_HM.format(new Date(d)));
const toEur = (cents: number, currency: string | null) => Math.round(currency === "USD" ? cents / USD_PER_EUR : cents);

type Dated = { created_at: string };

// Toutes les visites depuis `since`, lues par pages de 1 000 (limite d'une requête Supabase).
async function allSessions(since: string) {
  const rows: Record<string, any>[] = [];
  for (let from = 0; from < 200_000; from += 1000) {
    const { data, error } = await db().from("site_sessions").select("first_seen, last_seen, entry, source, device, country, pages, excluded")
      .gte("last_seen", since).order("first_seen").range(from, from + 999);
    if (error) return { data: null, error };
    rows.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  return { data: rows, error: null };
}

export const GET = route(async () => {
  const owner = await requireOwner({ issueDevice: true });
  // Parrainages Shopify (Impact) relus aussi à l'ouverture de Ventes, au plus toutes les 10 min.
  if (impactConfigured()) {
    const { error: recent } = await db().from("webhook_events").insert({ id: `impact-sync:${Math.floor(Date.now() / 600_000)}` });
    if (!recent) await syncImpact().catch((e) => console.warn("Impact", (e as Error).message));
  }
  const since = new Date(Date.now() - 30 * DAY).toISOString();
  const since60 = new Date(Date.now() - 61 * DAY).toISOString(); // 30 jours + les 30 d'avant, pour comparer
  const [subs, eventsAll, waitlistAll, users, stores, affiliates, affEvents, errors, visits, reminders, conns, impact] = await Promise.all([
    db().from("subscriptions").select("user_id, plan, status, interval, amount_cents, currency, test, shopify_subscription_id, stripe_subscription_id"),
    db().from("revenue_events").select("kind, plan, amount_cents, currency, user_id, created_at, users(email)").order("created_at", { ascending: false }).limit(2000),
    db().from("waitlist").select("email, ref, brief, created_at").order("created_at", { ascending: false }),
    db().from("users").select("id, email, created_at, shop_domain").order("created_at", { ascending: false }),
    db().from("stores").select("user_id, status, created_at").gte("created_at", since60),
    db().from("affiliates").select("code, commission_rate, users(email, first_name)"),
    db().from("affiliate_events").select("code, kind, amount_cents, referred_user_id, created_at"),
    db().from("app_errors").select("path, status, message, created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(200),
    allSessions(since60),
    db().from("webhook_events").select("id, created_at").like("id", "offer-%").gte("created_at", since),
    db().from("shop_connections").select("user_id, shop_domain, shopify_plan").eq("status", "active"),
    db().from("impact_actions").select("tracker, state, payout_cents, currency, event_at").order("event_at", { ascending: false }).limit(500),
  ]).then((rs) => rs.map((r) => must(r) as Record<string, any>[]));

  // Paiements d'essai (abonnement marqué « test ») et ceux du fondateur : hors des chiffres d'argent.
  const testUsers = new Set([...subs.filter((x) => x.test).map((x) => x.user_id), ...users.filter((u) => isOwnerEmail(u.email)).map((u) => u.id)]);
  const events = eventsAll.filter((e) => !testUsers.has(e.user_id));
  // Les comptes des évaluateurs Shopify, le fondateur et les robots ne comptent pas dans les chiffres.
  const waitlist = waitlistAll.filter((w) => !isBotBrief(w.brief));
  const realUsers = users.filter((u) => !isShopifyTester(u.email) && !isOwnerEmail(u.email));
  const realWaitlist = waitlist.filter((w) => !isShopifyTester(w.email) && !isOwnerEmail(w.email));
  // Vrais visiteurs : ni robots (filtrés à l'enregistrement), ni passages venant de Shopify.
  const realVisits: Record<string, any>[] = visits.filter((v) => !v.excluded).map((v) => ({ ...v, created_at: v.first_seen as string }));
  const active = subs.filter((s) => s.status === "active" && (s.shopify_subscription_id || s.stripe_subscription_id) && !s.test && s.plan !== "free");
  const monthly = (s: Record<string, any>) => toEur(Number(s.amount_cents ?? 0), s.currency) / (s.interval === "year" ? 12 : 1);
  const mrr = Math.round(active.reduce((t, s) => t + monthly(s), 0));
  const sum = (rows: Record<string, any>[]) => rows.reduce((t, e) => t + toEur(Number(e.amount_cents), e.currency), 0);

  // ---- Périodes (heure de Paris) : aujourd'hui, hier, 7 jours, 30 jours, chacune comparée à celle d'avant ----
  const D = Array.from({ length: 61 }, (_, i) => parisDay(new Date(Date.now() - i * DAY))); // D[0] = aujourd'hui
  const parisHour = (d: string) => Number(parisHM(d).slice(0, 2));
  const nowHM = parisHM(new Date());
  const shortDay = (day: string) => new Date(`${day}T12:00:00`).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  type Win = { cur: (d: string) => boolean; prev: (d: string) => boolean; buckets: { label: string; cur: (d: string) => boolean; prev: (d: string) => boolean }[] };
  const inDays = (days: string[]) => { const set = new Set(days); return (d: string) => set.has(parisDay(d)); };
  const hourly = (day: string, prevDay: string, untilNow: boolean): Win["buckets"] =>
    Array.from({ length: untilNow ? Number(nowHM.slice(0, 2)) + 1 : 24 }, (_, h) => ({
      label: `${h} h`,
      cur: (d: string) => parisDay(d) === day && parisHour(d) === h,
      prev: (d: string) => parisDay(d) === prevDay && parisHour(d) === h,
    }));
  const daily = (n: number): Win["buckets"] => Array.from({ length: n }, (_, i) => {
    const k = n - 1 - i;
    return { label: shortDay(D[k]), cur: (d: string) => parisDay(d) === D[k], prev: (d: string) => parisDay(d) === D[k + n] };
  });
  const WINDOWS: Record<"today" | "yesterday" | "week" | "month", Win> = {
    // Aujourd'hui est comparé à hier à la même heure, pour que la comparaison soit juste.
    today: { cur: (d) => parisDay(d) === D[0], prev: (d) => parisDay(d) === D[1] && parisHM(d) <= nowHM, buckets: hourly(D[0], D[1], true) },
    yesterday: { cur: (d) => parisDay(d) === D[1], prev: (d) => parisDay(d) === D[2], buckets: hourly(D[1], D[2], false) },
    week: { cur: inDays(D.slice(0, 7)), prev: inDays(D.slice(7, 14)), buckets: daily(7) },
    month: { cur: inDays(D.slice(0, 30)), prev: inDays(D.slice(30, 60)), buckets: daily(30) },
  };
  const at = (r: Record<string, any>) => r.created_at as string;
  const counts = (f: (d: string) => boolean) => {
    const ev = events.filter((e) => f(at(e)));
    const wl = realWaitlist.filter((w) => f(at(w))).length, acc = realUsers.filter((u) => f(at(u))).length;
    return {
      visits: realVisits.filter((v) => f(at(v))).length,
      signups: wl + acc, waitlist: wl, accounts: acc,
      revenue: sum(ev.filter((e) => e.kind === "payment")),
      sales: ev.filter((e) => e.kind === "payment").length,
      newSubs: ev.filter((e) => e.kind === "new").length,
      cancels: ev.filter((e) => e.kind === "cancel").length,
      stores: stores.filter((x) => f(at(x))).length,
      checkouts: new Set(ev.filter((e) => e.kind === "checkout").map((e) => e.user_id)).size,
    };
  };
  const top = (rows: Record<string, any>[], key: string, n = 6, label = (v: string) => v) =>
    Object.entries(rows.reduce<Record<string, number>>((m, r) => { const k = (r[key] as string | null) || "inconnu"; m[k] = (m[k] ?? 0) + 1; return m; }, {}))
      .map(([name, count]) => ({ name: label(name), count })).sort((a, b) => b.count - a.count).slice(0, n);
  const PAGE_NAME: Record<string, string> = { "/": "Accueil", "/tarifs": "Tarifs", "/inscription": "Inscription", "/connexion": "Connexion", "/demo": "Démo", "/produit": "Produit", "/affiliation": "Affiliation", "/blog": "Blog" };
  const country = (code: string) => { try { return code === "inconnu" ? "Inconnu" : new Intl.DisplayNames(["fr"], { type: "region" }).of(code) ?? code; } catch { return code; } };
  const periods = Object.fromEntries(Object.entries(WINDOWS).map(([k, w]) => {
    const v = realVisits.filter((x) => w.cur(at(x)));
    const secs = v.map((x) => Math.max(0, (new Date(x.last_seen).getTime() - new Date(x.first_seen).getTime()) / 1000));
    const n = v.length || 1;
    return [k, {
      ...counts(w.cur),
      prev: counts(w.prev),
      audience: {
        avgSeconds: Math.round(secs.reduce((a, b) => a + b, 0) / n),
        pagesPerVisit: Math.round((v.reduce((a, x) => a + Number(x.pages ?? 1), 0) / n) * 10) / 10,
        bounce: v.length ? v.filter((x, i) => Number(x.pages ?? 1) <= 1 && secs[i] < 15).length / v.length : 0,
        mobile: v.length ? v.filter((x) => x.device === "mobile").length / v.length : 0,
      },
      chart: w.buckets.map((b) => {
        const cur = counts(b.cur), prev = counts(b.prev);
        return { label: b.label, visits: cur.visits, signups: cur.signups, revenue: cur.revenue, prevVisits: prev.visits, prevSignups: prev.signups, prevRevenue: prev.revenue };
      }),
      pages: top(v, "entry", 6, (p) => PAGE_NAME[p] ?? p),
      sources: top(v, "source", 6, (s) => s === "direct" ? "Direct" : s.charAt(0).toUpperCase() + s.slice(1)),
      countries: top(v, "country", 6, country),
      devices: top(v, "device", 3, (d) => d.charAt(0).toUpperCase() + d.slice(1)),
    }];
  }));

  const today = D[0];
  const inLast = (days: number) => (r: Dated) => (days === 0 ? parisDay(r.created_at) === today : Date.now() - new Date(r.created_at).getTime() < days * DAY);
  const visits30 = realVisits.filter((v) => inLast(30)(v as Dated));
  // Entonnoir sur 30 jours : où les gens s'arrêtent avant d'acheter.
  const last30 = inLast(30);
  const uniq = (rows: Record<string, any>[]) => new Set(rows.map((r) => r.user_id)).size;
  const funnel = [
    { step: "Visiteurs du site", count: visits30.length },
    { step: "Comptes créés", count: realUsers.filter((u) => last30(u as Dated)).length },
    { step: "Aperçu de boutique créé", count: uniq(stores.filter((x) => last30(x as Dated))) },
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
        shop: (() => {
          // Boutique tapée à l'inscription (depuis le passage à Stripe), sinon ancienne connexion Shopify.
          if (u.shop_domain) return { domain: u.shop_domain as string, plan: null };
          const c = conns.find((x) => x.user_id === u.id);
          return c ? { domain: c.shop_domain as string, plan: (c.shopify_plan as string | null) ?? null } : null;
        })(),
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
    totals: { waitlist: waitlist.length, accounts: realUsers.length },
    periods,
    sources,
    affiliates: affiliateRows,
    liveNow: realVisits.filter((v) => Date.now() - new Date(v.last_seen).getTime() < 2 * 60_000).length,
    funnel,
    signups,
    errors: { day: errors.filter((e) => inLast(1)(e as Dated)).length, month: errors.length, recent: errors.slice(0, 5).map((e) => ({ path: e.path, status: e.status, message: e.message, at: e.created_at })) },
    recent: events.filter((e) => e.kind !== "checkout").slice(0, 12).map((e) => ({ kind: e.kind, plan: e.plan, amount: toEur(Number(e.amount_cents), e.currency), email: e.users?.email ?? null, at: e.created_at })),
  });
});
