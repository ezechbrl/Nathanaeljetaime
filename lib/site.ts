// Nom et coordonnées de la marque : change-les ici, ils sont repris partout.
export const site = {
  name: "Vigenia",
  description: "Ta boutique Shopify prête à vendre en 10 minutes, pas en 3 semaines : Vigenia étudie ton marché, écrit les textes, crée les photos et le design de ta boutique, à installer dans ton Shopify en 2 étapes guidées.",
  email: "contact@vigenia.com",
  whatsapp: "", // ex. "33600000000" pour afficher le lien WhatsApp
  legalEntity: "Vigenia (à compléter)",
  // Lien pour ouvrir une boutique Shopify : lien d'affilié Shopify (impact.com), commission sur chaque boutique payante.
  // NEXT_PUBLIC_SHOPIFY_REFERRAL_URL permet de le remplacer sans toucher au code.
  shopifySignupUrl: process.env.NEXT_PUBLIC_SHOPIFY_REFERRAL_URL || "https://shopify.pxf.io/m43koq",
  shopifyReferral: true,
  // Offre de lancement Shopify en cours (à mettre à jour si Shopify la change).
  shopifyOffer: "1 €/mois pendant 3 mois",
};
