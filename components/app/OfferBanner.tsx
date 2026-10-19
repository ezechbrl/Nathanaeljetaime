"use client";

import { ArrowRight, Timer } from "lucide-react";
import Link from "next/link";
import { useCountdown } from "@/components/pricing/PlanCards";
import * as api from "@/lib/api/client";
import { useApi } from "@/lib/api/hooks";
import { LAUNCH_OFFER } from "@/lib/content/pricing";
import { useApp } from "./AppContext";

// Bandeau en haut de l'espace client : compte à rebours de l'offre de lancement tant qu'on n'est pas abonné.
export function OfferBanner() {
  const { user } = useApp();
  const billing = useApi(() => (user.plan === "free" ? api.getBilling() : Promise.resolve(null)), [user.plan]);
  const left = useCountdown(billing.data?.offerEndsAt);
  if (user.plan !== "free" || !left) return null;
  return (
    <Link href="/app/abonnement" className="group sticky top-0 z-30 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-b border-[#2ee6a6]/30 bg-[linear-gradient(90deg,rgb(16_176_127/0.35),rgb(163_230_53/0.18))] px-4 py-2 text-[13.5px] backdrop-blur">
      <span className="font-bold uppercase tracking-[0.04em]">Offre de lancement : −{LAUNCH_OFFER.percent} % à vie</span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-0.5 font-semibold tabular-nums"><Timer className="h-3.5 w-3.5 text-[#a7f3d0]" /> {left.h}:{left.m}:{left.s}</span>
      <span className="inline-flex items-center gap-1 font-semibold text-[#d9f99d]">Choisir mon offre <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
    </Link>
  );
}
