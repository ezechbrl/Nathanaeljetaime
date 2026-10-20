import { ArrowRight, Check, Timer } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { CTA } from "@/lib/launch";
import { LAUNCH_OFFER, PAID_PLANS, euro, withOffer } from "@/lib/content/pricing";

// Aperçu des prix sur l'accueil : court, avec l'offre de lancement, et un lien vers la page Tarifs complète.
export function PriceTeaser() {
  const [starter, pro] = PAID_PLANS;
  return (
    <section id="tarifs" className="py-16 sm:py-20">
      <div className="mx-auto max-w-[880px] px-4 sm:px-6">
        <Reveal className="relative overflow-hidden rounded-[26px] bg-[linear-gradient(160deg,#2ee6a6,rgb(255_255_255/0.08)_45%,rgb(163_230_53/0.45))] p-px shadow-[0_0_70px_-25px_rgb(46_230_166/0.6)]">
          <div className="rounded-[25px] bg-[linear-gradient(180deg,rgb(8_40_31/0.95),rgb(4_20_15/0.97))] px-5 py-8 text-center sm:px-10 sm:py-10">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d9f99d]/40 bg-[#a3e635]/10 px-3 py-1 text-[12.5px] font-bold uppercase tracking-[0.06em] text-[#d9f99d]"><Timer className="h-3.5 w-3.5" /> Offre de lancement · −{LAUNCH_OFFER.percent} % à vie</span>
            <p className="mt-5 text-[15px] text-fg-muted">Ta boutique Shopify complète, dès</p>
            <p className="mt-1 flex items-baseline justify-center gap-2">
              <span className="text-2xl font-semibold text-fg-faint line-through decoration-[#ef4444] decoration-[3px]">{euro(starter.monthly)}</span>
              <span className="text-[clamp(3.2rem,2.4rem+3vw,4.5rem)] font-semibold leading-none tracking-[-0.04em]">{euro(withOffer(starter.monthly))}</span>
              <span className="text-fg-muted">/ mois</span>
            </p>
            <p className="mt-2 text-[14px] text-[#6ee7b7]">ou {euro(withOffer(starter.yearly))} par an · Pro dès {euro(withOffer(pro.monthly))} par mois</p>
            <ul className="mx-auto mt-6 grid max-w-md gap-2 text-left text-[14.5px] sm:grid-cols-2">
              {["Sans engagement", "Annulable en un clic", "Prix bloqué à vie", `Valable ${LAUNCH_OFFER.hours} h après l'inscription`].map((t) => (
                <li key={t} className="flex items-center gap-2"><Check className="h-4 w-4 shrink-0 text-[#2ee6a6]" /> {t}</li>
              ))}
            </ul>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/inscription?mode=start" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,#34f0b0,#0fae7c)] px-7 text-[15px] font-semibold text-[#03140d] shadow-[0_0_24px_rgb(46_230_166/0.45)] sm:w-auto">{CTA.main} <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/tarifs" className="inline-flex h-12 w-full items-center justify-center rounded-full border border-white/15 px-7 text-[15px] font-medium text-fg/90 hover:border-white/30 sm:w-auto">Voir les tarifs</Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
