import { after } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/server/auth";
import { checkoutUrl } from "@/lib/server/billing";
import { body, json, noContent, route } from "@/lib/server/http";
import { db } from "@/lib/server/supabase";

// Entonnoir du tableau de bord : la personne a ouvert la page de paiement (enregistré après la réponse).
const logOpened = (userId: string, plan: string) =>
  after(async () => {
    await db().from("revenue_events").insert({ user_id: userId, kind: "checkout", plan }).then(() => {}, () => {});
  });

// Renvoie la page de paiement Stripe pour l'offre choisie (Starter ou Pro, au mois ou à l'année).
// prefetch : préparée dès le survol du bouton, pour que le clic ouvre Stripe tout de suite (pas comptée
// dans l'entonnoir tant que la personne n'a pas cliqué).
export const POST = route(async (req) => {
  const user = await requireUser();
  const input = await body(req, z.object({ plan: z.enum(["pro", "agency"]), interval: z.enum(["month", "year"]), prefetch: z.boolean().optional(), opened: z.boolean().optional() }));
  if (input.opened) {
    logOpened(user.id, input.plan);
    return noContent();
  }
  const url = await checkoutUrl(user, input.plan, input.interval, req.headers.get("cookie"));
  if (!input.prefetch) logOpened(user.id, input.plan);
  return json({ url });
});
