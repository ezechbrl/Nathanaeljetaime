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
  image?: string; // vraie photo générée par Vigenia (sinon visuel dessiné aux couleurs de la marque)
};

export const SHOWCASE: ShowcaseStore[] = [
  {
    slug: "norde", name: "Nordé", category: "Gaming", language: "français",
    brief: "Casque gaming sans fil avec micro, pour les joueurs en équipe, prix 59 €.",
    headline: "Entends tout. Avant les autres.", sub: "Son spatial, micro antibruit, 40 h d'autonomie.", product: "Casque Nordé One", price: "59,00 €",
    palette: { bg: "#0b0f0e", ink: "#e8fff6", accent: "#2ee6a6", soft: "#16302a" }, font: "sans", layout: "split",
    highlights: ["Photos produit créées par l'IA à partir du lien AliExpress", "Offres par lot (×2, ×3)", "Vrais avis acheteurs importés"],
    image: "/showcase/norde.jpg",
  },
  {
    slug: "macho", name: "Mâchô", category: "Gourmandise", language: "français",
    brief: "Chewing-gums aux saveurs originales, sans sucres ajoutés, en coffret découverte.",
    headline: "Six saveurs. Zéro sucre ajouté.", sub: "Le coffret découverte, à glisser dans le sac.", product: "Coffret découverte Mâchô", price: "14,90 €",
    palette: { bg: "#f6d9d0", ink: "#1f2a44", accent: "#1f2a44", soft: "#eebfb2" }, font: "serif", layout: "split",
    highlights: ["Photo produit créée par l'IA", "Lots de 3 et de 6 boîtes", "Vrais avis acheteurs importés"],
    image: "/showcase/macho.jpg",
  },
  {
    slug: "seve", name: "Sève", category: "Soin du visage", language: "français",
    brief: "Sérum visage à la sève de bouleau, peaux sensibles, fabriqué dans le Jura.",
    headline: "La douceur d'une forêt, en dix gouttes.", sub: "Sérum apaisant à 92 % de sève de bouleau.", product: "Sérum Première Sève", price: "32,00 €",
    palette: { bg: "#f3f0e8", ink: "#22261c", accent: "#5c6b3c", soft: "#e0e3cf" }, font: "serif", layout: "center",
    highlights: ["Routine du soir en 3 gestes", "Tableau « peau sensible ? »", "Duo sérum + crème −15 %"],
  },
  {
    slug: "kobalt", name: "Kobalt", category: "Sport", language: "anglais",
    brief: "Gourde isotherme connectée qui rappelle de boire, pour runners, marché US.",
    headline: "Hydration that keeps pace.", sub: "24 h cold. Smart reminders. 680 ml.", product: "Kobalt Run", price: "$49",
    palette: { bg: "#0a1530", ink: "#eaf0ff", accent: "#2f6bff", soft: "#17264d" }, font: "sans", layout: "split",
    highlights: ["Boutique 100 % en anglais", "Section « built for race day »", "Pack famille de 3"],
  },
  {
    slug: "patte-douce", name: "Patte Douce", category: "Animaux", language: "français",
    brief: "Harnais anti-traction rembourré pour petits et moyens chiens, coloris pastel.",
    headline: "Des balades sans tirer.", sub: "Harnais rembourré, réglable en 4 points.", product: "Harnais Nuage", price: "34,90 €",
    palette: { bg: "#fff3ec", ink: "#3a2016", accent: "#e8745a", soft: "#fbd9cc" }, font: "sans", layout: "center",
    highlights: ["Guide des tailles par race", "Objection « il va s'échapper ? » traitée", "Laisse assortie offerte"],
  },
  {
    slug: "grain-dor", name: "Grain d'Or", category: "Café", language: "français",
    brief: "Café de spécialité torréfié à Lyon, abonnement mensuel, amateurs de filtre.",
    headline: "Torréfié mardi, chez toi jeudi.", sub: "Cafés de spécialité, notés 85+ par nos testeurs.", product: "Éthiopie Guji", price: "14,50 €",
    palette: { bg: "#f6eee4", ink: "#2a1a10", accent: "#b5651d", soft: "#ead6bf" }, font: "serif", layout: "grid",
    highlights: ["Profil aromatique pour chaque café", "Quiz « quel café pour toi ? »", "Abonnement sans engagement"],
  },
  {
    slug: "lumen", name: "Lumen", category: "Maison", language: "français",
    brief: "Lampe de bureau LED qui imite la lumière du jour, pour télétravailleurs.",
    headline: "La lumière du jour, à 22 h.", sub: "Lampe LED à spectre complet, sans scintillement.", product: "Lumen Desk", price: "89,00 €",
    palette: { bg: "#f4f4f1", ink: "#18181a", accent: "#f2b705", soft: "#e8e6dd" }, font: "sans", layout: "grid",
    highlights: ["Bénéfices santé expliqués simplement", "Mode d'emploi illustré", "Essai 30 jours"],
  },
  {
    slug: "mosaik", name: "Mosaïk", category: "Bijoux", language: "français",
    brief: "Bijoux en verre recyclé faits main à Marseille, cadeaux à moins de 50 €.",
    headline: "Chaque éclat a déjà vécu.", sub: "Bijoux en verre recyclé, façonnés à la main.", product: "Créoles Calanque", price: "42,00 €",
    palette: { bg: "#eef6f6", ink: "#10292b", accent: "#1f8a8a", soft: "#cfe7e6" }, font: "serif", layout: "center",
    highlights: ["Storytelling « verre de la mer »", "Emballage cadeau en option", "Livraison offerte dès 2 bijoux"],
  },
  {
    slug: "atlas", name: "Atlas", category: "Montres", language: "anglais",
    brief: "Montre minimaliste en acier, cadran noir, pour hommes actifs, marché UK.",
    headline: "Time, without the noise.", sub: "Steel case. Sapphire glass. 5 ATM.", product: "Atlas 40", price: "£129",
    palette: { bg: "#111214", ink: "#f2f2f0", accent: "#c9a96e", soft: "#24262a" }, font: "sans", layout: "split",
    highlights: ["Boutique 100 % en anglais", "Comparatif avec une montre de luxe", "Gravure offerte"],
  },
];
