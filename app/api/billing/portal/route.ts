import { requireUser } from "@/lib/server/auth";
import { billingFor } from "@/lib/server/billing";
import { HttpError, json, route } from "@/lib/server/http";

// Factures : elles sont dans l'admin Shopify du marchand (Paramètres → Facturation).
export const POST = route(async () => {
  const user = await requireUser();
  const { billingUrl } = await billingFor(user);
  if (!billingUrl) throw new HttpError(404, "not_found", "Aucun abonnement Shopify sur ce compte.");
  return json({ url: billingUrl });
});
