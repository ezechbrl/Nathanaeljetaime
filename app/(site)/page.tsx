import { Compare } from "@/components/site/Compare";
import { FaqSection } from "@/components/site/Faq";
import { FinalCta } from "@/components/site/FinalCta";
import { Hero } from "@/components/site/Hero";
import { Instant } from "@/components/site/Instant";
import { PricingCards } from "@/components/site/Pricing";
import { Reveal } from "@/components/ui/Reveal";
import { Reviews } from "@/components/site/Reviews";
import { ShowcaseGrid } from "@/components/site/ShowcaseGrid";
import { HOME_FAQ } from "@/lib/content/faq";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ShowcaseGrid />
      <Instant />
      <Compare />
      {/* Les prix directement sur l'accueil : le visiteur sait tout de suite combien ça coûte */}
      <section id="tarifs" className="py-20">
        <Reveal as="h2" className="px-4 text-center text-h2">Un prix <span className="serif-accent">simple</span>, sans engagement</Reveal>
        <Reveal delay={80} as="p" className="mx-auto mt-4 max-w-xl px-4 text-center text-fg-muted">Deux offres, au mois ou à l'année. Tu arrêtes quand tu veux, ta boutique reste à toi.</Reveal>
        <div className="mt-10 px-4 sm:px-6"><PricingCards /></div>
      </section>
      <Reviews />
      <FinalCta />
      <FaqSection
        title={<>Les questions qu'on nous <span className="serif-accent">pose vraiment</span></>}
        subtitle="Prix, Shopify, résultat : on répond franchement."
        items={HOME_FAQ.slice(0, 5)}
      />
    </>
  );
}
