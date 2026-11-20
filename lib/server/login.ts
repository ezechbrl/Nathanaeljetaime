import "server-only";
import { cookies } from "next/headers";
import { requireUser } from "./auth";
import { hmacHex } from "./crypto";
import { env } from "./env";
import { db } from "./supabase";

const SHOP = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;

// Après une connexion réussie (lien ou code reçu par e-mail) : boutique Shopify tapée à l'inscription
// et parrainage (code gardé dans le cookie « ref » depuis le lien d'affiliation).
export async function afterEmailLogin(cookieHeader: string | null, shop?: string | null) {
  const user = await requireUser();
  await rememberDevice(user.id);
  const s = shop?.toLowerCase();
  if (s && SHOP.test(s)) await db().from("users").update({ shop_domain: s }).eq("id", user.id);
  const ref = cookieHeader?.match(/(?:^|; )ref=([^;]+)/)?.[1];
  if (ref && !user.referred_by && /^[a-z0-9-]{2,40}$/i.test(ref)) {
    await db().from("users").update({ referred_by: ref }).eq("id", user.id);
    await db().from("affiliate_events").insert({ code: ref, kind: "signup", referred_user_id: user.id });
  }
  return user;
}

// Appareil déjà connu : après une connexion réussie, on garde une preuve signée (cookie, 1 an) pour
// ce compte. La prochaine fois, sur ce même appareil, l'e-mail suffit : pas de code à recevoir.
const DEVICE_COOKIE = "vg_dev";
const deviceToken = (userId: string) => hmacHex(env.encryptionKey(), `device:${userId}`).slice(0, 32);

export async function rememberDevice(userId: string) {
  const jar = await cookies();
  const t = deviceToken(userId);
  const list = (jar.get(DEVICE_COOKIE)?.value ?? "").split(".").filter((x) => /^[a-f0-9]{32}$/.test(x) && x !== t);
  jar.set(DEVICE_COOKIE, [t, ...list].slice(0, 4).join("."), { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 365 * 86_400 });
}

export async function isKnownDevice(userId: string) {
  const v = (await cookies()).get(DEVICE_COOKIE)?.value ?? "";
  return v.split(".").includes(deviceToken(userId));
}
