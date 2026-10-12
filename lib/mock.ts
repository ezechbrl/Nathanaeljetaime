// Données de démonstration pour le frontend, en attendant la base de données.

export type MockStore = {
  id: string;
  name: string;
  niche: string;
  status: "brouillon" | "publiée";
  language: string;
  updatedAt: string;
  colors: { primary: string; accent: string; background: string };
  conversion: { before: number; after: number };
  revenue30d: number;
  orders30d: number;
};

export const MOCK_STORES: MockStore[] = [
  {
    id: "lumea",
    name: "Lumea",
    niche: "Baumes à lèvres naturels",
    status: "publiée",
    language: "français",
    updatedAt: "il y a 2 h",
    colors: { primary: "#3b1f2b", accent: "#d9576f", background: "#fff6f3" },
    conversion: { before: 1.4, after: 3.8 },
    revenue30d: 12840,
    orders30d: 412,
  },
  {
    id: "nordik",
    name: "Nordik Desk",
    niche: "Accessoires de bureau en bois",
    status: "publiée",
    language: "anglais",
    updatedAt: "hier",
    colors: { primary: "#1f2a24", accent: "#c08a4a", background: "#f6f3ee" },
    conversion: { before: 0.9, after: 2.6 },
    revenue30d: 6420,
    orders30d: 118,
  },
  {
    id: "matcha-lab",
    name: "Matcha Lab",
    niche: "Thé matcha bio",
    status: "brouillon",
    language: "français",
    updatedAt: "il y a 3 j",
    colors: { primary: "#1c3324", accent: "#6aa84f", background: "#f3f8ef" },
    conversion: { before: 0, after: 0 },
    revenue30d: 0,
    orders30d: 0,
  },
];

// Boutiques d'exemple affichées sur la landing (marques fictives).
export const SHOWCASE = [
  { name: "Lumea", niche: "Cosmétique", colors: ["#fff6f3", "#d9576f", "#3b1f2b"] },
  { name: "Nordik Desk", niche: "Maison & bureau", colors: ["#f6f3ee", "#c08a4a", "#1f2a24"] },
  { name: "Matcha Lab", niche: "Alimentation", colors: ["#f3f8ef", "#6aa84f", "#1c3324"] },
  { name: "Vélo Club", niche: "Sport", colors: ["#eef3ff", "#2f5bea", "#0f1a3d"] },
  { name: "Pawly", niche: "Animaux", colors: ["#fff8e8", "#f2a516", "#3a2a06"] },
  { name: "Atelier Rotin", niche: "Décoration", colors: ["#f7f1e8", "#a8743f", "#2e2014"] },
  { name: "Kova Audio", niche: "Tech", colors: ["#f1f1f4", "#7c5cff", "#121218"] },
  { name: "Soleil Swim", niche: "Mode", colors: ["#fff3ec", "#ff7a45", "#2a1306"] },
];

export const OPTIMIZATIONS = [
  { title: "Titre produit raccourci et orienté bénéfice", impact: "+0,4 pt", done: true },
  { title: "Bloc « Livraison offerte dès 39 € » ajouté au-dessus du bouton", impact: "+0,6 pt", done: true },
  { title: "Réponse à l'objection « ça colle ? » dans la FAQ", impact: "+0,2 pt", done: true },
  { title: "Bundle 3 baumes à −20 % proposé sur la fiche produit", impact: "en test", done: false },
];

export const PLANS = [
  {
    name: "Découverte",
    price: "0 €",
    period: "",
    description: "Pour tester l'IA sur ton projet.",
    features: ["1 boutique générée", "Stratégie + fiche produit", "Export vers Shopify en brouillon"],
    cta: "Commencer gratuitement",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "39 €",
    period: "/mois",
    description: "Pour lancer et faire grandir ta marque.",
    features: [
      "Boutiques illimitées",
      "Toutes les langues",
      "Éditeur par chat",
      "Optimisation quotidienne par l'IA",
      "Support prioritaire",
    ],
    cta: "Essayer Pro",
    highlighted: true,
  },
  {
    name: "Agence",
    price: "149 €",
    period: "/mois",
    description: "Pour gérer les boutiques de tes clients.",
    features: ["Tout Pro", "10 boutiques Shopify connectées", "Multi-utilisateurs", "Marque blanche des rapports"],
    cta: "Contacter l'équipe",
    highlighted: false,
  },
];
