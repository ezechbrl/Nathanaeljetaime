import { Compare } from "@/components/site/Compare";
import { FaqSection } from "@/components/site/Faq";
import { FinalCta } from "@/components/site/FinalCta";
import { Hero } from "@/components/site/Hero";
import { Playground } from "@/components/site/Playground";
import { ShowcaseGrid } from "@/components/site/ShowcaseGrid";
import { Steps } from "@/components/site/Steps";
import { Reveal } from "@/components/ui/Reveal";
import { TutorialVideo } from "@/components/ui/TutorialVideo";
import { HOME_FAQ } from "@/lib/content/faq";

export default function HomePage() {
  return (
    <>
      <Hero />
      <section aria-label="Démonstration" className="px-4 pb-20 sm:px-6">
        <Reveal className="mx-auto max-w-[860px] text-center">
          <p className="text-sm font-medium text-accent">Regarde plutôt</p>
          <h2 className="mt-2 text-h2">Du lien AliExpress à la boutique <span className="serif-accent">en ligne</span></h2>
        </Reveal>
        <Reveal delay={120}><TutorialVideo name="tuto-boutique" title="vitrio.app · Coller un lien, générer, publier" speed="×3" className="mt-8" /></Reveal>
      </section>
      <Playground />
      <Steps />
      <Compare />
      <ShowcaseGrid />
      <FaqSection
        title={<>Les questions qu'on nous <span className="serif-accent">pose vraiment</span></>}
        subtitle="Prix, Shopify, résultat : on répond franchement."
        items={HOME_FAQ.slice(0, 5)}
      />
      <FinalCta />
    </>
  );
}
