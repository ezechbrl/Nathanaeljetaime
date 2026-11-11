import { NextResponse } from "next/server";
import { env } from "@/lib/server/env";
import { route } from "@/lib/server/http";
import { afterEmailLogin } from "@/lib/server/login";
import { authClient } from "@/lib/server/supabase";

// Clic sur le lien reçu par e-mail : on ouvre la session puis on reprend là où la personne en était.
export const GET = route(async (req) => {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? "";
  const nextParam = url.searchParams.get("next") ?? "/app";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/app";
  const app = env.appUrl();
  if (!token) return NextResponse.redirect(`${app}/connexion?error=lien`);
  const supa = await authClient();
  const { error } = await supa.auth.verifyOtp({ type: "magiclink", token_hash: token });
  if (error) return NextResponse.redirect(`${app}/connexion?error=lien`);
  await afterEmailLogin(req.headers.get("cookie"), url.searchParams.get("shop"));
  return NextResponse.redirect(`${app}${next}`);
});
