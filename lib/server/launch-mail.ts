import "server-only";
import { sendEmail } from "./email";
import { env } from "./env";
import { LAUNCH_MODE } from "@/lib/launch";
import { LAUNCH_OFFER, PLANS, WAITLIST_PRICES, euro, withOffer } from "@/lib/content/pricing";
import { db, must } from "./supabase";
import { waitlistToken } from "./waitlist";

// Le jour du lancement (NEXT_PUBLIC_LAUNCH_MODE=open), un e-mail « C'est ouvert » à chaque inscrit de la liste d'attente,
// avec son prix réservé (moins cher que l'offre de lancement des autres).
// Appelé toutes les heures (tâche Vercel) : un seul e-mail par personne, par lots pour rester sous les limites de Resend.
const BATCH = 40;

export async function sendLaunchEmails() {
  if (LAUNCH_MODE !== "open") return 0;
  const list = must(await db().from("waitlist").select("email").order("created_at")) as { email: string }[];
  const starter = PLANS.find((p) => p.id === "pro")!;
  const p = { now: euro(WAITLIST_PRICES.pro.monthly), year: euro(WAITLIST_PRICES.pro.yearly), was: euro(starter.monthly), others: euro(withOffer(starter.monthly)) };
  let sent = 0;
  for (const { email } of list) {
    if (sent >= BATCH) break;
    if (!email || /@shopify\.com$/i.test(email)) continue;
    const { error: dup } = await db().from("webhook_events").insert({ id: `launch:${email}` });
    if (dup) continue; // déjà prévenu
    const url = `${env.appUrl()}/r/liste?t=${encodeURIComponent(waitlistToken(email))}`;
    const ok = await sendEmail(
      email,
      `🚀 C'est ouvert : ton prix réservé t'attend (${p.now}/mois à vie)`,
      `Salut,\n\nTu t'étais inscrit sur la liste d'attente : Vigenia est enfin ouvert !\n\nColle le lien d'un produit, et l'IA crée ta boutique Shopify complète : marque, photos de pro, textes, avis, offres par lot.\n\nPour te remercier, tu as un prix rien que pour toi, plus bas que celui des autres : Starter à ${p.now} par mois au lieu de ${p.was} (ou ${p.year} par an), à vie. Les autres paient ${p.others} avec l'offre de lancement.\n\nValable ${LAUNCH_OFFER.hours} h après la création de ton compte. Passe par ce lien pour qu'on te reconnaisse : ${url}\n\nAperçu gratuit avant de payer.\n\nÀ tout de suite,\nL'équipe Vigenia`,
      undefined,
      launchHtml(url, p),
    );
    if (ok) sent++;
    else { await db().from("webhook_events").delete().eq("id", `launch:${email}`); break; } // réessai au prochain passage
    await new Promise((r) => setTimeout(r, 600));
  }
  return sent;
}

// E-mail en HTML (tableaux et styles en ligne pour les messageries).
function launchHtml(url: string, p: { now: string; year: string; was: string; others: string }) {
  return `<!doctype html><html lang="fr"><body style="margin:0;padding:0;background:#04211a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#04211a;padding:28px 12px;font-family:Helvetica,Arial,sans-serif;color:#e8fff6">
<tr><td align="center"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
<tr><td style="font-size:20px;font-weight:700;color:#ffffff;padding-bottom:18px">Vigenia</td></tr>
<tr><td style="background:linear-gradient(160deg,#0d5c44,#062e24);background-color:#0a4433;border:1px solid #2ee6a6;border-radius:22px;padding:30px 24px;text-align:center">
<div style="font-size:13px;font-weight:700;letter-spacing:1.5px;color:#d9f99d;text-transform:uppercase">Liste d'attente · prix réservé</div>
<div style="margin:16px 0 6px;font-size:40px;font-weight:800;line-height:1.1;color:#ffffff">C'est ouvert 🚀</div>
<p style="margin:18px 0 0;font-size:16px;line-height:1.55;color:#e8fff6;text-align:left">Salut 👋<br>Tu t'étais inscrit sur la liste d'attente : <b>Vigenia est enfin en ligne</b>.<br><br>Colle le lien d'un produit, et l'IA crée ta boutique Shopify complète : marque, photos de pro, textes, avis, offres par lot.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px"><tr><td style="padding:16px;background:#0b3a2c;border:1px solid #2ee6a6;border-radius:16px;text-align:center">
<div style="font-size:13px;color:#a7f3d0">Ton prix, à vie · Starter</div>
<div style="margin-top:6px"><span style="font-size:16px;color:#9ca3af;text-decoration:line-through">${p.was}</span>&nbsp;<span style="font-size:34px;font-weight:800;color:#ffffff">${p.now}</span><span style="font-size:15px;color:#a7f3d0"> / mois</span></div>
<div style="margin-top:4px;font-size:13px;color:#a7f3d0">ou ${p.year} par an · les autres paient ${p.others}</div>
</td></tr></table>
<p style="margin:14px 0 0;font-size:14px;line-height:1.55;color:#a7f3d0;text-align:left">Valable ${LAUNCH_OFFER.hours} h après la création de ton compte. Passe par le bouton ci-dessous pour qu'on te reconnaisse. Aperçu gratuit avant de payer.</p>
<a href="${url}" style="display:inline-block;margin-top:22px;padding:15px 30px;border-radius:999px;background:#2ee6a6;color:#03140d;font-size:16px;font-weight:700;text-decoration:none">Créer ma boutique →</a>
<div style="margin-top:14px;font-size:12px;color:#9ca3af">Sans engagement · Annulable en 1 clic · Payé sur ta facture Shopify</div>
</td></tr>
<tr><td style="padding:18px 6px 0;font-size:12px;color:#6b8f82;text-align:center">Tu reçois cet e-mail car tu t'es inscrit sur la liste d'attente de Vigenia. C'est le seul, promis.</td></tr>
</table></td></tr></table></body></html>`;
}
