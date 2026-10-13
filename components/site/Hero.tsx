import { LightRays } from "@/components/ui/LightRays";
import { Reveal } from "@/components/ui/Reveal";
import { AppPreview } from "./AppPreview";
import { PromptBox } from "./PromptBox";

export function Hero() {
  return (
    <section className="relative pb-10 pt-32 sm:pt-40">
      <LightRays />
      <div className="relative mx-auto max-w-[1200px] px-4 text-center sm:px-6">
        <Reveal>
          <span className="eyebrow">
            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgb(94_211_140)]" />
            Bêta ouverte · ta première boutique est offerte
          </span>
        </Reveal>
        <Reveal delay={80} as="h1" className="mx-auto mt-7 max-w-4xl text-display">
          Crée des boutiques Shopify qui <span className="serif-accent pr-1">vendent</span>, en 5 minutes avec l'IA
        </Reveal>
        <Reveal delay={180} as="p" className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-fg-muted sm:text-lg">
          Stratégie, textes, visuels et design, inspirés de ce qui marche chez les boutiques qui vendent le plus. L'IA fait tout à ta place.
        </Reveal>
        <Reveal delay={260} className="mt-10">
          <PromptBox />
        </Reveal>
      </div>
      <div className="relative px-4 sm:px-6">
        <AppPreview />
      </div>
    </section>
  );
}
