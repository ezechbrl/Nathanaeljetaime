import { BuyerReviews } from "@/components/site/BuyerReviews";
import { Compare } from "@/components/site/Compare";
import { FaqSection } from "@/components/site/Faq";
import { FinalCta } from "@/components/site/FinalCta";
import { Hero } from "@/components/site/Hero";
import { Instant } from "@/components/site/Instant";
import { PriceTeaser } from "@/components/site/PriceTeaser";
import { Reviews } from "@/components/site/Reviews";
import { ShowcaseGrid } from "@/components/site/ShowcaseGrid";
import { HOME_FAQ } from "@/lib/content/faq";

// Les avis approuvés sont relus toutes les 10 minutes.
export const revalidate = 600;

export default function HomePage() {
  return (
    <>
      <Hero />
      <ShowcaseGrid />
      <Instant />
      <BuyerReviews />
      <Compare />
      <PriceTeaser />
      <Reviews />
      <div className="hidden sm:block"><FinalCta /></div>
      <FaqSection
        title={<>Les questions qu'on nous <span className="serif-accent">pose vraiment</span></>}
        subtitle="Prix, Shopify, résultat : on répond franchement."
        items={HOME_FAQ.slice(0, 5)}
        mobileCount={3}
      />
    </>
  );
}
