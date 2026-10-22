// Vraies boutiques générées avec Vigenia (photos et textes d'origine), présentées aux couleurs vives de leur marque.
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
    slug: "delie", name: "Délié", category: "Auto", language: "français",
    brief: "Adaptateur CarPlay sans fil, à brancher une fois sur le port USB de la voiture.",
    headline: "Votre CarPlay, enfin sans câble.", sub: "Branchez-le une fois, votre iPhone se connecte seul à chaque démarrage.", product: "Adaptateur CarPlay sans fil", price: "39,90 €",
    palette: { bg: "#eef4ff", ink: "#0b1b3f", accent: "#2563eb", soft: "#d6e4ff" }, font: "sans", layout: "split",
    highlights: ["Photos produit créées par l'IA", "Offres par lot (×2, ×3)", "Vrais avis acheteurs importés"],
    image: "/showcase/delie.jpg",
  },
  {
    slug: "macho", name: "Mâchô", category: "Gourmandise", language: "français",
    brief: "Chewing-gums aux saveurs originales, sans sucres ajoutés, en coffret découverte.",
    headline: "Du goût qui dure. Enfin.", sub: "Des saveurs introuvables en rayon, sans sucres ajoutés.", product: "Coffret découverte Mâchô", price: "14,90 €",
    palette: { bg: "#fff0f5", ink: "#3b0a1f", accent: "#ff4d8d", soft: "#ffd3e3" }, font: "serif", layout: "split",
    highlights: ["Photo produit créée par l'IA", "Lots de 3 et de 6 boîtes", "Livraison offerte dès 25 €"],
    image: "/showcase/macho.jpg",
  },
  {
    slug: "kordo", name: "Kordo", category: "Tech", language: "français",
    brief: "Câble porte-clés 4 en 1 avec écran qui affiche la puissance de charge.",
    headline: "Votre câble, toujours accroché à vos clés.", sub: "Téléphone, tablette, ordinateur : un seul câble court.", product: "Câble porte-clés 4 en 1", price: "14,90 €",
    palette: { bg: "#fff5eb", ink: "#2a1405", accent: "#f97316", soft: "#ffdcbf" }, font: "sans", layout: "split",
    highlights: ["Packshot studio créé par l'IA", "Comparatif avec un câble classique", "Lot de 2 à prix réduit"],
    image: "/showcase/kordo.jpg",
  },
  {
    slug: "pas-sur", name: "Pas Sûr", category: "Maroquinerie", language: "français",
    brief: "Sac cabas en cuir, sobre et solide, à porter tous les jours.",
    headline: "Le sac qu'on garde, saison après saison.", sub: "Cuir souple, grand format, échange gratuit sous 30 jours.", product: "Cabas en cuir", price: "89,00 €",
    palette: { bg: "#fff1f1", ink: "#3a0909", accent: "#dc2626", soft: "#ffd0d0" }, font: "serif", layout: "center",
    highlights: ["Photos en situation créées par l'IA", "Garantie et retours mis en avant", "Description courte et claire"],
    image: "/showcase/passur.jpg",
  },
  {
    slug: "silencio", name: "Silencio", category: "Gaming", language: "français",
    brief: "Casque gaming avec micro antibruit, pour jouer en équipe sur toutes les plateformes.",
    headline: "Le calme autour de toi. Ta voix pour l'équipe.", sub: "Écoute posée, voix nette, finition mate.", product: "Casque Silencio", price: "59,00 €",
    palette: { bg: "#f4efff", ink: "#1a0b3d", accent: "#7c3aed", soft: "#e2d5ff" }, font: "sans", layout: "split",
    highlights: ["Packshot sur fond blanc créé par l'IA", "Compatibilités par plateforme", "Vrais avis acheteurs importés"],
    image: "/showcase/silencio.jpg",
  },
  {
    slug: "pincee", name: "Pincée", category: "Cuisine", language: "français",
    brief: "Cuillère balance qui pèse levure, sel, épices ou café au dixième de gramme.",
    headline: "Le bon dosage, au dixième de gramme.", sub: "Pesez directement dans la cuillère, sans sortir la balance.", product: "Cuillère balance Pincée", price: "19,90 €",
    palette: { bg: "#fffbeb", ink: "#3a2604", accent: "#f59e0b", soft: "#fde68a" }, font: "serif", layout: "grid",
    highlights: ["Scène produit créée par l'IA", "Usages concrets en cuisine", "Lot cadeau de 2"],
    image: "/showcase/pincee.jpg",
  },
];
