import { json, route } from "@/lib/server/http";
import { isOwnerEmail, requireOwner } from "@/lib/server/owner";
import { db, must } from "@/lib/server/supabase";

// Ventes : qui a ouvert la page de paiement sans payer (7 derniers jours), quelle offre, combien de fois.
// Attention aux noms : dans la base, « pro » = Starter (29 €), « agency » = Pro (59 €), « single » = Ma boutique (39 €).
export const GET = route(async () => {
  await requireOwner();
  const since = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const ev = must(await db().from("revenue_events").select("user_id, kind, plan, billing_interval, created_at, users!inner(email, discount_percent, discount_until)").in("kind", ["checkout", "new", "single"]).gte("created_at", since).order("created_at")) as any[];
  const people = new Map<string, any>();
  for (const e of ev) {
    const email = e.users?.email as string;
    if (!email || isOwnerEmail(email) || /@shopify\.com$/i.test(email)) continue;
    const p = people.get(e.user_id) ?? { userId: e.user_id, email, discount: e.users?.discount_until && new Date(e.users.discount_until) > new Date() ? e.users.discount_percent : null, opens: 0, plans: {} as Record<string, number>, first: e.created_at, last: e.created_at, paid: false };
    if (e.kind === "checkout") {
      p.opens += 1;
      const k = `${e.plan}${e.billing_interval ? `:${e.billing_interval}` : ""}`;
      p.plans[k] = (p.plans[k] ?? 0) + 1;
      p.last = e.created_at;
    } else p.paid = true;
    people.set(e.user_id, p);
  }
  const list = [...people.values()].filter((p) => p.opens > 0);
  const ids = list.map((p) => p.userId);
  const stores = ids.length ? (must(await db().from("stores").select("id, user_id, name, status").in("user_id", ids).order("created_at", { ascending: false })) as any[]) : [];
  const hes = ids.length ? (must(await db().from("hesitations").select("user_id, reason, details").in("user_id", ids)) as any[]) : [];
  return json({
    people: list
      .map((p) => ({ ...p, stores: stores.filter((s) => s.user_id === p.userId).map((s) => ({ id: s.id, name: s.name, status: s.status })), hesitation: hes.find((h) => h.user_id === p.userId) ?? null }))
      .sort((a, b) => +new Date(b.last) - +new Date(a.last)),
  });
});
