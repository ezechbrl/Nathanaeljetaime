// Page « Nouveautés » : ce qui est disponible et ce qui arrive. Ajoute une entrée datée à chaque mise en production.
export type ChangelogEntry = { status: "Disponible" | "En cours" | "Prévu"; title: string; text: string; date?: string };

export const CHANGELOG: ChangelogEntry[] = [
  { status: "Disponible", title: "Création de boutique à partir d'un brief", text: "Décris ton produit : stratégie, identité, pages, fiche produit et FAQ sont générées dans la langue de ton marché." },
  { status: "Disponible", title: "Import depuis un lien produit", text: "Colle le lien d'une page produit : l'IA en extrait les caractéristiques et écrit une fiche originale." },
  { status: "Disponible", title: "Éditeur par chat et historique des versions", text: "Demande une modification en une phrase. Chaque changement crée une version que tu peux restaurer." },
  { status: "En cours", title: "Optimisation quotidienne", text: "Chaque matin, l'IA lit les statistiques de ta boutique et propose 3 à 5 améliorations concrètes." },
  { status: "En cours", title: "Studio d'images", text: "Photos d'ambiance et bannières générées à partir de tes visuels produit, dans le style de ta marque." },
  { status: "Prévu", title: "Refonte d'une boutique existante", text: "Connecte ta boutique : l'IA analyse tes pages et propose une version réécrite, sans toucher à tes commandes." },
  { status: "Prévu", title: "Version anglaise du site", text: "Toute l'interface disponible en anglais." },
];
