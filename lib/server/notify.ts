import "server-only";
import webpush from "web-push";
import { db } from "./supabase";

// Notifications sur le téléphone du fondateur (nouvel abonné, désabonnement).
// - Pushover (PUSHOVER_APP_TOKEN + PUSHOVER_USER_KEY) : son « caisse enregistreuse » ;
// - ntfy (NTFY_TOPIC) : gratuit, le son se choisit dans l'app ntfy ;
// - l'app « Vigenia Ventes » sur l'écran d'accueil (push web, VAPID_PRIVATE_KEY + NEXT_PUBLIC_VAPID_PUBLIC_KEY), avec la pastille rouge.
// Sans configuration, rien n'est envoyé. Une notification ratée ne bloque jamais le reste.
export async function notifyOwner(title: string, message: string) {
  const sends: Promise<unknown>[] = [];
  const token = process.env.PUSHOVER_APP_TOKEN;
  const user = process.env.PUSHOVER_USER_KEY;
  if (token && user) {
    sends.push(fetch("https://api.pushover.net/1/messages.json", {
      method: "POST",
      signal: AbortSignal.timeout(8000),
      body: new URLSearchParams({ token, user, title, message, sound: process.env.PUSHOVER_SOUND || "cashregister", priority: "1" }),
    }));
  }
  const topic = process.env.NTFY_TOPIC;
  if (topic) {
    sends.push(fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`, {
      method: "POST",
      signal: AbortSignal.timeout(8000),
      headers: { Title: `=?UTF-8?B?${Buffer.from(title).toString("base64")}?=`, Priority: "high", "Content-Type": "text/plain; charset=utf-8" }, // l'emoji est déjà dans le titre
      body: message,
    }));
  }
  sends.push(webPush(title, message));
  const results = await Promise.allSettled(sends);
  for (const r of results) if (r.status === "rejected") console.warn("Notification non envoyée :", r.reason);
}

// Ex. « marie@gmail.com vient de s'abonner à Starter (39 €/mois). »
export const saleMessage = (who: string, planName: string, price: string) => `${who} vient de s'abonner à ${planName} (${price}).`;

// Push web vers chaque téléphone abonné ; les abonnements expirés (404/410) sont supprimés.
async function webPush(title: string, body: string) {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return;
  webpush.setVapidDetails(`mailto:${process.env.OWNER_EMAIL ?? "contact@vigenia.com"}`, pub, priv);
  const { data } = await db().from("push_subscriptions").select("endpoint, keys");
  await Promise.all((data ?? []).map(async (s: { endpoint: string; keys: { p256dh: string; auth: string } }) => {
    try {
      await webpush.sendNotification(s, JSON.stringify({ title, body }), { TTL: 86_400, urgency: "high" });
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) await db().from("push_subscriptions").delete().eq("endpoint", s.endpoint);
      else throw e;
    }
  }));
}
