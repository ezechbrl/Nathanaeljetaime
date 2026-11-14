import "server-only";
import { env } from "./env";
import { db } from "./supabase";

// Suivi des mails envoyés aux clients (rappels d'offre, lancement) : délivré, ouvert, cliqué…
// L'état vient de Resend. « Ouvert » n'est connu que si le suivi d'ouverture est activé sur le domaine
// dans Resend (Domains → vigenia.com → Open tracking).

export async function trackEmail(resendId: string | false, kind: string, email: string, userId?: string | null) {
  if (!resendId || resendId === "sent") return;
  await db().from("email_events").upsert({ id: resendId, kind, email, user_id: userId ?? null, last_event: "sent" }).then(() => {}, () => {});
}

const FINAL = ["opened", "clicked", "bounced", "complained"];

// Relit chez Resend l'état des mails des 7 derniers jours (appelé chaque heure par la tâche planifiée).
export async function refreshEmailEvents(max = 25) {
  const key = env.resendKey();
  if (!key) return 0;
  const { data } = await db().from("email_events").select("id, last_event")
    .gte("sent_at", new Date(Date.now() - 7 * 86_400_000).toISOString())
    .order("checked_at", { ascending: true, nullsFirst: true }).limit(100);
  const todo = (data ?? []).filter((e) => !FINAL.includes(e.last_event ?? "")).slice(0, max);
  let updated = 0;
  for (const e of todo) {
    const res = await fetch(`https://api.resend.com/emails/${encodeURIComponent(e.id)}`, { headers: { authorization: `Bearer ${key}` } }).catch(() => null);
    if (res?.ok) {
      const out = (await res.json().catch(() => ({}))) as { last_event?: string };
      await db().from("email_events").update({ last_event: out.last_event ?? e.last_event, checked_at: new Date().toISOString() }).eq("id", e.id);
      updated++;
    }
    await new Promise((r) => setTimeout(r, 600)); // limite de Resend : 2 requêtes par seconde
  }
  return updated;
}
