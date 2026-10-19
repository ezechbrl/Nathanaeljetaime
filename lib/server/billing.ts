import "server-only";
import { HttpError } from "./http";

// Abonnements payés par carte avec Stripe (Checkout + portail client). Voir lib/server/stripe.ts.
export { billingFor } from "./stripe";

export function billingConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_STARTER_MONTH && process.env.STRIPE_LAUNCH_COUPON);
}

export function assertBillingConfigured() {
  if (!billingConfigured()) throw new HttpError(503, "not_configured", "Le paiement en ligne arrive très bientôt. Écris-nous pour t'abonner dès maintenant.");
}
