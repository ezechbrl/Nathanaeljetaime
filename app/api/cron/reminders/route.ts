import { NextResponse } from "next/server";
import { safeEqual } from "@/lib/server/crypto";
import { env } from "@/lib/server/env";
import { sendOfferReminders } from "@/lib/server/offer-reminders";

// Deuxième passage de la journée pour les rappels de l'offre de lancement (voir vercel.json).
export async function GET(req: Request) {
  const secret = env.cronSecret();
  if (!secret || !safeEqual(req.headers.get("authorization") ?? "", `Bearer ${secret}`)) return new NextResponse("non autorisé", { status: 401 });
  return NextResponse.json({ reminders: await sendOfferReminders() });
}
