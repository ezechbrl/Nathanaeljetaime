// Nom et coordonnées de la marque : change-les ici, ils sont repris partout.
export const site = {
  name: "Vitrio",
  description: "Ta boutique Shopify prête à vendre en 10 minutes, pas en 3 semaines : Vitrio étudie ton marché, écrit, illustre et met en ligne ta boutique, puis la fait progresser chaque jour.",
  email: "bonjour@vitrio.ai",
  whatsapp: "", // ex. "33600000000" pour afficher le lien WhatsApp
  legalEntity: "Vitrio SAS (à compléter)",
  // Lien pour ouvrir une boutique Shopify. Mets ton lien d'affilié Shopify dans NEXT_PUBLIC_SHOPIFY_REFERRAL_URL pour toucher une commission.
  shopifySignupUrl: process.env.NEXT_PUBLIC_SHOPIFY_REFERRAL_URL || "https://www.shopify.com/fr/essai-gratuit",
  shopifyReferral: Boolean(process.env.NEXT_PUBLIC_SHOPIFY_REFERRAL_URL),
};
