import { requireUser } from "@/lib/server/auth";
import { assertBillingConfigured } from "@/lib/server/billing";
import { json, route } from "@/lib/server/http";
import { portalUrl } from "@/lib/server/stripe";

// Portail Stripe : changer d'offre ou de carte, télécharger les factures, arrêter l'abonnement.
export const POST = route(async () => {
  const user = await requireUser();
  assertBillingConfigured();
  return json({ url: await portalUrl(user) });
});
