import { after } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/server/auth";
import { checkoutUrl, singleCheckoutUrl } from "@/lib/server/billing";
import { ownedStore } from "@/lib/server/auth";
import { HttpError } from "@/lib/server/http";
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
  const input = await body(req, z.object({ plan: z.enum(["pro", "agency", "single"]), interval: z.enum(["month", "year"]).default("month"), storeId: z.string().uuid().optional(), prefetch: z.boolean().optional(), opened: z.boolean().optional() }));
  if (input.opened) {
    logOpened(user.id, input.plan);
    return noContent();
  }
  // Paiement unique « Ma boutique » : pour une boutique d'aperçu (pas encore débloquée).
  if (input.plan === "single") {
    if (!input.storeId) throw new HttpError(400, "invalid_input", "Choisis d'abord la boutique à débloquer.");
    const store = await ownedStore(user.id, input.storeId);
    if (store.status !== "locked") throw new HttpError(409, "conflict", "Cette boutique est déjà débloquée.");
    const url = await singleCheckoutUrl(user, store.id);
    if (!input.prefetch) logOpened(user.id, "single");
    return json({ url });
  }
  const url = await checkoutUrl(user, input.plan, input.interval, req.headers.get("cookie"));
  if (!input.prefetch) logOpened(user.id, input.plan);
  return json({ url });
});
