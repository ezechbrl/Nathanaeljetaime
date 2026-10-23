import { requireUser } from "@/lib/server/auth";
import { HttpError, json, route } from "@/lib/server/http";
import { notifyOwner, saleMessage } from "@/lib/server/notify";

// Envoie une fausse « nouvelle vente » sur le téléphone du fondateur (OWNER_EMAIL), pour tester le son.
export const GET = route(async () => {
  const user = await requireUser();
  const owner = process.env.OWNER_EMAIL?.trim().toLowerCase();
  if (!owner || user.email.toLowerCase() !== owner) throw new HttpError(403, "forbidden", "Réservé au fondateur de Vigenia.");
  await notifyOwner("💰 Nouvelle vente Vigenia (test)", saleMessage("client-test@gmail.com", "Starter", "78 €/mois"));
  return json({ ok: true, sent: Boolean(process.env.NTFY_TOPIC || process.env.PUSHOVER_USER_KEY) });
});
