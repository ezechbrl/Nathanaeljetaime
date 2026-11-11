import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { env } from "@/lib/server/env";
import { route } from "@/lib/server/http";
import { authClient, db } from "@/lib/server/supabase";

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

  // Parrainage : code gardé dans le cookie « ref » depuis le lien d'affiliation.
  const user = await requireUser();
  // Boutique Shopify tapée à l'inscription : sert à ouvrir directement les bonnes pages de son admin.
  const shop = url.searchParams.get("shop")?.toLowerCase();
  if (shop && /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop)) await db().from("users").update({ shop_domain: shop }).eq("id", user.id);
  const ref = req.headers.get("cookie")?.match(/(?:^|; )ref=([^;]+)/)?.[1];
  if (ref && !user.referred_by && /^[a-z0-9-]{2,40}$/i.test(ref)) {
    await db().from("users").update({ referred_by: ref }).eq("id", user.id);
    await db().from("affiliate_events").insert({ code: ref, kind: "signup", referred_user_id: user.id });
  }
  return NextResponse.redirect(`${app}${next}`);
});
