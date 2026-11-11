import "server-only";
import { requireUser } from "./auth";
import { db } from "./supabase";

const SHOP = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;

// Après une connexion réussie (lien ou code reçu par e-mail) : boutique Shopify tapée à l'inscription
// et parrainage (code gardé dans le cookie « ref » depuis le lien d'affiliation).
export async function afterEmailLogin(cookieHeader: string | null, shop?: string | null) {
  const user = await requireUser();
  const s = shop?.toLowerCase();
  if (s && SHOP.test(s)) await db().from("users").update({ shop_domain: s }).eq("id", user.id);
  const ref = cookieHeader?.match(/(?:^|; )ref=([^;]+)/)?.[1];
  if (ref && !user.referred_by && /^[a-z0-9-]{2,40}$/i.test(ref)) {
    await db().from("users").update({ referred_by: ref }).eq("id", user.id);
    await db().from("affiliate_events").insert({ code: ref, kind: "signup", referred_user_id: user.id });
  }
  return user;
}
