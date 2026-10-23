import { json, route } from "@/lib/server/http";
import { notifyOwner, saleMessage } from "@/lib/server/notify";
import { requireOwner } from "@/lib/server/owner";

export const maxDuration = 60;

// Envoie une fausse « nouvelle vente » sur le téléphone du fondateur (OWNER_EMAIL), pour tester le son
// et la pastille. ?delay=10 laisse le temps de fermer l'app avant qu'elle arrive.
async function send(req: Request) {
  await requireOwner();
  const delay = Math.min(30, Math.max(0, Number(new URL(req.url).searchParams.get("delay")) || 0));
  if (delay) await new Promise((r) => setTimeout(r, delay * 1000));
  await notifyOwner("💰 Nouvelle vente Vigenia (test)", saleMessage("client-test@gmail.com", "Starter", "78 €/mois"));
  return json({ ok: true, sent: Boolean(process.env.NTFY_TOPIC || process.env.PUSHOVER_USER_KEY || process.env.VAPID_PRIVATE_KEY) });
}

export const GET = route(send);
export const POST = route(send);
