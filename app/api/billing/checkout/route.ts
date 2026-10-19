import { z } from "zod";
import { requireUser } from "@/lib/server/auth";
import { assertBillingConfigured } from "@/lib/server/billing";
import { body, json, route } from "@/lib/server/http";
import { checkoutUrl } from "@/lib/server/stripe";

// Renvoie la page de paiement Stripe pour l'offre choisie (Starter ou Pro, au mois ou à l'année).
export const POST = route(async (req) => {
  const user = await requireUser();
  const { plan, interval } = await body(req, z.object({ plan: z.enum(["pro", "agency"]), interval: z.enum(["month", "year"]) }));
  assertBillingConfigured();
  return json({ url: await checkoutUrl(user, plan, interval) });
});
