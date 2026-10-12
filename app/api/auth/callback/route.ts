import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { env } from "@/lib/server/env";
import { route } from "@/lib/server/http";
import { authClient, db } from "@/lib/server/supabase";

// Retour de Google, des liens de confirmation d'e-mail et de réinitialisation du mot de passe.
export const GET = route(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/app";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/app";
  if (!code) return NextResponse.redirect(`${env.appUrl()}/connexion?error=lien`);
  const supa = await authClient();
  const { error } = await supa.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(`${env.appUrl()}/connexion?error=lien`);
  const user = await requireUser();
  const ref = url.searchParams.get("ref") ?? req.headers.get("cookie")?.match(/(?:^|; )ref=([^;]+)/)?.[1];
  if (ref && !user.referred_by && /^[a-z0-9-]{2,40}$/i.test(ref)) {
    await db().from("users").update({ referred_by: ref }).eq("id", user.id);
    await db().from("affiliate_events").insert({ code: ref, kind: "signup", referred_user_id: user.id });
  }
  // La boutique Shopify est obligatoire : sans connexion active, on passe par l'étape « Connecter Shopify ».
  const { count } = await db().from("shop_connections").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "active");
  if (!count) return NextResponse.redirect(`${env.appUrl()}/connecter-shopify?next=${encodeURIComponent(safeNext)}`);
  return NextResponse.redirect(`${env.appUrl()}${safeNext}`);
});
