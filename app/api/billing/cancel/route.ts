import { requireUser } from "@/lib/server/auth";
import { cancelSubscriptionNow } from "@/lib/server/billing";
import { noContent, route } from "@/lib/server/http";

// Arrête l'abonnement à la fin de la période déjà payée (Stripe ne le renouvelle plus).
export const POST = route(async () => {
  const user = await requireUser();
  await cancelSubscriptionNow(user.id);
  return noContent();
});
