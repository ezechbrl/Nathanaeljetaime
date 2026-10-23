import "server-only";

// Notifications sur le téléphone du fondateur (nouvel abonné, désabonnement).
// - Pushover (PUSHOVER_APP_TOKEN + PUSHOVER_USER_KEY) : son « caisse enregistreuse » ;
// - ntfy (NTFY_TOPIC) : gratuit, le son se choisit dans l'app ntfy.
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
  const results = await Promise.allSettled(sends);
  for (const r of results) if (r.status === "rejected") console.warn("Notification non envoyée :", r.reason);
}

// Ex. « marie@gmail.com vient de s'abonner à Starter (39 €/mois). »
export const saleMessage = (who: string, planName: string, price: string) => `${who} vient de s'abonner à ${planName} (${price}).`;
