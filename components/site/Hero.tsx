import { Check } from "lucide-react";
import { CTA } from "@/lib/launch";
import { LightRays } from "@/components/ui/LightRays";
import { Reveal } from "@/components/ui/Reveal";
import { PromptBox } from "./PromptBox";
import { HeroVisual } from "./HeroVisual";

export function Hero() {
  return (
    <section className="relative pb-20 pt-28 sm:pt-36">
      <LightRays />
      <div className="relative mx-auto grid max-w-[1200px] items-center gap-16 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
        <div>
          <Reveal>
            <span className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgb(94_211_140)]" />
              {CTA.eyebrow}
            </span>
          </Reveal>
          <Reveal delay={80} as="h1" className="mt-7 max-w-2xl text-[clamp(2.6rem,1.5rem+3.3vw,4.4rem)] leading-[1.02] tracking-[-0.045em]">
            Ta boutique Shopify prête à vendre en <span className="serif-accent whitespace-nowrap pr-1">10 minutes</span>.
            <span className="mt-2 block text-fg-faint">Pas en <s className="decoration-bad/70 decoration-[3px]">3 semaines</s>.</span>
          </Reveal>
          <Reveal delay={180} as="p" className="mt-6 max-w-xl text-[17px] leading-relaxed text-fg-muted sm:text-lg">
            Étude de marché, textes, visuels, fiche produit et mise en ligne : Vitrio fait le travail d'une agence pendant que tu décris ton produit. Toi, tu valides et tu vends.
          </Reveal>
          <Reveal delay={260} className="mt-9">
            <PromptBox align="left" />
          </Reveal>
          <Reveal delay={320} className="mt-6"><ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-fg-muted">
            {["Dès 40 €/mois avec l'offre de lancement", "Annulable en un clic", "Publiée directement dans Shopify"].map((t) => (
              <li key={t} className="flex items-center gap-1.5"><Check className="h-4 w-4 text-accent" /> {t}</li>
            ))}</ul>
          </Reveal>
        </div>
        <Reveal delay={200} className="hidden py-14 lg:block"><HeroVisual /></Reveal>
      </div>
    </section>
  );
}
