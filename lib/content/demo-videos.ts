// Vidéos enregistrées directement dans l'application (dossier public/videos).
// Les légendes s'affichent à l'instant indiqué (en secondes), comme des sous-titres.
export type DemoVideo = {
  id: string;
  step: string;
  title: string;
  text: string;
  src: string;
  poster: string;
  captions: { t: number; text: string }[];
};

export const DEMO_VIDEOS: DemoVideo[] = [
  {
    id: "connect", step: "Étape 1", title: "Relie Shopify",
    text: "L'adresse de ta boutique suffit : ton espace est créé et relié à Shopify, sans mot de passe à retenir.",
    src: "/videos/connect.webm", poster: "/videos/connect.jpg",
    captions: [
      { t: 0, text: "Pas besoin de créer un compte : tu te connectes avec Shopify." },
      { t: 3, text: "Tu tapes l'adresse de ta boutique…" },
      { t: 7, text: "…et tu arrives directement dans ton espace, boutique reliée." },
    ],
  },
  {
    id: "generate", step: "Étape 2", title: "Une phrase, une boutique",
    text: "Tu dis ce que tu vends et à qui. Vigenia réfléchit d'abord à ta cible et à tes arguments, puis remplit chaque page.",
    src: "/videos/generate.webm", poster: "/videos/generate.jpg",
    captions: [
      { t: 0, text: "Tu décris ton produit en une phrase." },
      { t: 6, text: "L'IA analyse ton marché, ta promesse et les objections d'achat." },
      { t: 13, text: "Elle écrit l'identité, la page d'accueil, la fiche produit et la FAQ." },
      { t: 24, text: "Ta boutique est prête : tu relis, tu publies sur Shopify." },
    ],
  },
  {
    id: "edit", step: "Étape 3", title: "Ajuste en discutant",
    text: "« Plus premium », « ajoute un lot de 3 » : l'IA applique, te montre l'avant/après, et garde chaque version.",
    src: "/videos/edit.webm", poster: "/videos/edit.jpg",
    captions: [
      { t: 0, text: "Tu demandes un changement, comme à un expert e-commerce." },
      { t: 6, text: "L'IA réécrit et te montre exactement ce qui a changé." },
      { t: 12, text: "Une offre, une couleur, un titre : tout se modifie en une phrase." },
      { t: 18, text: "Tu vérifies le rendu sur mobile avant de publier." },
    ],
  },
  {
    id: "pilot", step: "Étape 4", title: "Progresse chaque matin",
    text: "Vigenia lit tes ventes et tes visites, repère ce qui bloque et te propose une correction prête à appliquer.",
    src: "/videos/pilot.webm", poster: "/videos/pilot.jpg",
    captions: [
      { t: 0, text: "Chaque matin, l'IA lit les statistiques de ta boutique." },
      { t: 4, text: "Conversion, chiffre d'affaires, visites : tout est suivi jour par jour." },
      { t: 9, text: "Elle propose des corrections concrètes, applicables en un clic." },
    ],
  },
];
