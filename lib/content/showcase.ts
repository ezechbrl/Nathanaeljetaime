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
    slug: "nomade", name: "Nómada", category: "Voyage", language: "espagnol",
    brief: "Sac à dos cabine extensible pour voyageurs, marché espagnol.",
    headline: "Todo cabe. Hasta tu próximo viaje.", sub: "40 L en cabina, se expande a 48 L.", product: "Mochila Nómada 40", price: "119,00 €",
    palette: { bg: "#13201b", ink: "#e9f1ec", accent: "#e0a43a", soft: "#22352d" }, font: "sans", layout: "split",
    highlights: ["Textes écrits en espagnol", "Comparatif avec une valise cabine", "Garantie à vie mise en avant"],
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
    slug: "petit-pas", name: "Petit Pas", category: "Bébé", language: "français",
    brief: "Chaussons bébé en laine mérinos, semelle souple, pour les premiers pas.",
    headline: "Pour les tout premiers pas.", sub: "Laine mérinos, semelle cuir souple, cousus main.", product: "Chaussons Flocon", price: "29,00 €",
    palette: { bg: "#fdf6ee", ink: "#2b2330", accent: "#8a6fb3", soft: "#ebe0f3" }, font: "serif", layout: "split",
    highlights: ["Guide des pointures par âge", "FAQ « ça tient au pied ? »", "Coffret naissance"],
  },
];
