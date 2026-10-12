import { requireUser } from "@/lib/server/auth";
import { HttpError, json, route } from "@/lib/server/http";
import { portalUrl } from "@/lib/server/stripe";

export const POST = route(async () => {
  const user = await requireUser();
  if (!process.env.STRIPE_SECRET_KEY) throw new HttpError(503, "not_configured", "Le paiement en ligne arrive très bientôt.");
  return json({ url: await portalUrl(user) });
});
