import type { PlanId } from "@/lib/api/types";
import { site } from "@/lib/site";

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

export const PLANS: Plan[] = [
  {
    // Compte sans abonnement (pas affiché sur la page Tarifs : il n'y a pas d'offre gratuite).
    id: "free", name: "Sans abonnement", tagline: "", monthly: 0, yearly: 0, hidden: true,
    features: [], limits: { stores: "0", conversations: "0", images: "0", shops: "1", ai: "Aucune" }, cta: "",
  },
  {
    id: "pro", name: "Pro", tagline: "Pour lancer et faire grandir ta marque.", monthly: 31, yearly: 310,
    features: ["Boutiques illimitées", "Jusqu'à 200 messages à l'IA / mois", "Studio d'images (200 / mois)", "Optimisation quotidienne", "Import depuis un lien et refonte", "Support prioritaire"],
    limits: { stores: "Illimitées", conversations: "Jusqu'à 200 / mois", images: "200 / mois", shops: "3", ai: "1 € toutes les 5 h, 3 € / semaine" },
    cta: "Commencer", featured: true,
  },
];

// Explication affichée sous les offres (doit correspondre à lib/server/budget.ts).
export const AI_FAIR_USE =
  "L'IA fonctionne avec un crédit qui se recharge toutes les 5 heures, comme les assistants IA du marché, et une limite par semaine. Un usage normal (création de boutiques, retouches quotidiennes) ne l'atteint pas.";

export const euro = (n: number) => `${n.toLocaleString("fr-FR")} €`;

// Détail de l'offre Pro, par grands bénéfices (écran d'abonnement). Uniquement ce que Vitrio fait vraiment.
export const PRO_GROUPS = [
  {
    icon: "store", title: "Ta boutique complète",
    items: ["Accueil, fiche produit, FAQ et À propos, prêts en 5 minutes", "Import depuis un lien AliExpress, Amazon ou une boutique", "Refonte de ta boutique existante", "Boutiques illimitées, jusqu'à 3 boutiques Shopify reliées"],
  },
  {
    icon: "camera", title: "Des photos de pro",
    items: ["Photos studio de ton produit sous plusieurs angles", "3 photos de personnes qui utilisent ton produit", "Studio d'images : 200 visuels par mois"],
  },
  {
    icon: "star", title: "Faite pour vendre",
    items: ["Vrais avis des acheteurs avec étoiles et photos", "Offres par lot, prix barré et garantie", "Textes et FAQ qui lèvent les doutes des clients", "Design rapide et parfait sur mobile"],
  },
  {
    icon: "chat", title: "Et ensuite, on t'accompagne",
    items: ["Modifie tout en discutant avec l'IA (200 messages / mois)", "Score de ta boutique et idées pour vendre plus", "Optimisation quotidienne", "Support prioritaire"],
  },
] as const;

// Ordre de grandeur des prix constatés pour faire la même chose sans Vitrio (affiché comme repère).
export const WITHOUT_VITRIO = [
  { label: "Thème premium Shopify", price: "≈ 350 €" },
  { label: "Séance photo produit", price: "300 à 600 €" },
  { label: "Rédaction des textes de vente", price: "200 à 500 €" },
  { label: "Création par un freelance", price: "800 à 2 000 €" },
];

export const PRO_FAQ = [
  { q: "Comment je paie ?", a: "Par ta facture Shopify, comme ton forfait Shopify. Pas de carte à ajouter chez nous." },
  { q: "Je peux arrêter quand je veux ?", a: "Oui, sans engagement, en un clic depuis Shopify. Ta boutique et tout ce qui a été créé restent à toi." },
  { q: "Il faut déjà avoir une boutique Shopify ?", a: `Non. Tu crées ton compte Shopify (${site.shopifyOffer} en ce moment), puis tu le relies à Vitrio en un clic.` },
  { q: "Et si je veux une autre boutique ?", a: "Les boutiques sont illimitées : tu peux tester un nouveau produit quand tu veux." },
];
