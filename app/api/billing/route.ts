import { requireUser } from "@/lib/server/auth";
import { billingFor, launchOffer, syncFromStripe } from "@/lib/server/billing";
import { json, route } from "@/lib/server/http";
import { getUsage } from "@/lib/server/quota";

export const GET = route(async (req) => {
  let user = await requireUser();
  // ?sync=1 : on relit l'abonnement chez Stripe (retour du paiement, bouton « Actualiser »).
  if (new URL(req.url).searchParams.get("sync")) {
    await syncFromStripe(user.id).catch((e) => console.error("Abonnement Stripe", e));
    user = await requireUser();
  }
  const [{ subscription, invoices, billingUrl }, usage, offer] = await Promise.all([billingFor(user), getUsage(user.id, user.plan), launchOffer(user, req.headers.get("cookie"))]);
  return json({ subscription, usage, invoices, offerEndsAt: offer.endsAt, offerKind: offer.kind, billingUrl });
});
