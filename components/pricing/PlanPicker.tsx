"use client";

import { Check, Sparkles, Timer } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { PAID_PLANS, SINGLE, euro, type Plan } from "@/lib/content/pricing";
import { planPrice, type Interval, type Left } from "./PlanCards";

export type Choice = "pro" | "agency" | "single";

// Ce que contient chaque offre, en clair (le Pro a plus de lignes : c'est l'offre la plus complète).
const POINTS: Record<Choice, string[]> = {
  pro: [
    "Ta boutique Shopify prête en 3 minutes, à partir d'un simple lien",
    "Photos pro, textes qui donnent envie d'acheter et vrais avis clients",
    "Offres par lot (1, 2, 3 produits) pour vendre plus",
    "Modifie tout en parlant à l'IA, quand tu veux",
    "1 boutique Shopify connectée, 100 photos et 150 messages par mois",
  ],
  agency: [
    "Tout ce qu'il y a dans le Starter",
    "3 boutiques Shopify : teste 3 produits en même temps, garde le gagnant",
    "300 photos par mois (3× plus que le Starter)",
    "400 messages à l'IA par mois et 2× plus de crédit IA",
    "Refais tes photos et tes textes dès qu'un produit change",
    "Support prioritaire : on te répond en premier",
  ],
  single: [
    "Ta boutique complète créée par l'IA, à toi pour toujours",
    "Une quinzaine de photos pro et tous les textes de vente",
    "Les vrais avis clients et les offres par lot, déjà prêts",
    "Le thème Shopify à tes couleurs, à télécharger",
    "7 jours pour tout retoucher avec l'IA",
    "Aucun abonnement, rien à résilier",
  ],
};
const TONE = { pro: "text-[#3dff9a]", agency: "text-[#7dd3fc]", single: "text-[#fde047]" } as const;

const perDay = (amount: number, interval: Interval) => (amount / (interval === "year" ? 365 : 30)).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Choix de l'offre, version minimaliste : une liste à cocher, le prix par jour à droite,
// et une barre en bas (collée à l'écran sur téléphone) avec le prix choisi et « Continuer ».
export function PlanPicker({ interval, left, offer = false, waitlist = false, withSingle = false, cta }: {
  interval: Interval; left?: Left | null; offer?: boolean; waitlist?: boolean; withSingle?: boolean;
  cta: (choice: Choice, interval: Interval) => ReactNode;
}) {
  const [choice, setChoice] = useState<Choice>("pro");
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

  return (
    <div>
      <div role="radiogroup" aria-label="Choisis ton offre" className="space-y-4">
        {rows.map((r) => {
          const on = r.id === current.id;
          return (
            <button key={r.id} type="button" role="radio" aria-checked={on} onClick={() => setChoice(r.id)}
              className={cn("relative block w-full rounded-[22px] border p-5 text-left transition-all sm:p-6",
                on ? "border-white/15 bg-white/[0.06]" : "border-white/10 bg-black/25 hover:border-white/20")}>
              {r.badge && (
                <span className={cn("absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-[11.5px] font-bold uppercase tracking-[0.08em]",
                  r.badge.tone === "green" ? "bg-[#3dff9a] glow-hover text-[#03140d]" : "border border-[#fde047]/40 bg-[#1f1d0c] text-[#fef08a]")}>
                  {r.badge.tone === "green" && <Sparkles className="h-3.5 w-3.5" />}{r.badge.text}
                </span>
              )}
              <span className="flex items-center gap-4">
              <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition-colors", on ? "border-white/15 bg-[#3dff9a]" : "border-white/30")}>
                {on && <Check className="h-4 w-4 text-[#03140d]" strokeWidth={3.5} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[1.25rem] font-semibold tracking-[-0.02em] text-white">{r.name}</span>
                <span className="mt-1 block text-[15px] text-fg-muted">{r.price}</span>
              </span>
              <span className="shrink-0 text-right">{r.right}</span>
              </span>
              <span className="mt-3.5 block space-y-1.5 rounded-[14px] border border-white/10 bg-black/20 px-3.5 py-3 sm:ml-11">
                {POINTS[r.id].map((t) => <span key={t} className="flex gap-2 text-[13.5px] leading-snug text-fg"><Check className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", TONE[r.id])} strokeWidth={3} />{t}</span>)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Barre du bas : collée en bas de l'écran pendant qu'on choisit. */}
      <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t border-white/10 bg-[#0d0d0d]/90 px-4 py-3 backdrop-blur-xl sm:mx-0 sm:rounded-[18px] sm:border">
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
export const pickerButtonClass = "group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#3dff9a] glow-hover text-[15px] font-semibold text-[#03140d] transition-all hover:-translate-y-px disabled:opacity-60";
