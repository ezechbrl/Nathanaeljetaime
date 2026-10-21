import type { PlanId } from "@/lib/api/types";

// Une ligne d'offre ; « preview » ouvre un petit aperçu de ce que fait l'IA (photos, avis, textes, offres).
export type PlanFeature = string | { text: string; preview: "photos" | "photos-pro" | "reviews" | "texts" | "offers" | "stores" | "coach" };

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  badge: string; // à qui s'adresse l'offre
  monthly: number; // en euros
  yearly: number;  // prix annuel total
  features: PlanFeature[];
  limits: { stores: string; conversations: string; images: string; shops: string; ai: string };
  cta: string;
  featured?: boolean;
  hidden?: boolean;
};

// Identifiants internes gardés tels quels (contrainte de la base) : « pro » = offre Starter, « agency » = offre Pro.
export const PLANS: Plan[] = [
  {
    // Compte sans abonnement (pas affiché sur la page Tarifs : il n'y a pas d'offre gratuite).
    id: "free", name: "Sans abonnement", badge: "", tagline: "", monthly: 0, yearly: 0, hidden: true,
    features: [], limits: { stores: "0", conversations: "0", images: "0", shops: "1", ai: "Aucune" }, cta: "",
  },
  {
    id: "pro", name: "Starter", badge: "Recommandé · débutants", tagline: "Tu débutes ? Une boutique parfaite, créée par l'IA en moins de 10 minutes, sans rien connaître à Shopify.", monthly: 78, yearly: 398,
    features: [
      "Ta boutique prête à vendre en 10 minutes, à partir d'un simple lien",
      { text: "Des photos dignes d'une grande marque, créées par l'IA", preview: "photos" },
      { text: "Des textes qui donnent envie d'acheter, écrits pour ton produit", preview: "texts" },
      { text: "Les vrais avis clients du produit, importés et traduits", preview: "reviews" },
      { text: "Des offres par lot qui font grimper ton panier moyen", preview: "offers" },
      "Change de produit quand tu veux, autant de fois que tu veux",
      "Modifie tout en parlant à l'IA, comme dans une conversation",
      "Un design à tes couleurs, publié sur Shopify en 1 clic",
      "1 boutique Shopify connectée",
    ],
    limits: { stores: "Illimitées", conversations: "150 / mois", images: "100 / mois", shops: "1", ai: "1 € toutes les 5 h, 3 € / semaine" },
    cta: "Commencer", featured: true,
  },
  {
    id: "agency", name: "Pro", badge: "Vendeurs déjà lancés", tagline: "Tu connais déjà Shopify ? Va beaucoup plus vite : jusqu'à 3 boutiques et 2× plus d'IA.", monthly: 158, yearly: 798,
    features: [
      { text: "3 boutiques Shopify : teste 3 produits en même temps et garde les gagnants", preview: "stores" },
      "2× plus de crédit IA pour créer et améliorer encore plus",
      { text: "3× plus de photos chaque mois (300 au lieu de 100)", preview: "photos-pro" },
      { text: "Chaque jour, l'IA analyse ta boutique et te dit quoi changer pour vendre plus", preview: "coach" },
      "Support prioritaire : on te répond en premier",
    ],
    limits: { stores: "Illimitées", conversations: "400 / mois", images: "300 / mois", shops: "3", ai: "2 € toutes les 5 h, 7 € / semaine" },
    cta: "Commencer",
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
