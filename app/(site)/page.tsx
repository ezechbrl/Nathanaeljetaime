import { PhoneNotifications } from "@/components/site/PhoneNotifications";
import { BuyerReviews } from "@/components/site/BuyerReviews";
import { BeforeAfterSlider } from "@/components/site/BeforeAfterSlider";
import { FaqSection } from "@/components/site/Faq";
import { FinalCta } from "@/components/site/FinalCta";
import { Hero } from "@/components/site/Hero";
import { ShowcaseGrid } from "@/components/site/ShowcaseGrid";
import { Reviews } from "@/components/site/Reviews";
import { StickyCta } from "@/components/site/StickyCta";
import type { Metadata } from "next";
import { HOME_FAQ } from "@/lib/content/faq";

export const metadata: Metadata = {
  title: { absolute: "Créer une boutique Shopify avec l'IA en 3 minutes · Vigenia" },
  alternates: { canonical: "/" },
};

// Les avis approuvés sont relus toutes les 10 minutes.
export const revalidate = 600;

export default function HomePage() {
  return (
    <>
      <Hero />
      <BeforeAfterSlider />
      <ShowcaseGrid />
      <PhoneNotifications />
      <BuyerReviews />
      <Reviews />
      <div className="hidden sm:block"><FinalCta /></div>
      <FaqSection
        title={<>Les questions qu'on nous <span className="serif-white">pose vraiment</span></>}
        subtitle="Prix, Shopify, résultat : on répond franchement."
        items={HOME_FAQ.slice(0, 5)}
        mobileCount={3}
      />
      <StickyCta />
    </>
  );
}
