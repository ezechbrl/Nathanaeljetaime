import "server-only";
import { env } from "./env";
import { site } from "@/lib/site";

// Envoi d'e-mail via l'API Resend (si RESEND_API_KEY est définie).
// Renvoie l'identifiant du mail chez Resend (pour suivre s'il a été ouvert), ou false en cas d'échec.
export async function sendEmail(to: string, subject: string, text: string, replyTo?: string, html?: string): Promise<string | false> {
  const key = env.resendKey();
  if (!key) {
    console.warn("RESEND_API_KEY absente : e-mail non envoyé —", subject);
    return false;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ from: `${site.name} <${site.email}>`, to, subject, text, ...(html && { html }), ...(replyTo && { reply_to: replyTo }) }),
  });
  if (!res.ok) {
    console.error("Resend", res.status, await res.text());
    return false;
  }
  const out = (await res.json().catch(() => ({}))) as { id?: string };
  return out.id ?? "sent";
}
