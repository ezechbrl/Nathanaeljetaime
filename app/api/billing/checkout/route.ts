import { z } from "zod";
import { requireUser } from "@/lib/server/auth";
import { checkoutUrl } from "@/lib/server/billing";
import { body, json, route } from "@/lib/server/http";
import { db } from "@/lib/server/supabase";

// Renvoie la page de paiement Shopify pour l'offre choisie (Starter ou Pro, au mois ou à l'année).
export const POST = route(async (req) => {
  const user = await requireUser();
  const { plan, interval } = await body(req, z.object({ plan: z.enum(["pro", "agency"]), interval: z.enum(["month", "year"]) }));
  const url = await checkoutUrl(user, plan, interval);
  // Entonnoir du tableau de bord : la personne a ouvert la page de paiement Shopify.
  await db().from("revenue_events").insert({ user_id: user.id, kind: "checkout", plan }).then(() => {}, () => {});
  return json({ url });
});
