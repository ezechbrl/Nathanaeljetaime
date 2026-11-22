import type { ToolId } from "@/components/site/FreeTools";

// Pages publiques des outils gratuits (référencement Google) : une page par outil, sans inscription.
export type FreeToolPage = {
  slug: string;
  tool: ToolId;
  title: string; // titre de la page (Google)
  h1: string;
  description: string; // méta description
  intro: string;
  steps: [string, string, string];
  faq: { q: string; a: string }[];
};

export const FREE_TOOL_PAGES: FreeToolPage[] = [
  {
    slug: "generateur-nom-de-boutique", tool: "store-name",
    title: "Générateur de nom de boutique gratuit (IA)",
    h1: "Générateur de nom de boutique gratuit",
    description: "Trouve un nom de boutique en ligne court et mémorable en quelques secondes. Gratuit, sans inscription, pensé pour Shopify et le dropshipping.",
    intro: "Décris ce que tu vends et l'ambiance que tu veux : l'IA te propose 8 noms courts, faciles à retenir et à prononcer. Garde ceux qui te plaisent et vérifie ensuite que le nom de domaine est libre.",
    steps: ["Écris ce que tu vends, en quelques mots.", "Choisis une ambiance (douce, sportive, haut de gamme…).", "Clique sur « Générer » et copie le nom qui te plaît."],
    faq: [
      { q: "C'est vraiment gratuit ?", a: "Oui, tu peux l'utiliser quelques fois par jour sans compte et sans carte bancaire." },
      { q: "Comment savoir si le nom est libre ?", a: "Vérifie le nom de domaine chez un registraire et cherche le nom sur Google et sur les réseaux sociaux. Pour un projet sérieux, tu peux aussi vérifier qu'il n'est pas déjà déposé comme marque sur le site de l'INPI." },
      { q: "Quelle longueur pour un bon nom ?", a: "Le plus court possible : un ou deux mots, faciles à écrire et à dire à voix haute." },
    ],
  },
  {
    slug: "generateur-de-slogan", tool: "slogan",
    title: "Générateur de slogan gratuit pour ta boutique (IA)",
    h1: "Générateur de slogan gratuit",
    description: "Trouve un slogan court et percutant pour ta marque ou ta boutique en ligne. Gratuit, sans inscription.",
    intro: "Donne le nom de ta marque et ce que tu vends : l'IA écrit 6 slogans de moins de 8 mots, à mettre en haut de ta boutique, sur ta bio Instagram ou sur ton emballage.",
    steps: ["Écris le nom de ta marque.", "Dis en quelques mots ce que tu vends.", "Clique sur « Générer » et copie le slogan qui te ressemble."],
    faq: [
      { q: "À quoi sert un slogan ?", a: "À faire comprendre en une phrase ce que tu vends et pourquoi c'est bien. C'est souvent la première chose qu'un visiteur lit." },
      { q: "Je peux le modifier ?", a: "Bien sûr : sers-toi des propositions comme point de départ et adapte-les à ta façon de parler." },
      { q: "C'est gratuit ?", a: "Oui, quelques générations par jour, sans compte." },
    ],
  },
  {
    slug: "generateur-description-produit", tool: "product-description",
    title: "Générateur de description produit gratuit (Shopify, IA)",
    h1: "Générateur de description produit gratuit",
    description: "Écris une description produit qui donne envie d'acheter, prête à coller dans Shopify. Gratuit, sans inscription.",
    intro: "Colle le nom de ton produit et ses caractéristiques : l'IA écrit une description claire avec une accroche et une liste de bénéfices, prête à coller dans ta fiche produit Shopify.",
    steps: ["Écris le nom de ton produit.", "Ajoute ses caractéristiques (matière, taille, usage…).", "Clique sur « Générer » et copie le texte ou le HTML pour Shopify."],
    faq: [
      { q: "Pourquoi parler de bénéfices plutôt que de caractéristiques ?", a: "Une caractéristique dit ce qu'est le produit, un bénéfice dit ce qu'il change pour l'acheteur. C'est le bénéfice qui donne envie d'acheter." },
      { q: "Je peux copier le résultat dans Shopify ?", a: "Oui : le bouton « Copier le HTML pour Shopify » garde la mise en forme (titres et liste)." },
      { q: "Le texte est-il unique ?", a: "Il est écrit pour ton produit à chaque génération. Relis-le toujours et vérifie que chaque information est exacte avant de publier." },
    ],
  },
  {
    slug: "generateur-faq-produit", tool: "faq",
    title: "Générateur de FAQ produit gratuit (IA)",
    h1: "Générateur de FAQ produit gratuit",
    description: "Les questions que tes clients se posent avant d'acheter, avec les réponses. Gratuit, sans inscription.",
    intro: "Une bonne FAQ rassure et évite les questions par message. Décris ton produit : l'IA écrit 6 questions-réponses que tes clients se posent avant d'acheter.",
    steps: ["Écris le nom de ton produit.", "Ajoute ses caractéristiques principales.", "Clique sur « Générer », relis et copie les réponses."],
    faq: [
      { q: "Où mettre la FAQ ?", a: "Sur ta fiche produit, juste sous le bouton d'achat, ou dans une page FAQ de ta boutique." },
      { q: "Les réponses sont-elles fiables ?", a: "L'IA part de ce que tu écris. Vérifie toujours les délais, garanties et caractéristiques avant de publier." },
      { q: "C'est gratuit ?", a: "Oui, quelques générations par jour, sans compte." },
    ],
  },
  {
    slug: "idees-videos-tiktok", tool: "tiktok-ideas",
    title: "Idées de vidéos TikTok pour vendre un produit (gratuit, IA)",
    h1: "Idées de vidéos TikTok pour ton produit",
    description: "5 idées de vidéos TikTok à tourner avec ton téléphone pour faire connaître ton produit : accroche, quoi filmer, légende. Gratuit.",
    intro: "Tu ne sais pas quoi filmer ? Décris ton produit : l'IA te donne 5 idées de vidéos courtes, avec l'accroche des 2 premières secondes, ce qu'il faut filmer et la légende.",
    steps: ["Écris le nom de ton produit.", "Dis pour qui il est et pourquoi il est bien.", "Clique sur « Générer » et tourne les vidéos avec ton téléphone."],
    faq: [
      { q: "Pourquoi l'accroche est si importante ?", a: "Sur TikTok, beaucoup de gens décident en une ou deux secondes s'ils regardent la suite. L'accroche doit donner envie tout de suite." },
      { q: "Il faut du matériel ?", a: "Non : toutes les idées se tournent seul, avec un téléphone." },
      { q: "C'est gratuit ?", a: "Oui, quelques générations par jour, sans compte." },
    ],
  },
  {
    slug: "generateur-legende-instagram", tool: "instagram-caption",
    title: "Générateur de légende Instagram gratuit (IA)",
    h1: "Générateur de légende Instagram gratuit",
    description: "Des légendes Instagram courtes avec emojis et hashtags pour tes posts et stories produit. Gratuit, sans inscription.",
    intro: "Décris ton produit et ce que tu veux mettre en avant : l'IA écrit 4 légendes courtes avec quelques emojis et des hashtags, prêtes à copier.",
    steps: ["Écris le nom de ton produit.", "Dis ce que tu veux mettre en avant (nouveauté, offre…).", "Clique sur « Générer » et copie la légende."],
    faq: [
      { q: "Combien de hashtags mettre ?", a: "Quelques hashtags précis valent mieux qu'une longue liste. Les légendes proposées en ont 3 à 5." },
      { q: "Je peux les utiliser sur TikTok ?", a: "Oui, en les raccourcissant un peu si besoin." },
      { q: "C'est gratuit ?", a: "Oui, quelques générations par jour, sans compte." },
    ],
  },
];
