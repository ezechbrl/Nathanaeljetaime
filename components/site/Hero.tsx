import { Check } from "lucide-react";
import { CTA } from "@/lib/launch";
import { Reveal } from "@/components/ui/Reveal";
import { TutorialVideo } from "@/components/ui/TutorialVideo";
import { PromptBox } from "./PromptBox";

export function Hero() {
  return (
    <section className="relative pb-16 pt-28 sm:pt-36">
      <div className="relative mx-auto max-w-[1100px] px-4 text-center sm:px-6">
        <Reveal>
          <span className="eyebrow mx-auto">
            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgb(94_211_140)]" />
            {CTA.eyebrow}
          </span>
        </Reveal>
        <Reveal delay={80} as="h1" className="mx-auto mt-7 max-w-4xl text-[clamp(2.6rem,1.4rem+3.8vw,4.8rem)] leading-[1.02] tracking-[-0.045em] [text-shadow:0_4px_40px_rgb(0_0_0/0.35)]">
          Ta boutique Shopify qui <span className="serif-accent pr-1">vend</span>, prête en 10 minutes avec l'IA
        </Reveal>
        <Reveal delay={180} as="p" className="mx-auto mt-5 max-w-2xl text-[16px] font-medium leading-relaxed text-fg-muted sm:mt-6 sm:text-lg">
          <span className="sm:hidden">La qualité d'une agence, pour le prix d'un resto.</span>
          <span className="hidden sm:inline">Textes, photos, vrais avis et design à ta marque : la qualité d'une agence, pour le prix d'un resto. Toi, tu valides et tu vends.</span>
        </Reveal>
        <Reveal delay={260} className="mt-9">
          <PromptBox align="center" />
        </Reveal>
        {/* Petites preuves prix / qualité, vérifiables (pas de « moins cher du marché » qu'on ne peut pas prouver) */}
        <Reveal delay={320} className="mt-6"><ul className="flex flex-wrap justify-center gap-2 text-[13px] sm:text-sm">
          {[
            { t: "Dès 39 €/mois", mobile: true },
            { t: "50× moins cher qu'une agence", mobile: true },
            { t: "Photos de pro incluses", mobile: false },
            { t: "Annulable en un clic", mobile: false },
          ].map(({ t, mobile }) => (
            <li key={t} className={`${mobile ? "flex" : "hidden sm:flex"} items-center gap-1.5 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-fg/85`}><Check className="h-3.5 w-3.5 text-accent" /> {t}</li>
          ))}</ul>
        </Reveal>
      </div>
      <div className="relative px-4 sm:px-6">
        {/* Démonstration : enregistrement réel de l'app, du lien produit à la boutique en ligne. */}
        <Reveal delay={380} className="relative mx-auto mt-10 max-w-[1320px] sm:mt-14">
          <div aria-hidden className="absolute -inset-6 rounded-[32px] bg-[radial-gradient(closest-side,rgb(46_230_166/0.35),transparent)] blur-2xl" />
          <div className="relative sm:rounded-[17px] sm:bg-[linear-gradient(160deg,#2ee6a6,rgb(255_255_255/0.08)_40%,rgb(46_230_166/0.5))] sm:p-px sm:shadow-[0_0_80px_-20px_rgb(46_230_166/0.6)]">
            <TutorialVideo name="tuto-boutique" mobile="tuto-boutique-mobile" title="vigenia.com · Du lien à la boutique en ligne, étape par étape" speed="pendant les chargements" className="max-w-none" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
