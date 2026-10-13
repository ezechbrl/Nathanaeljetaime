import { Audience } from "@/components/site/Audience";
import { FaqSection } from "@/components/site/Faq";
import { FinalCta } from "@/components/site/FinalCta";
import { Hero } from "@/components/site/Hero";
import { Revolution } from "@/components/site/Revolution";
import { ShowcaseGrid } from "@/components/site/ShowcaseGrid";
import { Stats } from "@/components/site/Stats";
import { Steps } from "@/components/site/Steps";
import { HOME_FAQ } from "@/lib/content/faq";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <Steps />
      <ShowcaseGrid />
      <Revolution />
      <Audience />
      <FaqSection
        title={<>Les questions qu'on nous <span className="serif-accent">pose vraiment</span></>}
        subtitle="Prix, Shopify, langues, propriété de la boutique : on répond franchement."
        items={HOME_FAQ}
      />
      <FinalCta />
    </>
  );
}
