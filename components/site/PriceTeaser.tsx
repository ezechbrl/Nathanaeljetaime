"use client";

import { ArrowRight, Check, Sparkles, Timer } from "lucide-react";
import Link from "next/link";
import { planButtonClass } from "@/components/pricing/PlanCards";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { CTA, isWaitlist } from "@/lib/launch";
import { LAUNCH_OFFER, PAID_PLANS, WAITLIST_PRICES, euro, withOffer } from "@/lib/content/pricing";

// Avant l'ouverture : le prix réservé aux inscrits de la liste d'attente ; ensuite, l'offre de lancement.
const price = (id: string, k: "monthly" | "yearly", base: number) => (isWaitlist && (id === "pro" || id === "agency") ? WAITLIST_PRICES[id][k] : withOffer(base));

// Les prix sur l'accueil : un bandeau court pour l'offre, puis les deux offres en version compacte
// (sur téléphone, seulement le Starter, avec un lien vers le Pro).
const KEY_FEATURES: Record<string, string[]> = {
  pro: ["Ta boutique complète en 3 minutes", "Photos pro et textes créés par l'IA", "Vrais avis clients importés et traduits"],
  agency: ["3 boutiques Shopify connectées", "2× plus de crédit IA", "3× plus de photos par mois"],
};

export function PriceTeaser() {
  return (
    <section id="tarifs" className="py-16 sm:py-20">
      <div className="mx-auto max-w-[860px] px-4 sm:px-6">
        <Reveal as="h2" className="text-center text-h2">Un prix <span className="serif-white">simple</span></Reveal>
        <Reveal delay={60} className="mx-auto mt-6 flex max-w-[640px] items-center justify-between gap-3 rounded-[16px] border border-white/15 bg-white/[0.03] px-4 py-3 sm:px-5">
          {isWaitlist ? (
            <>
              <p className="text-[14px] font-extrabold uppercase tracking-[0.05em] sm:text-[15px]">Prix réservé à vie<span className="hidden font-semibold text-white/70 sm:inline"> · liste d&apos;attente</span></p>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-black/30 px-3 py-1 text-[12.5px] font-semibold text-[#d9f99d]"><Timer className="h-3.5 w-3.5" /> Avant l&apos;ouverture</span>
            </>
          ) : (
            <>
              <p className="text-[14px] font-extrabold uppercase tracking-[0.05em] sm:text-[15px]">−{LAUNCH_OFFER.percent} % à vie<span className="hidden font-semibold text-white/70 sm:inline"> · offre de lancement</span></p>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-black/30 px-3 py-1 text-[12.5px] font-semibold text-[#d9f99d]"><Timer className="h-3.5 w-3.5" /> {LAUNCH_OFFER.hours} h</span>
            </>
          )}
        </Reveal>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {PAID_PLANS.map((plan, i) => (
            <Reveal key={plan.id} delay={100 + i * 80} className={cn(i > 0 && "hidden sm:block")}>
              <div className={cn("h-full rounded-[22px] p-px", plan.featured ? "bg-white/[0.03]" : "bg-white/[0.03]")}>
                <div className="flex h-full flex-col rounded-[21px] bg-white/[0.03] p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-[1.4rem] font-semibold tracking-[-0.02em]">{plan.name}</p>
                    <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11.5px] font-semibold", plan.featured ? "border-white/15 bg-white/[0.06] text-white/80" : "border-white/15 bg-white/[0.06] text-white/80")}>{plan.featured && <Sparkles className="h-3 w-3" />} {plan.badge}</span>
                  </div>
                  <p className="mt-2 text-[13.5px] leading-snug text-fg-muted">{plan.tagline}</p>
                  <p className="mt-3 flex items-baseline gap-1.5">
                    <span className="text-lg font-semibold text-fg-faint line-through decoration-[#ef4444] decoration-[3px]">{euro(isWaitlist ? withOffer(plan.monthly) : plan.monthly)}</span>
                    <span className="text-[2.6rem] font-semibold leading-none tracking-[-0.04em]">{euro(price(plan.id, "monthly", plan.monthly))}</span>
                    <span className="text-sm text-fg-muted">/ mois</span>
                  </p>
                  <p className="mt-1.5 text-[13.5px] font-medium text-[#3dff9a]">ou {euro(price(plan.id, "yearly", plan.yearly))} par an</p>
                  <ul className="mt-5 flex-1 space-y-2 text-[14.5px]">
                    {KEY_FEATURES[plan.id].map((f) => (
                      <li key={f} className="flex gap-2.5"><span className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-white/[0.06]"><Check className="h-3 w-3 text-[#3dff9a]" strokeWidth={3} /></span>{f}</li>
                    ))}
                  </ul>
                  <Link href={`/inscription?plan=${plan.id}`} className={cn(planButtonClass(plan.featured || i === 0), "mt-6")}>{CTA.main} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        {isWaitlist && <p className="mt-5 text-center text-[13.5px] text-fg-muted">Réservé aux inscrits de la liste d&apos;attente, à prendre dans les {LAUNCH_OFFER.hours} h après la création de ton compte à l&apos;ouverture. Ensuite : {euro(withOffer(PAID_PLANS[0].monthly))}/mois avec l&apos;offre de lancement.</p>}
        <p className="mt-3 text-center text-[13.5px] text-fg-muted">Sans engagement · Annulable en 1 clic · <Link href="/tarifs" className="text-[#3dff9a] underline underline-offset-4">Voir le détail des offres{" "}<span className="sm:hidden">et le Pro</span></Link></p>
      </div>
    </section>
  );
}
