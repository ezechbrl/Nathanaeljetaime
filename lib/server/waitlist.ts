import "server-only";
import type { UserRow } from "./auth";
import { hmacHex, safeEqual } from "./crypto";
import { env } from "./env";
import { db, must } from "./supabase";

// Inscrits de la liste d'attente : reconnus par leur e-mail, ou par le lien signé de l'e-mail de lancement
// (cookie « wl », utile s'ils créent leur compte avec une autre adresse, par exemple celle de leur boutique Shopify).
export const WL_COOKIE = "wl";
const sig = (email: string) => hmacHex(env.encryptionKey(), `waitlist:${email}`).slice(0, 32);
export const waitlistToken = (email: string) => `${Buffer.from(email).toString("base64url")}.${sig(email)}`;

export function emailFromToken(token: string | null | undefined) {
  const [b, s] = (token ?? "").split(".");
  if (!b || !s) return null;
  const email = Buffer.from(b, "base64url").toString();
  return safeEqual(s, sig(email)) ? email : null;
}

const onList = async (email: string | null) =>
  !!email && !!must(await db().from("waitlist").select("email").eq("email", email.trim().toLowerCase()).maybeSingle());

// Vrai si l'utilisateur vient de la liste d'attente (mémorisé sur sa fiche dès la première fois).
export async function isWaitlistMember(user: UserRow, cookie?: string | null) {
  if (user.waitlist_member) return true;
  const token = new RegExp(`(?:^|;\\s*)${WL_COOKIE}=([^;]+)`).exec(cookie ?? "")?.[1];
  const ok = (await onList(user.email)) || (await onList(emailFromToken(token ? decodeURIComponent(token) : null)));
  if (ok) await db().from("users").update({ waitlist_member: true }).eq("id", user.id);
  return ok;
}
