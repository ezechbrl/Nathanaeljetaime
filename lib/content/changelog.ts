// Page « Nouveautés » : ce qui est disponible et ce qui arrive. Ajoute une entrée datée à chaque mise en production.
export type ChangelogEntry = { status: "Disponible" | "En cours" | "Prévu"; title: string; text: string; date?: string };

export const CHANGELOG: ChangelogEntry[] = [
  { status: "Disponible", title: "Création de boutique à partir d'un brief", text: "Décris ton produit : stratégie, identité, pages, fiche produit et FAQ sont générées dans la langue de ton marché." },
  { status: "Disponible", title: "Import depuis un lien produit", text: "Colle le lien de ton produit (ta page ou celle de ton fournisseur) : l'IA en extrait les caractéristiques et écrit une fiche originale." },
  { status: "Disponible", title: "Éditeur par chat et historique des versions", text: "Demande une modification en une phrase. Chaque changement crée une version que tu peux restaurer." },
  { status: "Disponible", title: "Mise en ligne guidée sur Shopify", text: "Télécharge ton produit et ton thème (photos comprises), puis importe-les dans ton Shopify en 2 étapes guidées." },
  { status: "Disponible", title: "4 styles de boutique et bandeaux défilants", text: "Premium, vente directe, lifestyle ou sport / tech : le style, les polices, l'ordre des sections et les couleurs s'adaptent à ta niche, avec des bandeaux qui défilent.", date: "2026-11-14" },
  { status: "En cours", title: "Studio d'images", text: "Photos d'ambiance et bannières générées à partir de tes visuels produit, dans le style de ta marque." },
  { status: "Prévu", title: "Version anglaise du site", text: "Toute l'interface disponible en anglais." },
];
