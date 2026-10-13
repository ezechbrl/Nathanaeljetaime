"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { AI_FAIR_USE, PLANS, euro } from "@/lib/content/pricing";

export function PricingCards() {
  const [yearly, setYearly] = useState(true);
  return (
    <>
      <div className="flex justify-center">
        <div role="radiogroup" aria-label="Période de facturation" className="surface flex rounded-full p-1 text-sm">
          {[{ v: false, l: "Mensuel" }, { v: true, l: "Annuel · 2 mois offerts" }].map((o) => (
            <button key={o.l} role="radio" aria-checked={yearly === o.v} onClick={() => setYearly(o.v)} className={cn("rounded-full px-4 py-1.5 transition-colors", yearly === o.v ? "bg-white/[0.09] text-fg" : "text-fg-muted hover:text-fg")}>
              {o.l}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {PLANS.map((p, i) => {
          const price = yearly ? Math.round(p.yearly / 12) : p.monthly;
          return (
            <Reveal key={p.id} delay={i * 90} className={cn("relative flex flex-col rounded-card p-7", p.featured ? "surface-accent shadow-[0_30px_80px_-40px_rgb(0_166_118/0.5)]" : "surface")}>
              {p.featured && <span className="absolute right-5 top-5 rounded-full border border-accent/40 px-2.5 py-0.5 text-[11px] text-accent">Le plus choisi</span>}
              <h3 className="text-xl tracking-tight">{p.name}</h3>
              <p className="mt-1 text-sm text-fg-muted">{p.tagline}</p>
              <p className="mt-8 flex items-baseline gap-1.5">
                <span className="text-5xl tracking-[-0.04em] tabular-nums">{euro(price)}</span>
                {p.monthly > 0 && <span className="text-sm text-fg-muted">/ mois</span>}
              </p>
              <p className="mt-1 h-5 text-xs text-fg-faint">{p.monthly > 0 && yearly ? `Facturé ${euro(p.yearly)} par an` : p.monthly > 0 ? "Sans engagement" : "Sans carte bancaire"}</p>
              <ButtonLink href={p.id === "free" ? "/inscription" : `/inscription?plan=${p.id}&interval=${yearly ? "year" : "month"}`} variant={p.featured ? "primary" : "secondary"} className="mt-7">
                {p.cta}
              </ButtonLink>
              <ul className="mt-8 space-y-3 border-t border-white/[0.07] pt-6 text-[15px]">
                {p.features.map((f) => <li key={f} className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{f}</li>)}
              </ul>
            </Reveal>
          );
        })}
      </div>
    </>
  );
}

const ROWS: { label: string; values: (string | boolean)[] }[] = [
  { label: "Boutiques", values: PLANS.map((p) => p.limits.stores) },
  { label: "Messages à l'IA", values: PLANS.map((p) => p.limits.conversations) },
  { label: "Images générées", values: PLANS.map((p) => p.limits.images) },
  { label: "Boutiques Shopify connectées", values: PLANS.map((p) => p.limits.shops) },
  { label: "Capacité d'IA (crédit rechargé toutes les 5 h)", values: PLANS.map((p) => p.limits.ai) },
  { label: "Stratégie et identité de marque", values: [true, true, true] },
  { label: "Import depuis un lien", values: [false, true, true] },
  { label: "Refonte de boutique existante", values: [false, true, true] },
  { label: "Optimisation quotidienne", values: [false, true, true] },
  { label: "Multi-utilisateurs", values: [false, false, true] },
  { label: "Support", values: ["E-mail", "Prioritaire", "Dédié"] },
];

export function PricingTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-[15px]">
        <thead>
          <tr className="border-b border-white/[0.08]">
            <th className="py-4 font-normal text-fg-muted">Comparer les offres</th>
            {PLANS.map((p) => <th key={p.id} className="py-4 text-center font-normal">{p.name}</th>)}
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
