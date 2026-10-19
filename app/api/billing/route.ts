import { requireUser } from "@/lib/server/auth";
import { billingFor, syncShopifySubscription } from "@/lib/server/billing";
import { json, route } from "@/lib/server/http";
import { getUsage } from "@/lib/server/quota";

export const GET = route(async () => {
  let user = await requireUser();
  // L'abonnement est relu chez Shopify à chaque ouverture de la page Abonnement : le retour de la page
  // d'offres Shopify n'arrive pas toujours jusqu'à Vitrio (ex. ouverture depuis l'admin Shopify).
  const synced = await syncShopifySubscription(user.id).then(() => true).catch((e) => { console.error("Abonnement Shopify", e); return false; });
  if (synced) user = await requireUser();
  const [{ subscription, invoices }, usage] = await Promise.all([billingFor(user), getUsage(user.id, user.plan)]);
  return json({ subscription, usage, invoices });
});
