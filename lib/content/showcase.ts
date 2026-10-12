// Boutiques d'exemple (marques fictives) affichées dans la vitrine.
export type ShowcaseStore = {
  slug: string;
  name: string;
  category: string;
  language: string;
  brief: string;
  headline: string;
  sub: string;
  product: string;
  price: string;
  palette: { bg: string; ink: string; accent: string; soft: string };
  font: "serif" | "sans" | "mono";
  layout: "split" | "center" | "grid";
  highlights: string[];
};

export const SHOWCASE: ShowcaseStore[] = [
  {
    slug: "kova-keys", name: "Kova Keys", category: "Tech & gaming", language: "français",
    brief: "Clavier mécanique compact pour gamers, look rose néon, cible 16-28 ans.",
    headline: "Chaque frappe compte.", sub: "Clavier 65 % hot-swap, 1 ms de latence.", product: "Kova K65 Neon", price: "89,00 €",
    palette: { bg: "#ffe3ef", ink: "#2a0b1a", accent: "#ff3d8b", soft: "#ffc2da" }, font: "sans", layout: "split",
    highlights: ["Fiche technique traduite en bénéfices", "Comparatif avec 2 modèles concurrents", "Bundle clavier + repose-poignets"],
  },
  {
    slug: "aurore", name: "Aurore", category: "Cosmétique", language: "français",
    brief: "Baumes à lèvres naturels premium, 6 ingrédients, fabriqués à Grasse.",
    headline: "Six ingrédients. Zéro compromis.", sub: "Des lèvres nourries du matin au soir.", product: "Baume Rose Ancienne", price: "14,90 €",
    palette: { bg: "#fbf1ee", ink: "#3b1420", accent: "#b3264a", soft: "#f1d3d6" }, font: "serif", layout: "center",
    highlights: ["Promesse construite sur la composition", "FAQ qui répond à « ça colle ? »", "Lot de 3 à −20 %"],
  },
  {
    slug: "drift", name: "Drift", category: "Électronique", language: "anglais",
    brief: "Enceinte portable étanche, design minimal, marché US.",
    headline: "Sound that goes where you go.", sub: "IP67. 24 h of battery. 540 g.", product: "Drift One", price: "$129",
    palette: { bg: "#0b1020", ink: "#e8ecff", accent: "#4d7cff", soft: "#1a2340" }, font: "sans", layout: "split",
    highlights: ["Boutique entièrement en anglais", "Section « vs. the big brands »", "Garantie 2 ans mise en avant"],
  },
  {
    slug: "vesta", name: "Vesta", category: "Mode", language: "français",
    brief: "Vestes en cuir upcyclé, pièces uniques, positionnement streetwear premium.",
    headline: "Déjà vécues. Pas encore portées.", sub: "Cuir upcyclé, pièces uniques numérotées.", product: "Veste Montmartre", price: "240,00 €",
    palette: { bg: "#efe9e2", ink: "#1b1714", accent: "#1b1714", soft: "#d9cfc3" }, font: "serif", layout: "grid",
    highlights: ["Storytelling « pièce unique »", "Guide des tailles généré", "Réassurance retours 30 jours"],
  },
  {
    slug: "mixo", name: "Mixo", category: "Cuisine", language: "français",
    brief: "Blender portable rechargeable, smoothies en 30 secondes, cible sportifs.",
    headline: "Ton smoothie, partout.", sub: "Rechargeable en USB-C, 15 mixages par charge.", product: "Mixo Go", price: "39,90 €",
    palette: { bg: "#fff1e4", ink: "#2b1406", accent: "#ff6a1a", soft: "#ffd6b3" }, font: "sans", layout: "center",
    highlights: ["Recettes intégrées à la fiche produit", "Objection « ça mixe la glace ? » traitée", "Offre 2 achetés, 1 offert"],
  },
  {
    slug: "atelier-rotin", name: "Atelier Rotin", category: "Maison", language: "français",
    brief: "Mobilier en rotin fait main, style bohème chic, livraison France.",
    headline: "Tressé à la main, pensé pour durer.", sub: "Mobilier en rotin naturel, fait en petites séries.", product: "Fauteuil Biarritz", price: "349,00 €",
    palette: { bg: "#f6efe3", ink: "#2f2416", accent: "#9a6a35", soft: "#e8dac3" }, font: "serif", layout: "grid",
    highlights: ["Photos d'ambiance générées", "Délais de fabrication clairs", "Paiement en 3 fois mis en avant"],
  },
  {
    slug: "zest", name: "Zest", category: "Alimentation", language: "français",
    brief: "Chewing-gums énergisants à la caféine, cible étudiants et sportifs.",
    headline: "L'énergie en 5 minutes.", sub: "50 mg de caféine naturelle par gomme.", product: "Zest Menthe", price: "9,90 €",
    palette: { bg: "#21063a", ink: "#f6ecff", accent: "#c6ff3d", soft: "#3a1260" }, font: "sans", layout: "split",
    highlights: ["Ton direct et joueur", "Comparatif café / boisson énergisante", "Abonnement mensuel −15 %"],
  },
  {
    slug: "kumo-matcha", name: "Kumo Matcha", category: "Thé", language: "français",
    brief: "Matcha cérémonial bio importé d'Uji, kit de préparation inclus.",
    headline: "Le vrai matcha d'Uji.", sub: "Cérémonial, bio, récolté à la main.", product: "Kit Rituel", price: "54,00 €",
    palette: { bg: "#eef3e6", ink: "#13261a", accent: "#3f7d3a", soft: "#d5e4c8" }, font: "serif", layout: "center",
    highlights: ["Pédagogie sur les grades de matcha", "Guide de préparation en 4 étapes", "Abonnement recharge"],
  },
];
