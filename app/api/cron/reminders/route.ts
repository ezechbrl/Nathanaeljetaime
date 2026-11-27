import { NextResponse } from "next/server";
import { safeEqual } from "@/lib/server/crypto";
import { env } from "@/lib/server/env";
import { syncImpact } from "@/lib/server/impact";
import { sendLaunchEmails } from "@/lib/server/launch-mail";
import { sendOfferReminders } from "@/lib/server/offer-reminders";
import { sendHesitationFollowups } from "@/lib/server/hesitation-followup";
import { fillQuizPhotos } from "@/lib/server/quiz-photos";
import { refreshEmailEvents } from "@/lib/server/email-tracking";

export const maxDuration = 120;

// Toutes les heures (voir vercel.json) : rappels de l'offre de lancement, e-mail « C'est ouvert » à la liste d'attente
// (seulement en mode open), parrainages Shopify (Impact) et état des mails envoyés (ouverts ou non).
export async function GET(req: Request) {
  const secret = env.cronSecret();
  if (!secret || !safeEqual(req.headers.get("authorization") ?? "", `Bearer ${secret}`)) return new NextResponse("non autorisé", { status: 401 });
  const impact = await syncImpact().catch((e) => { console.warn("Impact", (e as Error).message); return -1; });
  const launch = await sendLaunchEmails().catch((e) => { console.warn("Lancement", (e as Error).message); return -1; });
  const reminders = await sendOfferReminders();
  // Ceux qui hésitent (réponse sur l'aperçu ou paiement ouvert sans payer) : un e-mail rassurant + −15 %.
  const followups = await sendHesitationFollowups().catch((e) => { console.warn("Relance hésitation", (e as Error).message); return -1; });
  // Photos des univers et produits du quiz : quelques-unes par heure jusqu'à ce qu'il n'en manque plus.
  const photos = await fillQuizPhotos(16).catch((e) => { console.warn("Photos du quiz", (e as Error).message); return -1; });
  // État des mails envoyés (délivré, ouvert, cliqué) relu chez Resend.
  const emails = await refreshEmailEvents().catch((e) => { console.warn("Suivi des mails", (e as Error).message); return -1; });
  return NextResponse.json({ reminders, followups, photos, launch, impact, emails });
}
