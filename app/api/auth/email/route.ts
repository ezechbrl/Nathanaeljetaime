import { z } from "zod";
import { cookies } from "next/headers";
import { env } from "@/lib/server/env";
import { body, clientIp, HttpError, noContent, route } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/quota";
import { authClient } from "@/lib/server/supabase";

// Connexion par e-mail sans mot de passe : Supabase envoie un lien magique.
// Le lien revient sur /api/auth/callback, qui exige ensuite de relier une boutique Shopify.
export const POST = route(async (req) => {
  await rateLimit(`email-link:${clientIp(req)}`, 5, 3600);
  const input = await body(req, z.object({ email: z.string().trim().toLowerCase().email("Adresse e-mail invalide."), next: z.string().optional() }));
  const next = input.next?.startsWith("/") && !input.next.startsWith("//") ? input.next : "/app";
  const ref = (await cookies()).get("ref")?.value;
  const supa = await authClient();
  const { error } = await supa.auth.signInWithOtp({
    email: input.email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${env.appUrl()}/api/auth/callback?next=${encodeURIComponent(next)}`,
      data: ref ? { ref } : undefined,
    },
  });
  if (error) {
    if (/rate|limit/i.test(error.message)) throw new HttpError(429, "rate_limited", "Le lien ne peut pas partir pour le moment. Connecte-toi avec Shopify ou Google en attendant.");
    throw new HttpError(400, "invalid_input", "Impossible d'envoyer le lien à cette adresse.");
  }
  return noContent();
});
