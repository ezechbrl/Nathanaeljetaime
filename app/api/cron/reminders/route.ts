import { NextResponse } from "next/server";
import { safeEqual } from "@/lib/server/crypto";
import { env } from "@/lib/server/env";
import { syncImpact } from "@/lib/server/impact";
import { sendLaunchEmails } from "@/lib/server/launch-mail";
import { sendOfferReminders } from "@/lib/server/offer-reminders";

export const maxDuration = 120;

// Toutes les heures (voir vercel.json) : rappels de l'offre de lancement, e-mail « C'est ouvert » à la liste d'attente
// (seulement en mode open) et parrainages Shopify (Impact).
export async function GET(req: Request) {
  const secret = env.cronSecret();
  if (!secret || !safeEqual(req.headers.get("authorization") ?? "", `Bearer ${secret}`)) return new NextResponse("non autorisé", { status: 401 });
  const impact = await syncImpact().catch((e) => { console.warn("Impact", (e as Error).message); return -1; });
  const launch = await sendLaunchEmails().catch((e) => { console.warn("Lancement", (e as Error).message); return -1; });
  return NextResponse.json({ reminders: await sendOfferReminders(), launch, impact });
}
