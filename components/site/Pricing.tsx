"use client";

import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AuroraBackground, IntervalToggle, TrustRow, type Interval } from "@/components/pricing/PlanCards";
import { PlanPicker, pickerButtonClass } from "@/components/pricing/PlanPicker";
import { CTA } from "@/lib/launch";
import { AI_FAIR_USE, LAUNCH_OFFER, PAID_PLANS, SINGLE } from "@/lib/content/pricing";

// Les deux offres (Starter et Pro), au mois ou à l'année.
export function PricingCards() {
  const [interval, setPeriod] = useState<Interval>("month");
  return (
    <div className="relative isolate mx-auto max-w-[760px] overflow-clip rounded-[28px] border border-white/10 px-4 py-10 sm:px-10">
      <AuroraBackground className="-z-10" />
      <div className="mx-auto mb-6 max-w-[760px] rounded-[18px] border border-white/15 bg-white/[0.03] px-5 py-3 text-center">
        <p className="text-[15px] font-bold uppercase tracking-[0.04em]">Offre de bienvenue : ta boutique à {SINGLE.offer} € au lieu de {SINGLE.price} €</p>
        <p className="text-[12.5px] text-fg-muted">« Ma boutique », en paiement unique, pendant les {LAUNCH_OFFER.hours} h qui suivent ton inscription (compte à rebours dans ton espace).</p>
      </div>
      <IntervalToggle value={interval} onChange={setPeriod} />
      <div className="mx-auto mt-10 max-w-[640px]">
        <PlanPicker
          interval={interval}
          offer
          withSingle
          cta={(choice, iv) => (
            <Link href={choice === "single" ? "/quiz" : `/inscription?plan=${choice}&interval=${iv}`} className={pickerButtonClass}>
              Continuer <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
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
