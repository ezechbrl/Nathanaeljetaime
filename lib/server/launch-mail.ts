import "server-only";
import { sendEmail } from "./email";
import { env } from "./env";
import { LAUNCH_MODE } from "@/lib/launch";
import { LAUNCH_OFFER } from "@/lib/content/pricing";
import { db, must } from "./supabase";

// Le jour du lancement (NEXT_PUBLIC_LAUNCH_MODE=open), un e-mail « C'est ouvert » à chaque inscrit de la liste d'attente.
// Appelé toutes les heures (tâche Vercel) : un seul e-mail par personne, par lots pour rester sous les limites de Resend.
const BATCH = 40;

export async function sendLaunchEmails() {
  if (LAUNCH_MODE !== "open") return 0;
  const list = must(await db().from("waitlist").select("email").order("created_at")) as { email: string }[];
  const url = `${env.appUrl()}/inscription`;
  let sent = 0;
  for (const { email } of list) {
    if (sent >= BATCH) break;
    if (!email || /@shopify\.com$/i.test(email)) continue;
    const { error: dup } = await db().from("webhook_events").insert({ id: `launch:${email}` });
    if (dup) continue; // déjà prévenu
    const ok = await sendEmail(
      email,
      "🚀 C'est ouvert : Vigenia est en ligne",
      `Salut,\n\nTu t'étais inscrit sur la liste d'attente : Vigenia est enfin ouvert !\n\nColle le lien d'un produit, et l'IA crée ta boutique Shopify complète : marque, photos de pro, textes, avis, offres par lot.\n\nAperçu gratuit avant de payer. Et si tu t'abonnes dans les ${LAUNCH_OFFER.hours} h après ton inscription, tu gardes −50 % à vie.\n\nCréer ma boutique : ${url}\n\nÀ tout de suite,\nL'équipe Vigenia`,
      undefined,
      launchHtml(url),
    );
    if (ok) sent++;
    else { await db().from("webhook_events").delete().eq("id", `launch:${email}`); break; } // réessai au prochain passage
    await new Promise((r) => setTimeout(r, 600));
  }
  return sent;
}

// E-mail en HTML (tableaux et styles en ligne pour les messageries).
function launchHtml(url: string) {
  return `<!doctype html><html lang="fr"><body style="margin:0;padding:0;background:#04211a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#04211a;padding:28px 12px;font-family:Helvetica,Arial,sans-serif;color:#e8fff6">
<tr><td align="center"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
<tr><td style="font-size:20px;font-weight:700;color:#ffffff;padding-bottom:18px">Vigenia</td></tr>
<tr><td style="background:linear-gradient(160deg,#0d5c44,#062e24);background-color:#0a4433;border:1px solid #2ee6a6;border-radius:22px;padding:30px 24px;text-align:center">
<div style="font-size:13px;font-weight:700;letter-spacing:1.5px;color:#d9f99d;text-transform:uppercase">Liste d'attente · c'est ton tour</div>
<div style="margin:16px 0 6px;font-size:40px;font-weight:800;line-height:1.1;color:#ffffff">C'est ouvert 🚀</div>
<p style="margin:18px 0 0;font-size:16px;line-height:1.55;color:#e8fff6;text-align:left">Salut 👋<br>Tu t'étais inscrit sur la liste d'attente : <b>Vigenia est enfin en ligne</b>.<br><br>Colle le lien d'un produit, et l'IA crée ta boutique Shopify complète : marque, photos de pro, textes, avis, offres par lot.</p>
<p style="margin:14px 0 0;font-size:15px;line-height:1.55;color:#a7f3d0;text-align:left">Aperçu gratuit avant de payer. Et si tu t'abonnes dans les ${LAUNCH_OFFER.hours} h après ton inscription, tu gardes <b>−50 % à vie</b>.</p>
<a href="${url}" style="display:inline-block;margin-top:24px;padding:15px 30px;border-radius:999px;background:#2ee6a6;color:#03140d;font-size:16px;font-weight:700;text-decoration:none">Créer ma boutique →</a>
<div style="margin-top:14px;font-size:12px;color:#9ca3af">Sans engagement · Annulable en 1 clic · Payé sur ta facture Shopify</div>
</td></tr>
<tr><td style="padding:18px 6px 0;font-size:12px;color:#6b8f82;text-align:center">Tu reçois cet e-mail car tu t'es inscrit sur la liste d'attente de Vigenia. C'est le seul, promis.</td></tr>
</table></td></tr></table></body></html>`;
}
