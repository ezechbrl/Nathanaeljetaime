import { z } from "zod";

// Icônes disponibles dans le thème (le même jeu côté aperçu Vitrio et côté Shopify).
export const ICONS = ["bolt", "leaf", "heart", "check", "shield", "truck", "star", "sparkle", "drop", "sun", "clock", "gift", "recycle", "hand", "award", "feather", "smile", "home", "moon", "flame"] as const;
export const IconSchema = z.enum(ICONS);
export type IconName = z.infer<typeof IconSchema>;
// Champ icône tolérant : l'IA peut proposer un nom hors liste, il est ramené à « check » à l'affichage.
const iconField = () => z.string().describe(`Nom d'icône, exactement un de : ${ICONS.join(", ")}`);
export const toIcon = (v: string | undefined): IconName => ((ICONS as readonly string[]).includes(v ?? "") ? (v as IconName) : "check");

// Sections enrichies (facultatives pour les boutiques créées avant leur arrivée).
export const RichHomeSchema = z.object({
  features: z.array(z.object({ icon: iconField(), title: z.string().describe("2 à 4 mots"), text: z.string().describe("Une ligne courte") })).describe("4 à 6 atouts concrets du produit, affichés en bandeau d'icônes"),
  featuresTitle: z.string().describe("Titre du bandeau d'atouts, ex. « Ta nouvelle routine »"),
  featuresSubtitle: z.string(),
  benefitsEyebrow: z.string().describe("Sur-titre court en majuscules, ex. « UN RITUEL, DE VRAIS EFFETS »"),
  benefitsTitle: z.string().describe("Titre de la section bénéfices, ex. « Ce que ça change pour toi »"),
  benefitIcons: z.array(iconField()).describe("Une icône par bénéfice de homepage.benefits, dans le même ordre"),
  moments: z.object({
    title: z.string().describe("Ex. « Pour chaque moment de ta journée »"),
    items: z.array(z.object({ title: z.string().describe("2 à 4 mots"), imagePrompt: z.string().describe("Décor EN ANGLAIS où le produit est posé à ce moment (objets, lieu, lumière), SANS personne ni mains, sans texte") })).describe("Exactement 3 moments ou usages"),
  }),
  comparison: z.object({
    title: z.string().describe("Ex. « Notre produit vs l'option classique »"),
    text: z.string().describe("2 phrases qui expliquent la différence, sans dénigrer"),
    usLabel: z.string().describe("Nom court de notre produit"),
    themLabel: z.string().describe("Alternative générique (catégorie), jamais une marque"),
    rows: z.array(z.object({ us: z.string(), them: z.string() })).describe("3 à 4 lignes, factuelles et vérifiables"),
  }),
  story: z.object({
    eyebrow: z.string(),
    title: z.string(),
    paragraphs: z.array(z.string()).describe("2 paragraphes courts sur l'origine, la fabrication ou la sélection du produit, sans inventer de faits invérifiables"),
    imagePrompt: z.string().describe("Scène photo EN ANGLAIS liée à l'origine ou la fabrication, avec le produit, sans texte"),
  }),
  finalCta: z.object({ title: z.string(), text: z.string() }),
  announcements: z.array(z.string()).describe("2 à 3 messages courts pour la barre d'annonce défilante (livraison, retours, offre)"),
});

export const RichProductSchema = z.object({
  highlights: z.array(z.object({ icon: iconField(), title: z.string().describe("2 à 4 mots") })).describe("3 points forts affichés sous la galerie"),
  details: z.array(z.object({ title: z.string(), html: z.string().describe("HTML simple : p, ul, li, strong") })).describe("3 à 4 rubriques dépliables : composition ou matières, utilisation ou entretien, livraison et retours, origine ou qualité"),
  guarantee: z.string().describe("Garantie en une phrase, ex. « 30 jours satisfait ou remboursé »"),
  bundles: z.array(z.object({
    quantity: z.number().describe("Nombre d'unités, entier de 1 à 6"),
    label: z.string().describe("Ex. « 1 paire », « Lot de 2 »"),
    discountPercent: z.number().describe("Remise réelle appliquée au prix, entre 0 et 30, 0 pour l'unité"),
    badge: z.string().describe("Ex. « Populaire », « Meilleure offre », ou chaîne vide"),
  })).describe("1 à 3 offres par quantité, la première est toujours 1 unité à 0 %. Cohérent avec les offres de la stratégie."),
});

export const VisualSchema = z.object({
  productLook: z.string().describe("Description visuelle précise du produit EN ANGLAIS (forme, matière, couleurs, emballage) pour des photos cohérentes"),
  scene: z.string().describe("Univers photo EN ANGLAIS : décor, surfaces, lumière, ambiance, sans aucune personne"),
});

export const HomeBaseSchema = z.object({
    heroTitle: z.string(),
    heroSubtitle: z.string(),
    ctaLabel: z.string(),
    benefits: z.array(z.object({ title: z.string(), text: z.string() })),
    socialProofIdea: z.string().describe("Idée de preuve sociale à collecter (pas d'avis inventés)"),
  });

export const ProductBaseSchema = z.object({
    title: z.string(),
    subtitle: z.string(),
    price: z.string().describe("Prix conseillé, nombre décimal sans devise, ex. 29.90"),
    compareAtPrice: z.string().describe("Prix barré conseillé, ou chaîne vide"),
    descriptionHtml: z.string().describe("Description produit en HTML simple (p, ul, li, strong, h3)"),
    bulletPoints: z.array(z.string()),
    seoTitle: z.string(),
    seoDescription: z.string(),
    tags: z.array(z.string()),
  });

export const StorePlanSchema = z.object({
  brand: z.object({
    name: z.string(),
    tagline: z.string(),
    tone: z.string(),
    colors: z.object({
      primary: z.string().describe("Couleur hex, ex. #1a1a1a"),
      accent: z.string().describe("Couleur hex"),
      background: z.string().describe("Couleur hex"),
    }),
  }),
  strategy: z.object({
    market: z.string().describe("Marché cible et persona principal"),
    promise: z.string().describe("Promesse principale de la marque"),
    offers: z.array(z.string()).describe("Offres commerciales (bundles, remises, garanties)"),
    objections: z
      .array(z.object({ objection: z.string(), answer: z.string() }))
      .describe("Objections d'achat et réponses"),
  }),
  homepage: HomeBaseSchema.merge(RichHomeSchema.partial()),
  product: ProductBaseSchema.merge(RichProductSchema.partial()),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })),
  aboutPage: z.object({ title: z.string(), bodyHtml: z.string() }),
  visual: VisualSchema.optional(),
});

export type StorePlan = z.infer<typeof StorePlanSchema>;

export const GenerateRequestSchema = z.object({
  brief: z.string().trim().min(10, "Décris ton projet en quelques phrases.").max(4000),
  productUrl: z.string().trim().url().optional().or(z.literal("")),
  language: z.string().trim().min(2).max(40).default("français"),
});
