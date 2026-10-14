import { requireUser } from "@/lib/server/auth";
import { planSelectionUrl } from "@/lib/server/billing";
import { json, route } from "@/lib/server/http";

// Renvoie la page Shopify où le marchand choisit son offre (Pro, mensuel ou annuel).
export const POST = route(async () => {
  const user = await requireUser();
  return json({ url: await planSelectionUrl(user) });
});
