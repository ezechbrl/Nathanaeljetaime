import { requireUser } from "@/lib/server/auth";
import { billingFor, launchOfferEndsAt, syncFromShopify } from "@/lib/server/billing";
import { json, route } from "@/lib/server/http";
import { getUsage } from "@/lib/server/quota";

export const GET = route(async (req) => {
  let user = await requireUser();
  // ?sync=1 : on relit l'abonnement chez Shopify (retour du paiement, bouton « Actualiser »).
  if (new URL(req.url).searchParams.get("sync")) {
    await syncFromShopify(user.id).catch((e) => console.error("Abonnement Shopify", e));
    user = await requireUser();
  }
  const [{ subscription, invoices, billingUrl }, usage, offerEndsAt] = await Promise.all([billingFor(user), getUsage(user.id, user.plan), launchOfferEndsAt(user)]);
  return json({ subscription, usage, invoices, offerEndsAt, billingUrl });
});
