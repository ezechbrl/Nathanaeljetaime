import type { Metadata } from "next";
import { Container } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { FaqSection } from "@/components/site/Faq";
import { FinalCta } from "@/components/site/FinalCta";
import { PageHero } from "@/components/site/PageHero";
import { PricingCards, PricingTable } from "@/components/site/Pricing";

export const metadata: Metadata = { title: "Tarifs", description: "Commence gratuitement. Passe à Pro quand ta boutique décolle. Sans engagement." };

const PRICING_FAQ = [
  { q: "Faut-il une carte bancaire pour commencer ?", a: "Non. L'offre Découverte est gratuite et sans carte. Tu ajoutes un moyen de paiement seulement si tu passes à Pro ou Agence." },
  { q: "Puis-je changer d'offre ou arrêter à tout moment ?", a: "Oui. Le changement est immédiat et calculé au prorata. Si tu arrêtes, ta boutique et tout son contenu restent sur ton compte Shopify." },
  { q: "Que se passe-t-il si j'atteins mes limites ?", a: "L'IA te prévient avant. Tu peux attendre le renouvellement du mois suivant ou passer à l'offre supérieure." },
  { q: "L'abonnement Shopify est-il inclus ?", a: "Non. Shopify facture son propre abonnement pour héberger ta boutique. Notre offre couvre la création, l'édition et l'optimisation par l'IA." },
  { q: "Proposez-vous un remboursement ?", a: "Oui : si tu n'es pas satisfait dans les 14 jours suivant ton premier paiement, on te rembourse intégralement." },
];

export default function PricingPage() {
  return (
    <>
      <PageHero eyebrow="Tarifs" title={<>Simple, <span className="serif-accent">sans engagement</span></>} subtitle="Commence gratuitement. Passe à Pro quand ta boutique décolle." />
      <Container><PricingCards /></Container>
      <Container className="py-24">
        <Reveal><PricingTable /></Reveal>
      </Container>
      <FaqSection title="Questions sur les tarifs" items={PRICING_FAQ} />
      <FinalCta />
    </>
  );
}
