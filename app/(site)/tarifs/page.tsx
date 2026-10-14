import type { Metadata } from "next";
import { Container } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { FaqSection } from "@/components/site/Faq";
import { FinalCta } from "@/components/site/FinalCta";
import { PageHero } from "@/components/site/PageHero";
import { PricingCards, PricingTable } from "@/components/site/Pricing";

export const metadata: Metadata = { title: "Tarifs", description: "Commence gratuitement. Passe à Pro quand ta boutique décolle. Sans engagement." };

const PRICING_FAQ = [
  { q: "Faut-il une carte bancaire pour commencer ?", a: "Non. L'offre Découverte est gratuite et sans carte. Si tu passes à Pro ou Agence, l'abonnement s'ajoute simplement à ta facture Shopify : pas de carte à saisir chez nous." },
  { q: "Puis-je changer d'offre ou arrêter à tout moment ?", a: "Oui. Le changement est immédiat et calculé au prorata. Si tu arrêtes, ta boutique et tout son contenu restent sur ton compte Shopify." },
  { q: "Que se passe-t-il si j'utilise beaucoup l'IA ?", a: "L'IA fonctionne avec un crédit qui se recharge toutes les 5 heures, et une limite par semaine. Tu vois ton crédit restant en permanence dans ton espace, et on te prévient avant la limite. Si tu l'atteins, l'IA se met en pause quelques heures (24 h pour la limite de la semaine), puis repart. Un usage normal ne l'atteint pas ; si tu as besoin de plus, l'offre Agence offre 4 fois plus d'IA." },
  { q: "L'abonnement Shopify est-il inclus ?", a: "Non. Shopify facture son propre abonnement pour héberger ta boutique. Notre offre couvre la création, l'édition et l'optimisation par l'IA." },
  { q: "Proposez-vous un remboursement ?", a: "Oui : si tu n'es pas satisfait dans les 14 jours suivant ton premier paiement, on te rembourse intégralement." },
];

export default function PricingPage() {
  return (
    <>
      <PageHero eyebrow="Tarifs" title={<>Un prix <span className="serif-accent">clair</span>, sans engagement</>} subtitle="Ta première boutique est offerte. Ensuite, l'abonnement s'ajoute à ta facture Shopify et s'arrête en un clic." />
      <Container><PricingCards /></Container>
      <Container className="py-24">
        <Reveal><PricingTable /></Reveal>
      </Container>
      <FaqSection title="Questions sur les tarifs" items={PRICING_FAQ} />
      <FinalCta />
    </>
  );
}
