import { requireUser } from "@/lib/server/auth";
import { billingFor, syncShopifySubscription } from "@/lib/server/billing";
import { json, route } from "@/lib/server/http";
import { getUsage } from "@/lib/server/quota";

export const GET = route(async (req) => {
  const user = await requireUser();
  // Au retour de la page d'offres Shopify, on relit l'abonnement tout de suite.
  if (new URL(req.url).searchParams.get("sync") === "1") await syncShopifySubscription(user.id).catch((e) => console.error("Abonnement Shopify", e));
  const [{ subscription, invoices }, usage] = await Promise.all([billingFor(user), getUsage(user.id, user.plan)]);
  return json({ subscription, usage, invoices });
});
