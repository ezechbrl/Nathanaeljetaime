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
  missing?: string[]; // options de l'offre supérieure, montrées barrées
  was?: number; // ancien prix mensuel réellement payé (barré), affiché jusqu'à BARRED_UNTIL
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
    id: "pro", name: "Starter", badge: "Le plus avantageux", tagline: "Tu débutes ? Une boutique parfaite, créée par l'IA en 3 minutes, sans rien connaître à Shopify.", monthly: 29, yearly: 249, was: 39,
    features: [
      "Ta boutique prête en 3 minutes, à partir d'un simple lien",
      { text: "Des photos dignes d'une grande marque", preview: "photos" },
      { text: "Des textes qui donnent envie d'acheter", preview: "texts" },
      { text: "Les vrais avis clients, importés et traduits", preview: "reviews" },
      { text: "Des offres par lot pour vendre plus", preview: "offers" },
      "Modifie tout en parlant à l'IA",
    ],
    // Ce que le Starter n'a pas : affiché grisé et barré sur sa carte (vraies limites, voir lib/server/quota.ts et budget.ts).
    missing: ["3 boutiques Shopify connectées", "Support prioritaire"],
    limits: { stores: "Illimitées", conversations: "150 / mois", images: "100 / mois", shops: "1", ai: "1 € toutes les 5 h, 3 € / semaine" },
    cta: "Commencer", featured: true,
  },
  {
    id: "agency", name: "Pro", badge: "Vendeurs déjà lancés", tagline: "Tu connais déjà Shopify ? Va beaucoup plus vite : jusqu'à 3 boutiques et 2× plus d'IA.", monthly: 59, yearly: 499, was: 79,
    features: [
      "Ta boutique prête en 3 minutes, à partir d'un simple lien",
      { text: "3 boutiques Shopify : teste 3 produits en même temps", preview: "stores" },
      { text: "3× plus de photos (300 par mois)", preview: "photos-pro" },
      "2× plus de crédit IA (400 messages par mois)",
      { text: "Des textes qui donnent envie d'acheter", preview: "texts" },
      { text: "Les vrais avis clients, importés et traduits", preview: "reviews" },
      { text: "Des offres par lot pour vendre plus", preview: "offers" },
      "Support prioritaire : on te répond en premier",
    ],
    limits: { stores: "Illimitées", conversations: "400 / mois", images: "300 / mois", shops: "3", ai: "2 € toutes les 5 h, 7 € / semaine" },
    cta: "Commencer",
  },
];

// Offre de bienvenue, 24 h après l'inscription : « Ma boutique » (paiement unique) à 39 € au lieu de 49 €.
// Les abonnements n'ont plus de réduction : leur prix affiché est le prix payé.
export const LAUNCH_OFFER = { hours: 24, percent: 0 };
export const withOffer = (price: number) => price;

// Paiement unique « Ma boutique » : une boutique complète, sans abonnement, et 7 jours de retouches.
export const SINGLE = { price: 49, offer: 39, days: 7 };
// Prix barrés des abonnements : les anciens prix réellement payés (39 € et 79 €/mois), pendant 30 jours.
// La loi demande que le prix barré soit le plus bas des 30 derniers jours : ils disparaissent tout seuls après.
export const BARRED_UNTIL = "2026-12-23T23:00:00Z";
export const showBarred = () => Date.now() < new Date(BARRED_UNTIL).getTime();
export const SINGLE_MISSING = ["Boutiques illimitées", "Éditeur IA sans limite de temps"];
export const SINGLE_FEATURES = [
  "Ta boutique complète, créée par l'IA",
  "Une quinzaine de photos pro",
  "Tous les textes de vente et les vrais avis",
  "Le thème Shopify à tes couleurs, à télécharger",
  "7 jours pour tout retoucher avec l'IA",
  "À toi pour toujours, sans abonnement",
];

// Inscrits de la liste d'attente : un prix encore plus bas que l'offre de lancement, à vie, dans le même délai de 24 h.
// (Gardé pour les comptes qui l'ont déjà : 29 €/mois ou 149 €/an pour Starter, 59 €/mois ou 299 €/an pour Pro.)
export const WAITLIST_PRICES: Record<"pro" | "agency", { monthly: number; yearly: number }> = {
  pro: { monthly: 29, yearly: 149 },
  agency: { monthly: 59, yearly: 299 },
};

export const PAID_PLANS = PLANS.filter((p) => !p.hidden);

// Explication affichée sous les offres (doit correspondre à lib/server/budget.ts).
export const AI_FAIR_USE =
  "L'IA fonctionne avec un crédit qui se recharge toutes les 5 heures, comme les assistants IA du marché, et une limite par semaine. Un usage normal (création de boutiques, retouches quotidiennes) ne l'atteint pas.";

export const euro = (n: number) => `${n.toLocaleString("fr-FR")} €`;
