import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { requireUser } from "./auth";
import { HttpError } from "./http";
import { db, must } from "./supabase";

// Le fondateur de Vigenia : le compte dont l'e-mail est OWNER_EMAIL (variable Vercel).
export const isOwnerEmail = (email: string) => {
  const owner = process.env.OWNER_EMAIL?.trim().toLowerCase();
  return Boolean(owner) && email.toLowerCase() === owner;
};

const hash = (token: string) => createHash("sha256").update(token).digest("hex");

// Accès au tableau de bord : soit la session normale, soit la clé de l'appareil du fondateur (app « Ventes »
// sur son téléphone), pour ne jamais avoir à se reconnecter. Renvoie aussi une clé neuve si besoin.
export async function requireOwner({ issueDevice = false } = {}): Promise<{ id: string; email: string; newDeviceToken?: string }> {
  const device = (await headers()).get("x-owner-device");
  if (device && /^[a-f0-9]{64}$/.test(device)) {
    const row = must(await db().from("owner_devices").select("user_id, users(email)").eq("token_hash", hash(device)).maybeSingle()) as { user_id: string; users: { email: string } | null } | null;
    if (row?.users && isOwnerEmail(row.users.email)) {
      await db().from("owner_devices").update({ last_used_at: new Date().toISOString() }).eq("token_hash", hash(device));
      return { id: row.user_id, email: row.users.email };
    }
  }
  const user = await requireUser();
  if (!isOwnerEmail(user.email)) throw new HttpError(403, "forbidden", "Réservé au fondateur de Vigenia.");
  if (!issueDevice) return { id: user.id, email: user.email };
  // Connecté normalement : on donne une clé à cet appareil pour les prochaines fois.
  const token = randomBytes(32).toString("hex");
  await db().from("owner_devices").insert({ token_hash: hash(token), user_id: user.id });
  return { id: user.id, email: user.email, newDeviceToken: token };
}
