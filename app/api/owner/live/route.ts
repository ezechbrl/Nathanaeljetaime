import { json, route } from "@/lib/server/http";
import { requireOwner } from "@/lib/server/owner";
import { db, must } from "@/lib/server/supabase";

// Les questions du quiz, en clair (même ordre que le quiz).
const QUIZ_STEP: Record<string, string> = {
  level: "son niveau en e-commerce", goal: "son objectif", time: "son temps disponible", budget: "son budget", shopify: "s'il a Shopify",
  idea: "s'il a une idée de produit", account: "la création de son compte", big: "la grande catégorie", sub: "la petite catégorie", product: "le choix du produit",
  audience: "à qui vendre", market: "les pays de vente", supply: "la livraison", channel: "où trouver ses clients", price: "le prix de vente", style: "sa boutique préférée (cœur / croix)",
};

// Ventes · En direct : qui est sur le site en ce moment (actif dans les 3 dernières minutes) et ce qu'il fait.
export const GET = route(async () => {
  await requireOwner();
  const now = Date.now();
  const since = new Date(now - 3 * 60_000).toISOString();
  const sessions = must(await db().from("site_sessions").select("id, visitor, user_id, entry, path, pages, source, device, country, first_seen, last_seen")
    .eq("excluded", false).gte("last_seen", since).order("last_seen", { ascending: false }).limit(20)) as Record<string, any>[];
  const visitors = sessions.map((s) => s.visitor).filter(Boolean);
  const userIds = sessions.map((s) => s.user_id).filter(Boolean);
  const recent = new Date(now - 45 * 60_000).toISOString();
  const [quiz, users, stores, checkouts] = await Promise.all([
    visitors.length ? db().from("quiz_runs").select("visitor, last_step, max_index, total, finished, updated_at").in("visitor", visitors).gte("updated_at", recent).order("updated_at", { ascending: false }) : { data: [] },
    userIds.length ? db().from("users").select("id, email, created_at").in("id", userIds) : { data: [] },
    userIds.length ? db().from("stores").select("id, user_id, name, status, created_at").in("user_id", userIds).order("created_at", { ascending: false }) : { data: [] },
    userIds.length ? db().from("revenue_events").select("user_id, kind, created_at").in("user_id", userIds).in("kind", ["checkout", "new"]).gte("created_at", recent) : { data: [] },
  ]);
  const people = sessions.map((s) => {
    const q = (quiz.data ?? []).find((x: any) => x.visitor === s.visitor) as any;
    const u = (users.data ?? []).find((x: any) => x.id === s.user_id) as any;
    const st = (stores.data ?? []).find((x: any) => x.user_id === s.user_id) as any;
    const ev = (checkouts.data ?? []).filter((x: any) => x.user_id === s.user_id) as any[];
    const path = s.path as string;
    // Ce qu'il fait, en une phrase.
    let doing = "Regarde la page d'accueil";
    if (ev.some((e) => e.kind === "new")) doing = "Vient de s'abonner 🎉";
    else if (path.startsWith("/app/abonnement")) doing = ev.length ? "Est sur le choix de l'offre (a déjà ouvert le paiement Stripe)" : "Regarde les offres et les prix";
    else if (/^\/app\/boutiques\/[^/]+/.test(path)) doing = st ? `Regarde son aperçu « ${st.name} »${st.status === "generating" ? " (en création)" : st.status === "locked" ? " (pas encore payé)" : ""}` : "Regarde sa boutique";
    else if (path === "/quiz" || path.startsWith("/app/quiz")) doing = q ? (q.finished ? "A fini le quiz, son aperçu se crée" : `Répond au quiz : question ${Math.min(q.max_index + 1, q.total ?? 15)} sur ${q.total ?? 15} (${QUIZ_STEP[q.last_step] ?? q.last_step})`) : "Commence le quiz";
    else if (path.startsWith("/inscription")) doing = "Crée son compte";
    else if (path.startsWith("/connexion")) doing = "Se connecte";
    else if (path.startsWith("/tarifs")) doing = "Regarde la page des prix";
    else if (path.startsWith("/exemples")) doing = "Regarde les exemples de boutiques";
    else if (path.startsWith("/blog")) doing = "Lit un article du blog";
    else if (path === "/app" || path === "/app/") doing = "Est dans son espace (créer une boutique)";
    else if (path !== "/") doing = `Est sur la page ${path}`;
    return {
      id: s.id, doing, email: u?.email ?? null, source: s.source, device: s.device, country: s.country, pages: s.pages,
      since: s.first_seen, lastSeen: s.last_seen, store: st ? { id: st.id, name: st.name, status: st.status } : null,
      quiz: q ? { step: QUIZ_STEP[q.last_step] ?? q.last_step, index: q.max_index, total: q.total, finished: q.finished } : null,
      checkout: ev.some((e) => e.kind === "checkout"),
    };
  });
  return json({ people });
});
