import "server-only";
import { sendEmail } from "./email";
import { trackEmail } from "./email-tracking";
import { env } from "./env";
import { isOwnerEmail } from "./owner";
import { discounted } from "./stripe-billing";
import { PAID_PLANS, SINGLE } from "@/lib/content/pricing";
import { db, must } from "./supabase";

// Demandé par Ezechiel : un e-mail automatique, une seule fois par personne, à ceux qui hésitent à se lancer :
// - ceux qui ont répondu à « Qu'est-ce qui te fait hésiter ? » sur l'aperçu ;
// - ceux qui ont ouvert la page de paiement sans payer.
// 1 h après (le temps de payer d'eux-mêmes), jamais la nuit. L'e-mail rassure selon la raison donnée et
// active une vraie réduction personnelle de −15 % à vie sur l'abonnement, valable 7 jours.
const PERCENT = 15;
const DAYS = 7;
const TEST = /^(ezechiel\.barrellon|zouzou\.barrellon)/i;

const OPENERS: Record<string, string> = {
  price: "Tu m'as dit que c'était un peu cher pour toi. Je comprends, surtout quand on débute.",
  doubt: "Tu m'as dit que tu n'étais pas sûr que ça marche pour toi. C'est normal : presque tout le monde hésite avant de se lancer.\n\nJe vais être honnête : personne ne peut te promettre des ventes. Mais ta boutique est déjà prête, et c'est souvent l'étape où les gens bloquent.",
  unclear: "Tu m'as dit que ce n'était pas clair. Ce que tu reçois : ta boutique complète (textes, photos, design, fiche produit et pages), installée sur ton propre compte Shopify, puis modifiable en discutant avec l'IA. Elle t'appartient.",
  quality: "Tu m'as dit que l'aperçu ne te plaisait pas assez. Une fois débloquée, tu peux tout changer en discutant avec l'IA : couleurs, textes, photos, sections.",
  later: "Tu m'as dit que tu regardais juste pour l'instant. Aucun souci, prends ton temps : ta boutique reste dans ton compte.",
  other: "Tu as hésité avant de te lancer. C'est normal, et je préfère t'écrire directement.",
  checkout: "J'ai vu que tu es allé jusqu'à la page de paiement, sans finir. Si quelque chose t'a bloqué, je préfère le savoir.",
};

export async function sendHesitationFollowups() {
  const now = Date.now();
  const parisHour = Number(new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", hour12: false }).format(new Date(now)));
  if (parisHour >= 22 || parisHour < 8) return 0; // jamais la nuit : ça part le matin
  const from = new Date(now - 72 * 3_600_000).toISOString();
  const to = new Date(now - 3_600_000).toISOString();
  const [hes, opens] = await Promise.all([
    db().from("hesitations").select("user_id, reason, created_at").gte("created_at", from).lte("created_at", to).not("user_id", "is", null).order("created_at"),
    db().from("revenue_events").select("user_id, created_at").eq("kind", "checkout").gte("created_at", from).lte("created_at", to),
  ]).then((rs) => rs.map((r) => must(r) as { user_id: string; reason?: string }[]));
  const reasons = new Map<string, string>();
  for (const o of opens) reasons.set(o.user_id, "checkout");
  for (const h of hes) reasons.set(h.user_id, h.reason ?? "other"); // la raison donnée passe avant
  if (!reasons.size) return 0;
  const ids = [...reasons.keys()];
  const [users, paid, stores] = await Promise.all([
    db().from("users").select("id, email, first_name, plan, discount_percent").in("id", ids),
    db().from("revenue_events").select("user_id").in("user_id", ids).in("kind", ["new", "single"]),
    db().from("stores").select("user_id, name").in("user_id", ids).order("created_at", { ascending: false }),
  ]).then((rs) => rs.map((r) => must(r) as Record<string, any>[]));
  const paidIds = new Set(paid.map((p) => p.user_id));
  let sent = 0;
  for (const u of users) {
    const email = String(u.email ?? "");
    // Déjà abonné ou déjà payé, compte de test, évaluateur Shopify, ou réduction déjà proposée (mail perso) : rien.
    if (!email || u.plan !== "free" || paidIds.has(u.id) || u.discount_percent != null || isOwnerEmail(email) || TEST.test(email) || /@shopify\.com$/i.test(email)) continue;
    const { error: dup } = await db().from("webhook_events").insert({ id: `followup:${u.id}` });
    if (dup) continue;
    const until = new Date(now + DAYS * 86_400_000);
    await db().from("users").update({ discount_percent: PERCENT, discount_until: until.toISOString() }).eq("id", u.id);
    const store = stores.find((s) => s.user_id === u.id)?.name as string | undefined;
    const ok = await sendEmail(email, store ? `Ta boutique ${store} : un coup de pouce pour te lancer` : "Un coup de pouce pour lancer ta boutique", text(u.first_name, reasons.get(u.id)!, until));
    if (ok) { sent++; await trackEmail(ok, "followup", email, u.id); }
    else {
      // Échec d'envoi : on annule tout, nouvel essai au prochain passage.
      await db().from("users").update({ discount_percent: null, discount_until: null }).eq("id", u.id);
      await db().from("webhook_events").delete().eq("id", `followup:${u.id}`);
    }
  }
  return sent;
}

function text(firstName: string | null, reason: string, until: Date) {
  const [starter, pro] = PAID_PLANS;
  const day = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", weekday: "long", day: "numeric", month: "long" }).format(until);
  return `Salut${firstName ? ` ${firstName}` : ""},

C'est Ezechiel, le créateur de Vigenia. ${OPENERS[reason] ?? OPENERS.other}

Pour lancer ta boutique, voici ce qu'on fera :
1. La mettre en ligne sur Shopify (je t'aide si ça bloque).
2. Choisir ton fournisseur et un prix qui te laisse une marge.
3. Faire quelques vidéos courtes pour montrer ton produit.

Pour t'aider à démarrer, je t'ai mis une réduction personnelle de −${PERCENT} % à vie sur l'abonnement :
- ${starter.name} : ${discounted(starter.monthly, PERCENT)} € par mois au lieu de ${starter.monthly} € (ou ${discounted(starter.yearly, PERCENT)} € l'année au lieu de ${starter.yearly} €)
- ${pro.name} : ${discounted(pro.monthly, PERCENT)} € par mois au lieu de ${pro.monthly} €
Elle est déjà activée sur ton compte, valable jusqu'au ${day} inclus :
${env.appUrl()}/app/abonnement

Et si tu veux juste ta boutique, sans abonnement, « Ma boutique » est à ${SINGLE.price} € une seule fois. C'est sans engagement.

Si tu as une question, même petite, réponds à ce mail : je te réponds moi-même.

Ezechiel
Vigenia

Tu reçois cet e-mail car tu as créé un compte Vigenia. C'est le seul que je t'envoie à ce sujet.`;
}
