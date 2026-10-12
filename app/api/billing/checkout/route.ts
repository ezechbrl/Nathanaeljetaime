import { z } from "zod";
import { requireUser } from "@/lib/server/auth";
import { body, HttpError, json, route } from "@/lib/server/http";
import { checkoutUrl } from "@/lib/server/stripe";

export const POST = route(async (req) => {
  const user = await requireUser();
  if (!process.env.STRIPE_SECRET_KEY) throw new HttpError(503, "not_configured", "Le paiement en ligne arrive très bientôt. Écris-nous pour passer à Pro dès maintenant.");
  const { plan, interval } = await body(req, z.object({ plan: z.enum(["pro", "agency"]), interval: z.enum(["month", "year"]) }));
  return json({ url: await checkoutUrl(user, plan, interval) });
});
