import { Compare } from "@/components/site/Compare";
import { FaqSection } from "@/components/site/Faq";
import { FinalCta } from "@/components/site/FinalCta";
import { Hero } from "@/components/site/Hero";
import { Playground } from "@/components/site/Playground";
import { ShowcaseGrid } from "@/components/site/ShowcaseGrid";
import { Steps } from "@/components/site/Steps";
import { HOME_FAQ } from "@/lib/content/faq";

export default function HomePage() {
  return (
    <>
      <Hero />
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
