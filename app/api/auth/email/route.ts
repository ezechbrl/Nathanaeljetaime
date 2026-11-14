import { z } from "zod";
import { cookies } from "next/headers";
import { env } from "@/lib/server/env";
import { sendEmail } from "@/lib/server/email";
import { body, clientIp, HttpError, json, route } from "@/lib/server/http";
import { afterEmailLogin } from "@/lib/server/login";
import { rateLimit } from "@/lib/server/quota";
import { authClient, db } from "@/lib/server/supabase";
import { site } from "@/lib/site";

// Connexion par e-mail sans mot de passe.
// - Nouvelle adresse : le compte est créé et la personne est connectée tout de suite, sans code.
// - Adresse déjà inscrite : on envoie un code (et un lien) pour prouver que c'est bien elle,
//   sinon n'importe qui pourrait ouvrir le compte d'un autre en tapant son e-mail.
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
  const code = data?.properties?.email_otp;
  if (error || !hash) {
    console.error("Lien de connexion", error?.message);
    throw new HttpError(502, "upstream_error", "Le lien n'a pas pu être créé. Réessaie dans un instant.");
  }
  if (!created.error) {
    const { error: loginError } = await (await authClient()).auth.verifyOtp({ token_hash: hash, type: "magiclink" });
    if (!loginError) {
      await afterEmailLogin(req.headers.get("cookie"), input.shop);
      return json({ loggedIn: true });
    }
    console.error("Connexion directe", loginError.message); // repli : code par e-mail
  }
  const link = `${env.appUrl()}/api/auth/email/verify?token=${encodeURIComponent(hash)}&next=${encodeURIComponent(next)}${input.shop ? `&shop=${encodeURIComponent(input.shop)}` : ""}`;
  const text = `Bonjour,\n\nClique sur ce lien pour te connecter à ${site.name} (valable une heure) :\n${link}\n${code ? `\nOu tape ce code sur ${site.name} : ${code}\n` : ""}\nSi tu n'as rien demandé, ignore simplement ce message.\n\nL'équipe ${site.name}`;
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#111">
<p>Bonjour,</p>
<p>Clique sur le bouton pour te connecter à ${site.name} (lien valable une heure) :</p>
<p><a href="${link}" style="display:inline-block;background:#10b981;color:#04221a;font-weight:bold;text-decoration:none;padding:12px 22px;border-radius:999px">Me connecter</a></p>
${code ? `<p>Tu lis cet e-mail sur ton téléphone ? Tape plutôt ce code sur ${site.name}, sur ton ordinateur :</p>
<p style="font-size:30px;font-weight:bold;letter-spacing:6px;margin:8px 0">${code}</p>` : ""}
<p style="color:#666;font-size:13px">Si tu n'as rien demandé, ignore simplement ce message.</p>
<p>L'équipe ${site.name}</p></div>`;
  const sent = await sendEmail(input.email, code ? `Ton code ${site.name} : ${code}` : `Ton lien de connexion ${site.name}`, text, undefined, html);
  if (!sent) throw new HttpError(502, "upstream_error", "L'e-mail n'a pas pu partir. Réessaie dans un instant.");
  return json({ loggedIn: false });
});
