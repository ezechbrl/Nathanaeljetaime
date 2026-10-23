import "server-only";
import { sendEmail } from "./email";
import { env } from "./env";
import { LAUNCH_OFFER } from "@/lib/content/pricing";
import { db, must } from "./supabase";

// Rappel de l'offre de lancement : un seul e-mail, à mi-parcours (12 h après l'inscription pour une offre de 24 h),
// à chaque inscrit qui n'est pas abonné. Appelé toutes les heures (tâche Vercel) : l'e-mail part entre 12 h et 13 h.
export async function sendOfferReminders() {
  const now = Date.now();
  const late = must(await db().from("users").select("id, email, first_name, created_at").eq("plan", "free")
    .lte("created_at", new Date(now - (LAUNCH_OFFER.hours / 2) * 3_600_000).toISOString()).gt("created_at", new Date(now - (LAUNCH_OFFER.hours - 1) * 3_600_000).toISOString())) as { id: string; email: string; first_name: string; created_at: string }[];
  let reminders = 0;
  for (const u of late) {
    const { error: dup } = await db().from("webhook_events").insert({ id: `offer-reminder:${u.id}` });
    if (dup || !u.email) continue;
    const hours = Math.max(1, Math.round((new Date(u.created_at).getTime() + LAUNCH_OFFER.hours * 3_600_000 - now) / 3_600_000));
    const name = u.first_name ? ` ${u.first_name}` : "";
    const url = `${env.appUrl()}/app/abonnement`;
    const ok = await sendEmail(
      u.email,
      `⏳ Plus que ${hours} h pour ton prix de lancement (−50 % à vie)`,
      `Salut${name},\n\nTon offre de lancement Vigenia se termine dans ${hours} h : −50 % à vie sur ton abonnement (39 € par mois au lieu de 78 € pour Starter, ou 199 € par an).\n\nAprès, le prix normal s'applique.\n\nChoisir mon offre : ${url}\n\nÀ tout de suite,\nL'équipe Vigenia`,
      undefined,
      reminderHtml(name, hours, url),
    );
    if (ok) reminders++;
    else await db().from("webhook_events").delete().eq("id", `offer-reminder:${u.id}`); // réessai au prochain passage si encore dans la fenêtre
  }
  return reminders;
}

// E-mail en HTML (tableaux et styles en ligne pour les messageries) : gros compteur, prix, bouton.
function reminderHtml(name: string, hours: number, url: string) {
  const price = (label: string, now: string, was: string) =>
    `<td style="padding:14px 16px;background:#0b3a2c;border:1px solid #1f6b52;border-radius:14px;text-align:center"><div style="font-size:13px;color:#a7f3d0">${label}</div><div style="margin-top:4px"><span style="font-size:15px;color:#9ca3af;text-decoration:line-through">${was}</span>&nbsp;<span style="font-size:26px;font-weight:700;color:#ffffff">${now}</span></div></td>`;
  return `<!doctype html><html lang="fr"><body style="margin:0;padding:0;background:#04211a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#04211a;padding:28px 12px;font-family:Helvetica,Arial,sans-serif;color:#e8fff6">
<tr><td align="center"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
<tr><td style="font-size:20px;font-weight:700;color:#ffffff;padding-bottom:18px">Vigenia</td></tr>
<tr><td style="background:linear-gradient(160deg,#0d5c44,#062e24);background-color:#0a4433;border:1px solid #2ee6a6;border-radius:22px;padding:30px 24px;text-align:center">
<div style="font-size:13px;font-weight:700;letter-spacing:1.5px;color:#d9f99d;text-transform:uppercase">Offre de lancement · −50 % à vie</div>
<div style="margin:18px 0 4px;font-size:64px;font-weight:800;line-height:1;color:#ffffff">${hours} h</div>
<div style="font-size:15px;color:#a7f3d0">avant la fin de ton prix de lancement</div>
<p style="margin:22px 0 0;font-size:16px;line-height:1.55;color:#e8fff6;text-align:left">Salut${name} 👋<br>Ta boutique t'attend. Si tu t'abonnes maintenant, tu gardes <b>−50 % pour toujours</b>, tant que tu restes abonné. Après le compteur, c'est le prix normal.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="8" style="margin-top:14px"><tr>${price("Starter / mois", "39 €", "78 €")}${price("Starter / an", "199 €", "398 €")}</tr></table>
<a href="${url}" style="display:inline-block;margin-top:22px;padding:15px 30px;border-radius:999px;background:#2ee6a6;color:#03140d;font-size:16px;font-weight:700;text-decoration:none">J'en profite maintenant →</a>
<div style="margin-top:14px;font-size:12px;color:#9ca3af">Sans engagement · Annulable en 1 clic · Payé sur ta facture Shopify</div>
</td></tr>
<tr><td style="padding:18px 6px 0;font-size:12px;color:#6b8f82;text-align:center">Tu reçois cet e-mail car tu as créé un compte Vigenia. Un seul rappel, promis.</td></tr>
</table></td></tr></table></body></html>`;
}
