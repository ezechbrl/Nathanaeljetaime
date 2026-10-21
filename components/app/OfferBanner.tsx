"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCountdown } from "@/components/pricing/PlanCards";
import * as api from "@/lib/api/client";
import { useApi } from "@/lib/api/hooks";
import { LAUNCH_OFFER } from "@/lib/content/pricing";
import { useApp } from "./AppContext";

// Grand bandeau en haut de l'espace client : compte à rebours de l'offre de lancement tant qu'on n'est pas abonné.
export function OfferBanner() {
  const { user } = useApp();
  const billing = useApi(() => (user.plan === "free" ? api.getBilling() : Promise.resolve(null)), [user.plan]);
  const left = useCountdown(billing.data?.offerEndsAt);
  if (user.plan !== "free" || !left) return null;
  const units = [{ v: left.h, l: "heures" }, { v: left.m, l: "minutes" }, { v: left.s, l: "secondes" }];
  return (
    <Link href="/app/abonnement" className="group relative z-30 block border-b lg:sticky lg:top-0 border-white/[0.08] bg-black/25 px-4 py-2.5 backdrop-blur-xl sm:px-8">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <div>
          <p className="text-[16px] font-bold uppercase tracking-[0.03em] text-white sm:text-[18px]">Offre de lancement : −{LAUNCH_OFFER.percent} % à vie</p>
          <p className="text-[13px] text-white/85 sm:text-[14px]"><span className="font-semibold text-white">39 €/mois</span> au lieu de <span className="line-through decoration-[#ef4444] decoration-2">78 €</span>, pour toujours. Valable 48 h après ton inscription.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-end gap-1.5 tabular-nums" aria-label={`Il reste ${left.h} heures et ${left.m} minutes`}>
            {units.map((u, i) => (
              <div key={u.l} className="flex items-end gap-1.5">
                {i > 0 && <span className="pb-4 text-lg font-semibold text-white/60">:</span>}
                <span className="flex flex-col items-center">
                  <span className="grid h-9 min-w-[2.6rem] place-items-center rounded-lg border border-white/20 bg-black/35 px-1.5 text-[1.4rem] font-bold leading-none text-white sm:h-11 sm:text-[1.6rem]">{u.v}</span>
                  <span className="mt-0.5 text-[8.5px] font-semibold uppercase tracking-wider text-white/60">{u.l}</span>
                </span>
              </div>
            ))}
          </div>
          <span className="hidden items-center gap-1.5 rounded-full bg-[linear-gradient(180deg,#34f0b0,#0fae7c)] px-4 py-2 text-[13.5px] font-semibold text-[#03140d] shadow-[0_0_20px_rgb(46_230_166/0.5)] transition-transform group-hover:-translate-y-px md:inline-flex">
            En profiter <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
