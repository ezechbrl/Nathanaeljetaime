import { z } from "zod";
import { cookies } from "next/headers";
import { env } from "@/lib/server/env";
import { sendEmail } from "@/lib/server/email";
import { body, clientIp, HttpError, noContent, route } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/quota";
import { db } from "@/lib/server/supabase";
import { site } from "@/lib/site";

// Connexion par e-mail sans mot de passe : on crée le compte s'il n'existe pas, puis on envoie
// nous-mêmes (Resend) un lien à usage unique valable une heure. Le lien ouvre /api/auth/email/verify.
export const POST = route(async (req) => {
  await rateLimit(`email-link:${clientIp(req)}`, 5, 3600);
  const input = await body(req, z.object({ email: z.string().trim().toLowerCase().email("Adresse e-mail invalide."), next: z.string().optional(), shop: z.string().trim().toLowerCase().regex(/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/, "Adresse de boutique invalide.").optional() }));
  await rateLimit(`email-link-to:${input.email}`, 4, 3600);
  const next = input.next?.startsWith("/") && !input.next.startsWith("//") ? input.next : "/app";
  const ref = (await cookies()).get("ref")?.value;

  // Nouveau compte : e-mail confirmé d'office (le clic sur le lien prouve qu'il est à la personne).
  const created = await db().auth.admin.createUser({ email: input.email, email_confirm: true, user_metadata: ref ? { ref } : {} });
  if (created.error && !/already|registered|exists/i.test(created.error.message)) {
    console.error("Création du compte", created.error.message);
    throw new HttpError(400, "invalid_input", "Impossible de créer le compte avec cette adresse.");
  }

  const { data, error } = await db().auth.admin.generateLink({ type: "magiclink", email: input.email });
  const hash = data?.properties?.hashed_token;
  if (error || !hash) {
    console.error("Lien de connexion", error?.message);
    throw new HttpError(502, "upstream_error", "Le lien n'a pas pu être créé. Réessaie dans un instant.");
  }
  const link = `${env.appUrl()}/api/auth/email/verify?token=${encodeURIComponent(hash)}&next=${encodeURIComponent(next)}${input.shop ? `&shop=${encodeURIComponent(input.shop)}` : ""}`;
  const text = `Bonjour,\n\nClique sur ce lien pour te connecter à ${site.name} (valable une heure) :\n${link}\n\nSi tu n'as rien demandé, ignore simplement ce message.\n\nL'équipe ${site.name}`;
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#111">
<p>Bonjour,</p>
<p>Clique sur le bouton pour te connecter à ${site.name} (lien valable une heure) :</p>
<p><a href="${link}" style="display:inline-block;background:#10b981;color:#04221a;font-weight:bold;text-decoration:none;padding:12px 22px;border-radius:999px">Me connecter</a></p>
<p style="color:#666;font-size:13px">Si tu n'as rien demandé, ignore simplement ce message.</p>
<p>L'équipe ${site.name}</p></div>`;
  const sent = await sendEmail(input.email, `Ton lien de connexion ${site.name}`, text, undefined, html);
  if (!sent) throw new HttpError(502, "upstream_error", "L'e-mail n'a pas pu partir. Réessaie dans un instant.");
  return noContent();
});
