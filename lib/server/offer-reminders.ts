import "server-only";
import { sendEmail } from "./email";
import { env } from "./env";
import { db, must } from "./supabase";

// Rappel de l'offre de lancement : un e-mail quand il reste moins de 24 h et que la personne n'est pas abonnée.
// Appelé deux fois par jour (deux tâches Vercel) : l'e-mail part entre 24 h et 36 h après l'inscription, une seule fois.
export async function sendOfferReminders() {
  const now = Date.now();
  const late = must(await db().from("users").select("id, email, first_name, created_at").eq("plan", "free")
    .lte("created_at", new Date(now - 24 * 3_600_000).toISOString()).gt("created_at", new Date(now - 48 * 3_600_000).toISOString())) as { id: string; email: string; first_name: string; created_at: string }[];
  let reminders = 0;
  for (const u of late) {
    const { error: dup } = await db().from("webhook_events").insert({ id: `offer-reminder:${u.id}` });
    if (dup || !u.email) continue;
    const hours = Math.max(1, Math.round((new Date(u.created_at).getTime() + 48 * 3_600_000 - now) / 3_600_000));
    const ok = await sendEmail(u.email, `Plus que ${hours} h pour ton prix de lancement (−50 % à vie)`,
      `Salut${u.first_name ? ` ${u.first_name}` : ""},\n\nTon offre de lancement Vitrio se termine dans ${hours} h : −50 % à vie sur ton abonnement (39 € par mois au lieu de 78 € pour Starter, ou 199 € par an).\n\nAprès, le prix normal s'applique.\n\nChoisir mon offre : ${env.appUrl()}/app/abonnement\n\nÀ tout de suite,\nL'équipe Vitrio`);
    if (ok) reminders++;
    else await db().from("webhook_events").delete().eq("id", `offer-reminder:${u.id}`); // réessai au prochain passage si encore dans la fenêtre
  }
  return reminders;
}
