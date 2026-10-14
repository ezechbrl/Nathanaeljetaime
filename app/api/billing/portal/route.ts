import { requireUser } from "@/lib/server/auth";
import { planSelectionUrl } from "@/lib/server/billing";
import { json, route } from "@/lib/server/http";

// Changer d'offre ou revenir à Découverte se fait aussi sur la page d'offres Shopify.
export const POST = route(async () => {
  const user = await requireUser();
  return json({ url: await planSelectionUrl(user) });
});
