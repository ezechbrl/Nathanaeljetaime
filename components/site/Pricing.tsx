"use client";

import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AuroraBackground, IntervalToggle, PlanCards, TrustRow, planButtonClass, type Interval } from "@/components/pricing/PlanCards";
import { CTA } from "@/lib/launch";
import { AI_FAIR_USE, LAUNCH_OFFER, PAID_PLANS } from "@/lib/content/pricing";

// Les deux offres (Starter et Pro), au mois ou à l'année (−30 %).
export function PricingCards() {
  const [interval, setPeriod] = useState<Interval>("month");
  return (
    <div className="relative isolate mx-auto max-w-[940px] overflow-hidden rounded-[28px] border border-white/10 px-4 py-10 sm:px-10">
      <AuroraBackground className="-z-10" />
      <p className="mb-5 text-center text-[14px] font-semibold text-[#bef264]">🎁 Offre de lancement : 40 € au lieu de 50 € (et 80 € au lieu de 90 €), à vie, si tu t'abonnes dans les {LAUNCH_OFFER.hours} h après ton inscription</p>
      <IntervalToggle value={interval} onChange={setPeriod} />
      <div className="mx-auto mt-8 max-w-[780px]">
        <PlanCards
          interval={interval}
          action={(plan, iv) => (
            <Link href={`/inscription?plan=${plan.id}&interval=${iv}`} className={planButtonClass(plan.featured)}>
              {CTA.short} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        />
        <TrustRow />
      </div>
    </div>
  );
}

const ROWS: { label: string; values: (string | boolean)[] }[] = [
  { label: "Boutiques", values: PAID_PLANS.map((p) => p.limits.stores) },
  { label: "Messages à l'IA", values: PAID_PLANS.map((p) => p.limits.conversations) },
  { label: "Images générées", values: PAID_PLANS.map((p) => p.limits.images) },
  { label: "Boutiques Shopify connectées", values: PAID_PLANS.map((p) => p.limits.shops) },
  { label: "Capacité d'IA (crédit rechargé toutes les 5 h)", values: PAID_PLANS.map((p) => p.limits.ai) },
  { label: "Import depuis un lien et vrais avis", values: [true, true] },
  { label: "Refonte de boutique existante", values: [true, true] },
  { label: "Optimisation quotidienne", values: [false, true] },
  { label: "Support", values: ["E-mail", "Prioritaire"] },
];

export function PricingTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-[15px]">
        <thead>
          <tr className="border-b border-white/[0.08]">
            <th className="py-4 font-normal text-fg-muted">Comparer les offres</th>
            {PAID_PLANS.map((p) => <th key={p.id} className="py-4 text-center font-normal">{p.name}</th>)}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.label} className="border-b border-white/[0.05]">
              <td className="py-3.5 text-fg-muted">{r.label}</td>
              {r.values.map((v, i) => (
                <td key={i} className="py-3.5 text-center">
                  {v === true ? <Check className="mx-auto h-4 w-4 text-accent" aria-label="Inclus" /> : v === false ? <span className="text-fg-faint" aria-label="Non inclus">—</span> : v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 max-w-2xl text-sm text-fg-faint">{AI_FAIR_USE}</p>
    </div>
  );
}
