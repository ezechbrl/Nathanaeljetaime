import { requireUser } from "@/lib/server/auth";
import { portalUrl } from "@/lib/server/billing";
import { json, route } from "@/lib/server/http";

// Espace client Stripe : carte bancaire, factures, résiliation.
export const POST = route(async () => {
  const user = await requireUser();
  return json({ url: await portalUrl(user) });
});
