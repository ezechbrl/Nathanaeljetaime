"use client";

import { Check, ChevronDown, Sparkles, Timer } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { PAID_PLANS, SINGLE, SINGLE_FEATURES, euro, type Plan } from "@/lib/content/pricing";
import { planPrice, type Interval, type Left } from "./PlanCards";

export type Choice = "pro" | "agency" | "single";

// Résumé d'une ligne par offre (le détail complet s'ouvre sous la liste).
const SUMMARY: Record<Choice, string> = {
  pro: "Ta boutique + photos, textes, vrais avis et offres par lot, tout modifiable avec l'IA",
  agency: "Tout le Starter + 3 boutiques Shopify, 3× plus de photos, 2× plus d'IA, support prioritaire",
  single: "Ta boutique complète, à toi pour toujours, + 7 jours de retouches avec l'IA",
};

const perDay = (amount: number, interval: Interval) => (amount / (interval === "year" ? 365 : 30)).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Choix de l'offre, version minimaliste : une liste à cocher, le prix par jour à droite,
// et une barre en bas (collée à l'écran sur téléphone) avec le prix choisi et « Continuer ».
export function PlanPicker({ interval, left, offer = false, waitlist = false, withSingle = false, cta }: {
  interval: Interval; left?: Left | null; offer?: boolean; waitlist?: boolean; withSingle?: boolean;
  cta: (choice: Choice, interval: Interval) => ReactNode;
}) {
  const [choice, setChoice] = useState<Choice>("pro");
  const [details, setDetails] = useState(false);
  const singlePrice = left ? SINGLE.offer : SINGLE.price;
  const rows: { id: Choice; name: string; badge?: { text: string; tone: "green" | "yellow" }; price: ReactNode; right: ReactNode }[] = PAID_PLANS.map((plan: Plan) => {
    const { billed, was } = planPrice(plan, interval, offer || !!left, waitlist);
    return {
      id: plan.id as Choice,
      name: plan.name,
      badge: plan.featured ? { text: "Le plus avantageux", tone: "green" as const } : undefined,
      price: <><span className="font-semibold text-white">{euro(billed)}</span> {interval === "year" ? "/ an" : "/ mois"}{was !== null && <span className="ml-1.5 text-fg-faint line-through decoration-[#ef4444] decoration-2">{euro(was)}</span>}</>,
      right: <><span className="block text-[1.55rem] font-semibold leading-none tracking-[-0.03em] tabular-nums text-white">{perDay(billed, interval)} €</span><span className="mt-1 block text-[13px] text-fg-muted">/ jour</span></>,
    };
  });
  if (withSingle) rows.push({
    id: "single",
    name: "Ma boutique",
    badge: { text: "Recommandé", tone: "yellow" },
    price: <><span className="font-semibold text-white">{euro(singlePrice)}</span> une fois{left && <span className="ml-1.5 text-fg-faint line-through decoration-[#ef4444] decoration-2">{euro(SINGLE.price)}</span>}</>,
    right: <><span className="block text-[1.35rem] font-semibold leading-none tracking-[-0.03em] text-white">Une fois</span><span className="mt-1 block text-[13px] text-fg-muted">à vie</span></>,
  });

  const current = rows.find((r) => r.id === choice) ?? rows[0];
  const plan = PAID_PLANS.find((p) => p.id === current.id);
  const features = plan ? plan.features.map((f) => (typeof f === "string" ? f : f.text)) : SINGLE_FEATURES;

  return (
    <div>
      <div role="radiogroup" aria-label="Choisis ton offre" className="space-y-4">
        {rows.map((r) => {
          const on = r.id === current.id;
          return (
            <button key={r.id} type="button" role="radio" aria-checked={on} onClick={() => setChoice(r.id)}
              className={cn("relative block w-full rounded-[22px] border p-5 text-left transition-all sm:p-6",
                on ? "border-[#2ee6a6]/70 bg-[#2ee6a6]/[0.07] shadow-[0_0_40px_-12px_rgb(46_230_166/0.6)]" : "border-white/10 bg-black/25 hover:border-white/20")}>
              {r.badge && (
                <span className={cn("absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-[11.5px] font-bold uppercase tracking-[0.08em]",
                  r.badge.tone === "green" ? "bg-[linear-gradient(180deg,#34f0b0,#10b07f)] text-[#03140d]" : "border border-[#fde047]/40 bg-[#1f1d0c] text-[#fef08a]")}>
                  {r.badge.tone === "green" && <Sparkles className="h-3.5 w-3.5" />}{r.badge.text}
                </span>
              )}
              <span className="flex items-center gap-4">
              <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition-colors", on ? "border-[#2ee6a6] bg-[#2ee6a6]" : "border-white/30")}>
                {on && <Check className="h-4 w-4 text-[#03140d]" strokeWidth={3.5} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[1.25rem] font-semibold tracking-[-0.02em] text-white">{r.name}</span>
                <span className="mt-1 block text-[15px] text-fg-muted">{r.price}</span>
              </span>
              <span className="shrink-0 text-right">{r.right}</span>
              </span>
              <span className="mt-3 block rounded-[12px] border border-white/10 px-3 py-2 text-[13.5px] leading-snug text-fg-muted sm:ml-11">{SUMMARY[r.id]}</span>
            </button>
          );
        })}
      </div>

      {/* Le détail de l'offre choisie, replié pour garder la page simple. */}
      <button type="button" onClick={() => setDetails((d) => !d)} aria-expanded={details} className="mx-auto mt-5 flex items-center gap-1.5 text-[13.5px] font-medium text-[#6ee7b7] hover:text-[#a7f3d0]">
        Tout ce qui est inclus dans {current.name} <ChevronDown className={cn("h-4 w-4 transition-transform", details && "rotate-180")} />
      </button>
      {details && (
        <ul className="mx-auto mt-3 max-w-[560px] space-y-2 text-[14px] [animation:fade-in_.2s_ease-out]">
          {features.map((f) => <li key={f} className="flex gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#2ee6a6]" strokeWidth={3} />{f}</li>)}
        </ul>
      )}

      {/* Barre du bas : collée en bas de l'écran pendant qu'on choisit. */}
      <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t border-white/10 bg-[#04100c]/90 px-4 py-3 backdrop-blur-xl sm:mx-0 sm:rounded-[18px] sm:border">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="whitespace-nowrap text-[1.2rem] font-semibold text-white">{current.price}</p>
            {left && current.id === "single" && <p className="flex items-center gap-1 text-[12px] font-semibold tabular-nums text-[#fef08a]"><Timer className="h-3.5 w-3.5" /> Ce prix encore {left.h}:{left.m}:{left.s}</p>}
          </div>
          <div className="w-[190px] shrink-0 sm:w-[240px]">{cta(current.id, interval)}</div>
        </div>
      </div>
    </div>
  );
}

// Bouton « Continuer » de la barre du bas.
export const pickerButtonClass = "group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,#34f0b0,#0fae7c)] text-[15px] font-semibold text-[#03140d] shadow-[inset_0_1px_0_rgb(255_255_255/0.4),0_10px_30px_-8px_rgb(46_230_166/0.7)] transition-all hover:-translate-y-px disabled:opacity-60";
