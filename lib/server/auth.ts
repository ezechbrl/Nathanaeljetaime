import "server-only";
import { HttpError } from "./http";
import { authClient, db, must } from "./supabase";

export type UserRow = {
  id: string;
  email: string;
  first_name: string;
  avatar_url: string | null;
  plan: "free" | "pro" | "agency";
  stripe_customer_id: string | null;
  referred_by: string | null;
  created_at: string;
};

// Utilisateur connecté (ou erreur 401). Crée sa fiche au premier passage (ex. connexion Google).
export async function requireUser(): Promise<UserRow & { email_verified: boolean }> {
  const supa = await authClient();
  const { data } = await supa.auth.getUser();
  const auth = data.user;
  if (!auth) throw new HttpError(401, "unauthenticated", "Connecte-toi pour continuer.");

  let row = must(await db().from("users").select("*").eq("id", auth.id).maybeSingle()) as UserRow | null;
  if (!row) {
    const meta = auth.user_metadata ?? {};
    row = must(
      await db()
        .from("users")
        .upsert({
          id: auth.id,
          email: auth.email ?? "",
          first_name: meta.first_name ?? meta.full_name?.split(" ")[0] ?? meta.name?.split(" ")[0] ?? "",
          avatar_url: meta.avatar_url ?? null,
          referred_by: meta.ref ?? null,
        })
        .select("*")
        .single(),
    ) as UserRow;
    if (row.referred_by) {
      await db().from("affiliate_events").insert({ code: row.referred_by, kind: "signup", referred_user_id: row.id });
    }
  }
  return { ...row, email_verified: !!auth.email_confirmed_at };
}

// Vérifie qu'une boutique appartient à l'utilisateur et la renvoie.
export async function ownedStore(userId: string, storeId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(storeId)) throw new HttpError(404, "not_found", "Boutique introuvable.");
  const row = must(await db().from("stores").select("*").eq("id", storeId).eq("user_id", userId).maybeSingle());
  if (!row) throw new HttpError(404, "not_found", "Boutique introuvable.");
  return row as StoreRow;
}

export type StoreRow = {
  id: string;
  user_id: string;
  shop_connection_id: string | null;
  name: string;
  niche: string;
  language: string;
  mode: "start" | "link" | "recraft";
  status: "generating" | "ready" | "publishing" | "published" | "failed";
  brief: string;
  source_url: string | null;
  theme: Record<string, unknown>;
  plan: Record<string, unknown> | null;
  shopify: Record<string, unknown>;
  preview_url: string | null;
  live_url: string | null;
  created_at: string;
  updated_at: string;
};
