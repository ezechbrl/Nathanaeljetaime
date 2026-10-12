import { Audience } from "@/components/site/Audience";
import { FaqSection } from "@/components/site/Faq";
import { FinalCta } from "@/components/site/FinalCta";
import { Hero } from "@/components/site/Hero";
import { Revolution } from "@/components/site/Revolution";
import { ShowcaseGrid } from "@/components/site/ShowcaseGrid";
import { Stats } from "@/components/site/Stats";
import { Steps } from "@/components/site/Steps";
import { HOME_FAQ } from "@/lib/content/faq";
import { site } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <ShowcaseGrid />
      <Revolution />
      <Steps />
      <Audience />
      <FaqSection
        title={<>Le créateur de boutique Shopify IA, <span className="serif-accent">en questions</span></>}
        subtitle={`Ce que fait ${site.name}, ce qui est gratuit, et ce que tu gardes.`}
        items={HOME_FAQ}
      />
      <FinalCta />
    </>
  );
}
