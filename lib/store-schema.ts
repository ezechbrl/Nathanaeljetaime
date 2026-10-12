import { z } from "zod";

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
  homepage: z.object({
    heroTitle: z.string(),
    heroSubtitle: z.string(),
    ctaLabel: z.string(),
    benefits: z.array(z.object({ title: z.string(), text: z.string() })),
    socialProofIdea: z.string().describe("Idée de preuve sociale à collecter (pas d'avis inventés)"),
  }),
  product: z.object({
    title: z.string(),
    subtitle: z.string(),
    price: z.string().describe("Prix conseillé, nombre décimal sans devise, ex. 29.90"),
    compareAtPrice: z.string().describe("Prix barré conseillé, ou chaîne vide"),
    descriptionHtml: z.string().describe("Description produit en HTML simple (p, ul, li, strong, h3)"),
    bulletPoints: z.array(z.string()),
    seoTitle: z.string(),
    seoDescription: z.string(),
    tags: z.array(z.string()),
  }),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })),
  aboutPage: z.object({ title: z.string(), bodyHtml: z.string() }),
});

export type StorePlan = z.infer<typeof StorePlanSchema>;

export const GenerateRequestSchema = z.object({
  brief: z.string().trim().min(10, "Décris ton projet en quelques phrases.").max(4000),
  productUrl: z.string().trim().url().optional().or(z.literal("")),
  language: z.string().trim().min(2).max(40).default("français"),
});
