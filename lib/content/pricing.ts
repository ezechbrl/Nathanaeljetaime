import type { PlanId } from "@/lib/api/types";

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  monthly: number; // en euros
  yearly: number;  // prix annuel total
  features: string[];
  limits: { stores: string; conversations: string; images: string; shops: string; ai: string };
  cta: string;
  featured?: boolean;
  hidden?: boolean;
};

// Réduction de l'annuel affichée sur le bouton (par rapport à 12 mois payés au mois, offre Starter).
export const yearlyDiscount = (p: { monthly: number; yearly: number }) => Math.round((1 - p.yearly / (p.monthly * 12)) * 100);

// Identifiants internes gardés tels quels (contrainte de la base) : « pro » = offre Starter, « agency » = offre Pro.
export const PLANS: Plan[] = [
  {
    // Compte sans abonnement (pas affiché sur la page Tarifs : il n'y a pas d'offre gratuite).
    id: "free", name: "Sans abonnement", tagline: "", monthly: 0, yearly: 0, hidden: true,
    features: [], limits: { stores: "0", conversations: "0", images: "0", shops: "1", ai: "Aucune" }, cta: "",
  },
  {
    id: "pro", name: "Starter", tagline: "Pour lancer ta marque.", monthly: 78, yearly: 398,
    features: ["1 boutique Shopify connectée", "Change de produit à volonté", "Photos produit et mises en situation par l'IA", "Vrais avis clients importés", "Modifications par l'IA", "Thème Shopify à ta marque"],
    limits: { stores: "Illimitées", conversations: "150 / mois", images: "100 / mois", shops: "1", ai: "1 € toutes les 5 h, 3 € / semaine" },
    cta: "Commencer",
  },
  {
    id: "agency", name: "Pro", tagline: "Pour tester plusieurs produits et grandir.", monthly: 158, yearly: 798,
    features: ["3 boutiques Shopify connectées", "Teste plusieurs produits à la fois", "2× plus de crédit IA", "Optimisation quotidienne de la boutique", "Images et modifications en plus", "Support prioritaire"],
    limits: { stores: "Illimitées", conversations: "400 / mois", images: "300 / mois", shops: "3", ai: "2 € toutes les 5 h, 7 € / semaine" },
    cta: "Commencer", featured: true,
  },
];

// Offre de lancement : −50 % à vie si on s'abonne dans les 48 h après l'inscription (coupon Stripe « pour toujours »).
// Starter 78 → 39 €/mois (398 → 199 €/an), Pro 158 → 79 €/mois (798 → 399 €/an).
// Après 48 h, le client paie vraiment le prix normal : c'est ce qui rend le prix barré légal.
export const LAUNCH_OFFER = { hours: 48, percent: 50 };
export const withOffer = (price: number) => Math.round(price * (1 - LAUNCH_OFFER.percent / 100));

export const PAID_PLANS = PLANS.filter((p) => !p.hidden);

// Explication affichée sous les offres (doit correspondre à lib/server/budget.ts).
export const AI_FAIR_USE =
  "L'IA fonctionne avec un crédit qui se recharge toutes les 5 heures, comme les assistants IA du marché, et une limite par semaine. Un usage normal (création de boutiques, retouches quotidiennes) ne l'atteint pas.";

export const euro = (n: number) => `${n.toLocaleString("fr-FR")} €`;
