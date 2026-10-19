import type { Metadata } from "next";
import { Container } from "@/components/ui/Section";
import { FaqSection } from "@/components/site/Faq";
import { FinalCta } from "@/components/site/FinalCta";
import { PageHero } from "@/components/site/PageHero";
import { PricingCards } from "@/components/site/Pricing";

export const metadata: Metadata = { title: "Tarifs", description: "Vitrio Starter à 39 € par mois et Pro à 79 € par mois avec l'offre de lancement (−50 % à vie), ou 199 € et 399 € par an. Sans engagement." };

const PRICING_FAQ = [
  { q: "Comment je paie ?", a: "Par carte bancaire, Apple Pay ou Google Pay, sur une page de paiement sécurisée par Stripe. Tu reçois une facture à chaque paiement." },
  { q: "Y a-t-il une version gratuite ?", a: "Non. Pour garder un outil rapide et de qualité, Vitrio fonctionne uniquement par abonnement. Il est sans engagement : tu peux arrêter en un clic." },
  { q: "Starter ou Pro ?", a: "Starter suffit pour lancer une marque : 1 boutique Shopify, avec un produit que tu peux changer quand tu veux. Pro sert à tester plusieurs produits en même temps (3 boutiques) avec 2× plus de crédit IA. Tu peux changer d'offre à tout moment." },
  { q: "Puis-je arrêter à tout moment ?", a: "Oui. Si tu arrêtes, ta boutique et tout son contenu restent sur ton compte Shopify." },
  { q: "Que se passe-t-il si j'utilise beaucoup l'IA ?", a: "L'IA fonctionne avec un crédit qui se recharge toutes les 5 heures, et une limite par semaine. Tu vois ton crédit restant en permanence dans ton espace, et on te prévient avant la limite. Si tu l'atteins, l'IA se met en pause quelques heures (24 h pour la limite de la semaine), puis repart. Un usage normal ne l'atteint pas. Tu as un besoin plus important (agence, nombreuses boutiques) ? Écris-nous." },
  { q: "L'abonnement Shopify est-il inclus ?", a: "Non. Shopify facture son propre abonnement pour héberger ta boutique. Notre offre couvre la création, l'édition et l'optimisation par l'IA." },
  { q: "Proposez-vous un remboursement ?", a: "Oui : si tu n'es pas satisfait dans les 14 jours suivant ton premier paiement, on te rembourse intégralement." },
];

export default function PricingPage() {
  return (
    <>
      <PageHero eyebrow="Tarifs" title={<>Un prix <span className="serif-accent">clair</span>, sans engagement</>} subtitle="Deux offres, sans engagement. Encore moins cher en payant à l'année." />
      <Container><PricingCards /></Container>
      <FaqSection title="Questions sur les tarifs" items={PRICING_FAQ} />
      <FinalCta />
    </>
  );
}
