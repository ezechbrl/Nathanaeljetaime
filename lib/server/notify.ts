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
      headers: { Title: encodeURIComponent(title), Tags: "moneybag", Priority: "high", "Content-Type": "text/plain; charset=utf-8" },
      body: message,
    }));
  }
  const results = await Promise.allSettled(sends);
  for (const r of results) if (r.status === "rejected") console.warn("Notification non envoyée :", r.reason);
}

const PRICE: Record<string, string> = { month: "31 €/mois", year: "310 €/an" };
export const saleMessage = (shop: string, interval: string | null) => `${shop.replace(/\.myshopify\.com$/, "")} vient de s'abonner à Vitrio Pro${interval ? ` (${PRICE[interval] ?? interval})` : ""}.`;
