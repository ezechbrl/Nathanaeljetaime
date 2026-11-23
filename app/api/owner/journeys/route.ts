import { json, route } from "@/lib/server/http";
import { isOwnerEmail, requireOwner } from "@/lib/server/owner";
import { db, must } from "@/lib/server/supabase";

// Parcours des inscrits (Ventes) : d'où ils viennent, leur boutique, l'étape atteinte,
// et le résumé du jour (où les inscrits bloquent, sur quelle page les visiteurs partent).
const STEPS = ["Compte créé", "Aperçu demandé", "Aperçu prêt", "A ouvert le paiement (Stripe)", "Abonné (a payé)", "Boutique complète", "Envoyée sur Shopify"] as const;
const real = (email: string) => !isOwnerEmail(email) && !/@shopify\.com$/i.test(email ?? "");

// Minuit à Paris aujourd'hui, en heure UTC.
function parisMidnight() {
  const now = new Date();
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(now).map((x) => [x.type, x.value]));
  return new Date(now.getTime() - ((+p.hour * 60 + +p.minute) * 60 + +p.second) * 1000 - now.getMilliseconds());
}

async function journeys(users: Record<string, any>[]) {
  if (!users.length) return [];
  const ids = users.map((u) => u.id as string);
  const [stores, events, subs, linked, mails] = await Promise.all([
    db().from("stores").select("id, user_id, name, status, teaser, created_at").in("user_id", ids).order("created_at", { ascending: false }),
    db().from("revenue_events").select("user_id, kind, created_at").in("user_id", ids),
    db().from("subscriptions").select("user_id, plan, status, test, cancel_at_period_end").in("user_id", ids),
    db().from("site_sessions").select("user_id, first_seen, last_seen, source, device, country, entry, path").in("user_id", ids).order("first_seen"),
    db().from("email_events").select("user_id, kind, last_event, sent_at").in("user_id", ids).order("sent_at"),
  ]).then((rs) => rs.map((r) => must(r) as Record<string, any>[]));
  const storeIds = stores.map((s) => s.id as string);
  const assets = storeIds.length
    ? (must(await db().from("assets").select("store_id, kind, url, created_at").in("store_id", storeIds).in("kind", ["banner", "product"]).order("created_at")) as Record<string, any>[])
    : [];

  return users.map((u) => {
    const mine = linked.filter((s) => s.user_id === u.id);
    const origin = mine[0] ?? null; // première visite reliée au compte (aucune supposition)
    const last = mine.length ? mine.reduce((a, b) => (new Date(b.last_seen) > new Date(a.last_seen) ? b : a)) : null;
    const st = stores.filter((s) => s.user_id === u.id);
    const store = st[0] ?? null;
    const ev = events.filter((e) => e.user_id === u.id);
    const sub = subs.find((s) => s.user_id === u.id);
    const live = !!sub && sub.status === "active" && sub.plan !== "free" && !sub.test;
    const done = [
      true,
      st.length > 0,
      st.some((s) => s.teaser || ["locked", "ready", "publishing", "published"].includes(s.status)),
      ev.some((e) => e.kind === "checkout"),
      ev.some((e) => e.kind === "new") || live,
      st.some((s) => ["ready", "publishing", "published"].includes(s.status)),
      st.some((s) => s.status === "published"),
    ];
    let reached = 0;
    done.forEach((d, i) => { if (d) reached = i; });
    // Abonnement : en cours, résiliation programmée (accès jusqu'à la fin du mois payé) ou terminé.
    const subState = live ? (sub.cancel_at_period_end ? "ending" : "active") : ev.some((e) => e.kind === "cancel") ? "ended" : ev.some((e) => e.kind === "new") ? "ended" : "none";
    const img = store ? (assets.find((a) => a.store_id === store.id && a.kind === "banner") ?? assets.find((a) => a.store_id === store.id))?.url ?? store.teaser?.image ?? null : null;
    return {
      email: u.email as string,
      at: u.created_at as string,
      source: origin ? { name: origin.source as string, device: origin.device as string, country: (origin.country as string | null) ?? null, entry: origin.entry as string } : null,
      lastSeen: last ? { at: last.last_seen as string, page: last.path as string } : null,
      visits: mine.length,
      store: store ? { id: store.id as string, name: store.name as string, status: store.status as string, image: img as string | null, count: st.length } : null,
      done,
      reached,
      subState,
      mails: mails.filter((m) => m.user_id === u.id).map((m) => ({ kind: m.kind as string, status: (m.last_event as string | null) ?? "sent" })),
    };
  });
}

export const GET = route(async () => {
  await requireOwner();
  const midnight = parisMidnight().toISOString();
  const [recentAll, todayAll, visits] = await Promise.all([
    db().from("users").select("id, email, created_at").order("created_at", { ascending: false }).limit(80),
    db().from("users").select("id, email, created_at").gte("created_at", midnight).order("created_at", { ascending: false }),
    db().from("site_sessions").select("path, entry, pages, source").eq("excluded", false).gte("last_seen", midnight).limit(5000),
  ]).then((rs) => rs.map((r) => must(r) as Record<string, any>[]));
  const recent = recentAll.filter((u) => real(u.email)).slice(0, 30);
  const today = todayAll.filter((u) => real(u.email));
  const [rows, todayRows] = await Promise.all([journeys(recent), journeys(today)]);

  // Visiteurs du jour : la page où ils ont quitté le site (dernière page vue).
  const exits = new Map<string, number>();
  for (const v of visits) exits.set(v.path as string, (exits.get(v.path as string) ?? 0) + 1);
  return json({
    steps: STEPS,
    rows,
    today: {
      signups: today.length,
      stops: STEPS.map((_, i) => todayRows.filter((r) => r.reached === i).length),
      visits: visits.length,
      exits: [...exits.entries()].map(([page, count]) => ({ page, count })),
    },
  });
});
