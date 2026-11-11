import { z } from "zod";
import { body, clientIp, HttpError, noContent, route } from "@/lib/server/http";
import { afterEmailLogin } from "@/lib/server/login";
import { rateLimit } from "@/lib/server/quota";
import { authClient } from "@/lib/server/supabase";

// Connexion avec le code à 6 chiffres reçu par e-mail : pratique quand l'e-mail est lu sur le téléphone
// et que la personne veut se connecter sur l'ordinateur.
export const POST = route(async (req) => {
  await rateLimit(`email-code:${clientIp(req)}`, 20, 3600);
  const input = await body(req, z.object({
    email: z.string().trim().toLowerCase().email("Adresse e-mail invalide."),
    code: z.string().trim().regex(/^\d{6,10}$/, "Le code contient 6 chiffres."),
    shop: z.string().optional(),
  }));
  await rateLimit(`email-code-to:${input.email}`, 8, 3600);
  const supa = await authClient();
  let { error } = await supa.auth.verifyOtp({ email: input.email, token: input.code, type: "email" });
  if (error) ({ error } = await supa.auth.verifyOtp({ email: input.email, token: input.code, type: "magiclink" }));
  if (error) throw new HttpError(400, "invalid_input", "Code incorrect ou expiré. Vérifie le dernier e-mail reçu, ou demandes-en un nouveau.", "code");
  await afterEmailLogin(req.headers.get("cookie"), input.shop);
  return noContent();
});
