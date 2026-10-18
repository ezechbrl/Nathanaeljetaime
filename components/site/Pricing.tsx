"use client";

import { Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { CTA } from "@/lib/launch";
import { AI_FAIR_USE, PLANS, euro } from "@/lib/content/pricing";

// Les deux formules du même abonnement Pro, côte à côte : mensuel et annuel (2 mois offerts).
export function PricingCards() {
  const pro = PLANS.find((p) => p.id === "pro")!;
  const offers = [
    { interval: "month", label: "Mensuel", price: euro(pro.monthly), unit: "/ mois", note: "Sans engagement, annulable en un clic", badge: "" },
    { interval: "year", label: "Annuel", price: euro(pro.yearly), unit: "/ an", note: `Soit ${euro(Math.round(pro.yearly / 12))} par mois : 2 mois offerts`, badge: `−${euro(pro.monthly * 12 - pro.yearly)}` },
  ] as const;
  return (
    <div className="mx-auto max-w-[880px]">
      <div className="grid gap-5 sm:grid-cols-2">
        {offers.map((o, i) => {
          const best = o.interval === "year";
          return (
            <Reveal key={o.interval} delay={i * 90} className={cn("relative flex flex-col rounded-card p-7", best ? "surface-accent shadow-[0_30px_80px_-40px_rgb(0_166_118/0.5)]" : "surface")}>
              {best && <span className="absolute right-5 top-5 rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold text-[#04110d]">Meilleure offre · {o.badge}</span>}
              <p className="text-sm font-medium text-fg-muted">Pro · {o.label}</p>
              <p className="mt-4 flex items-baseline gap-1.5">
                <span className="text-5xl tracking-[-0.04em] tabular-nums">{o.price}</span>
                <span className="text-sm text-fg-muted">{o.unit}</span>
              </p>
              <p className={cn("mt-1 text-sm", best ? "text-accent" : "text-fg-faint")}>{o.note}</p>
              <ButtonLink href={`/inscription?plan=pro&interval=${o.interval}`} variant={best ? "primary" : "secondary"} className="mt-7">
                {CTA.short}
              </ButtonLink>
            </Reveal>
          );
        })}
      </div>
      <Reveal delay={180} className="surface mt-5 rounded-card p-6">
        <p className="text-sm font-medium">Tout est inclus dans les deux formules :</p>
        <ul className="mt-4 grid gap-3 text-[15px] sm:grid-cols-2">
          {pro.features.map((f) => <li key={f} className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{f}</li>)}
        </ul>
      </Reveal>
    </div>
  );
}

const ROWS: { label: string; values: (string | boolean)[] }[] = [
  { label: "Boutiques", values: PLANS.map((p) => p.limits.stores) },
  { label: "Messages à l'IA", values: PLANS.map((p) => p.limits.conversations) },
  { label: "Images générées", values: PLANS.map((p) => p.limits.images) },
  { label: "Boutiques Shopify connectées", values: PLANS.map((p) => p.limits.shops) },
  { label: "Capacité d'IA (crédit rechargé toutes les 5 h)", values: PLANS.map((p) => p.limits.ai) },
  { label: "Stratégie et identité de marque", values: [true, true] },
  { label: "Import depuis un lien", values: [false, true] },
  { label: "Refonte de boutique existante", values: [false, true] },
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
