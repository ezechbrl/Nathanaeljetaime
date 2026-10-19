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
        <Reveal delay={180} as="p" className="mx-auto mt-6 max-w-2xl text-[17px] font-medium leading-relaxed text-fg-muted sm:text-lg">
          Textes, photos, vrais avis et design à ta marque : l'IA fait le travail d'une agence. Toi, tu valides et tu vends.
        </Reveal>
        <Reveal delay={260} className="mt-9">
          <PromptBox align="center" />
        </Reveal>
        <Reveal delay={320} className="mt-6"><ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-fg-muted">
          {["Dès 39 €/mois avec l'offre de lancement", "Annulable en un clic", "Publiée directement dans Shopify"].map((t) => (
            <li key={t} className="flex items-center gap-1.5"><Check className="h-4 w-4 text-accent" /> {t}</li>
          ))}</ul>
        </Reveal>
      </div>
      <div className="relative px-4 sm:px-6">
        {/* Démonstration : enregistrement réel de l'app, du lien produit à la boutique en ligne. */}
        <Reveal delay={380} className="relative mx-auto mt-14 max-w-[1320px]">
          <div aria-hidden className="absolute -inset-6 rounded-[32px] bg-[radial-gradient(closest-side,rgb(46_230_166/0.35),transparent)] blur-2xl" />
          <div className="relative rounded-[17px] bg-[linear-gradient(160deg,#2ee6a6,rgb(255_255_255/0.08)_40%,rgb(46_230_166/0.5))] p-px shadow-[0_0_80px_-20px_rgb(46_230_166/0.6)]">
            <TutorialVideo name="tuto-boutique" title="vitrio.app · Du lien à la boutique en ligne, étape par étape" speed="×1,8" className="max-w-none" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
