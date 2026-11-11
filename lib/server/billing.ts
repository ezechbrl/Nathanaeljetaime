import "server-only";

// Abonnements payés par carte sur vigenia.com (Stripe). Voir lib/server/stripe-billing.ts.
// L'ancienne facturation par Shopify (lib/server/shopify-billing.ts) n'est plus utilisée.
export { billingFor, cancelSubscriptionNow, checkoutUrl, launchOffer, launchOfferEndsAt, portalUrl, syncFromStripe } from "./stripe-billing";
