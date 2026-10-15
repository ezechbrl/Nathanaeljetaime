// Interrupteur de lancement : "waitlist" (liste d'attente, par défaut) ou "open" (inscriptions ouvertes).
// Dans Vercel : NEXT_PUBLIC_LAUNCH_MODE=open le jour du lancement, puis redéployer.
export const LAUNCH_MODE = (process.env.NEXT_PUBLIC_LAUNCH_MODE === "open" ? "open" : "waitlist") as "open" | "waitlist";
export const isWaitlist = LAUNCH_MODE === "waitlist";

export const CTA = isWaitlist
  ? { main: "Réserver ma place", short: "Réserver ma place", eyebrow: "Ouverture très bientôt · réserve ta place" }
  : { main: "Créer ma boutique", short: "Créer ma boutique", eyebrow: "Nouveau · ta boutique Shopify prête en quelques minutes" };
