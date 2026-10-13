import type { PlanId } from "@/lib/api/types";

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  monthly: number; // en euros
  yearly: number;  // prix annuel total
  features: string[];
  limits: { stores: string; conversations: string; images: string; shops: string };
  cta: string;
  featured?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "free", name: "Découverte", tagline: "Pour tester sur ton projet.", monthly: 0, yearly: 0,
    features: ["1 boutique complète", "Stratégie + identité de marque", "Publication sur Shopify", "20 messages à l'IA / mois"],
    limits: { stores: "1", conversations: "20 / mois", images: "10 / mois", shops: "1" },
    cta: "Commencer gratuitement",
  },
  {
    id: "pro", name: "Pro", tagline: "Pour lancer et faire grandir ta marque.", monthly: 31, yearly: 310,
    features: ["Boutiques illimitées", "500 messages à l'IA / mois", "Studio d'images (200 / mois)", "Optimisation quotidienne", "Import depuis un lien et refonte", "Support prioritaire"],
    limits: { stores: "Illimitées", conversations: "500 / mois", images: "200 / mois", shops: "3" },
    cta: "Passer à Pro", featured: true,
  },
  {
    id: "agency", name: "Agence", tagline: "Pour gérer les boutiques de tes clients.", monthly: 149, yearly: 1490,
    features: ["Tout Pro", "2 000 messages à l'IA / mois", "1 000 images / mois", "10 boutiques Shopify connectées", "Accès multi-utilisateurs", "Accompagnement au lancement"],
    limits: { stores: "Illimitées", conversations: "2 000 / mois", images: "1 000 / mois", shops: "10" },
    cta: "Choisir Agence",
  },
];

export const euro = (n: number) => `${n.toLocaleString("fr-FR")} €`;
