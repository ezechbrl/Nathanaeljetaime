import { requireUser } from "@/lib/server/auth";
import { cancelSubscriptionNow } from "@/lib/server/billing";
import { noContent, route } from "@/lib/server/http";

// Arrête l'abonnement tout de suite (Shopify cesse de le facturer).
export const POST = route(async () => {
  const user = await requireUser();
  await cancelSubscriptionNow(user.id);
  return noContent();
});
