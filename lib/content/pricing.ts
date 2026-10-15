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
};

export const PLANS: Plan[] = [
  {
    id: "free", name: "Découverte", tagline: "Pour tester sur ton projet.", monthly: 0, yearly: 0,
    features: ["1 boutique offerte (une seule fois)", "Stratégie + identité de marque", "Publication sur Shopify", "20 messages à l'IA / mois"],
    limits: { stores: "1", conversations: "20 / mois", images: "10 / mois", shops: "1", ai: "Standard" },
    cta: "Commencer gratuitement",
  },
  {
    id: "pro", name: "Pro", tagline: "Pour lancer et faire grandir ta marque.", monthly: 31, yearly: 310,
    features: ["Boutiques illimitées", "Jusqu'à 200 messages à l'IA / mois", "Studio d'images (200 / mois)", "Optimisation quotidienne", "Import depuis un lien et refonte", "Support prioritaire"],
    limits: { stores: "Illimitées", conversations: "Jusqu'à 200 / mois", images: "200 / mois", shops: "3", ai: "3× Découverte" },
    cta: "Passer à Pro", featured: true,
  },
];

// Explication affichée sous les offres (doit correspondre à lib/server/budget.ts).
export const AI_FAIR_USE =
  "L'IA fonctionne avec un crédit qui se recharge toutes les 5 heures, comme les assistants IA du marché, et une limite par semaine. Un usage normal (création de boutiques, retouches quotidiennes) ne l'atteint pas.";

export const euro = (n: number) => `${n.toLocaleString("fr-FR")} €`;
