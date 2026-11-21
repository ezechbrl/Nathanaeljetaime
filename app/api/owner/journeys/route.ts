import { json, route } from "@/lib/server/http";
import { isOwnerEmail, requireOwner } from "@/lib/server/owner";
import { db, must } from "@/lib/server/supabase";

// Parcours des derniers inscrits (Ventes) : d'où ils viennent, leur boutique, et où ils se sont arrêtés.
const STEPS = ["Compte créé", "Boutique lancée", "Aperçu prêt", "Page de paiement", "Abonné", "Boutique complète", "Envoyée sur Shopify"] as const;

export const GET = route(async () => {
  await requireOwner();
  const users = (must(await db().from("users").select("id, email, created_at").order("created_at", { ascending: false }).limit(80)) as Record<string, any>[])
    .filter((u) => !isOwnerEmail(u.email) && !/@shopify\.com$/i.test(u.email ?? "")).slice(0, 30);
  if (!users.length) return json({ steps: STEPS, rows: [] });
  const ids = users.map((u) => u.id as string);
  const oldest = users.at(-1)!.created_at as string;
  const from = new Date(new Date(oldest).getTime() - 3 * 3_600_000).toISOString();

  const [stores, events, subs, linked, around] = await Promise.all([
    db().from("stores").select("id, user_id, name, status, teaser, created_at").in("user_id", ids).order("created_at", { ascending: false }),
    db().from("revenue_events").select("user_id, kind, created_at").in("user_id", ids),
    db().from("subscriptions").select("user_id, plan, status, test").in("user_id", ids),
    db().from("site_sessions").select("user_id, first_seen, last_seen, source, device, country, entry, path, pages").in("user_id", ids).order("first_seen"),
    // Avant le suivi par compte : les visites en cours au moment de l'inscription (pour une estimation).
    db().from("site_sessions").select("first_seen, last_seen, source, device, country, entry, path, pages, excluded, user_id").gte("last_seen", from).order("first_seen").limit(3000),
  ]).then((rs) => rs.map((r) => must(r) as Record<string, any>[]));

  const storeIds = stores.map((s) => s.id as string);
  const assets = storeIds.length
    ? (must(await db().from("assets").select("store_id, kind, url, created_at").in("store_id", storeIds).in("kind", ["banner", "product"]).order("created_at")) as Record<string, any>[])
    : [];

  const rows = users.map((u) => {
    const t = new Date(u.created_at).getTime();
    const mine = linked.filter((s) => s.user_id === u.id);
    // Origine : la toute première visite reliée au compte ; sinon, la seule visite en cours à l'inscription (« probable »).
    let origin: Record<string, any> | null = mine[0] ?? null;
    let sure = !!origin;
    if (!origin) {
      const at = around.filter((s) => !s.excluded && !s.user_id && new Date(s.first_seen).getTime() <= t + 60_000 && new Date(s.last_seen).getTime() >= t - 60_000);
      if (at.length === 1) origin = at[0];
      sure = false;
    }
    const last = mine.length ? mine.reduce((a, b) => (new Date(b.last_seen) > new Date(a.last_seen) ? b : a)) : null;
    const st = stores.filter((s) => s.user_id === u.id);
    const store = st[0] ?? null;
    const ev = events.filter((e) => e.user_id === u.id);
    const sub = subs.find((s) => s.user_id === u.id);
    const paid = ev.some((e) => e.kind === "new") || (!!sub && sub.status === "active" && sub.plan !== "free" && !sub.test);
    const done = [
      true,
      st.length > 0,
      st.some((s) => s.teaser || ["locked", "ready", "publishing", "published"].includes(s.status)),
      ev.some((e) => e.kind === "checkout"),
      paid,
      st.some((s) => ["ready", "publishing", "published"].includes(s.status)),
      st.some((s) => s.status === "published"),
    ];
    let reached = 0;
    done.forEach((d, i) => { if (d) reached = i; });
    const img = store ? (assets.find((a) => a.store_id === store.id && a.kind === "banner") ?? assets.find((a) => a.store_id === store.id))?.url ?? store.teaser?.image ?? null : null;
    return {
      email: u.email as string,
      at: u.created_at as string,
      source: origin ? { name: origin.source as string, device: origin.device as string, country: (origin.country as string | null) ?? null, entry: origin.entry as string, sure } : null,
      lastSeen: last ? { at: last.last_seen as string, page: last.path as string } : null,
      visits: mine.length,
      store: store ? { id: store.id as string, name: store.name as string, status: store.status as string, image: img as string | null, count: st.length } : null,
      done,
      reached,
      cancelled: ev.some((e) => e.kind === "cancel"),
    };
  });
  return json({ steps: STEPS, rows });
});
