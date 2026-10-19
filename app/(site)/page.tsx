import { Compare } from "@/components/site/Compare";
import { FaqSection } from "@/components/site/Faq";
import { FinalCta } from "@/components/site/FinalCta";
import { Hero } from "@/components/site/Hero";
import { Revolution } from "@/components/site/Revolution";
import { Reviews } from "@/components/site/Reviews";
import { ShowcaseGrid } from "@/components/site/ShowcaseGrid";
import { HOME_FAQ } from "@/lib/content/faq";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ShowcaseGrid />
      <Revolution />
      <Compare />
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
