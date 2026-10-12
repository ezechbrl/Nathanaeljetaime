import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { env } from "./env";

// Client lié à la session de l'utilisateur (cookies) : sert uniquement à l'authentification.
export async function authClient() {
  const store = await cookies();
  return createServerClient(env.supabaseUrl(), env.supabaseAnonKey(), {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // appelé depuis un contexte en lecture seule : ignoré
        }
      },
    },
  });
}

let admin: SupabaseClient | null = null;

// Client « service_role » : accès complet à la base, à n'utiliser que côté serveur
// et toujours avec un filtre sur l'utilisateur courant.
export function db(): SupabaseClient {
  admin ??= createClient(env.supabaseUrl(), env.supabaseServiceKey(), { auth: { persistSession: false, autoRefreshToken: false } });
  return admin;
}

// Renvoie les données d'une requête Supabase ou lève l'erreur.
// (Les lignes sont typées par un `as` à l'appel : la base n'a pas de types générés.)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function must<T = any>(res: { data: unknown; error: { message: string } | null }): T {
  if (res.error) throw new Error(`Supabase : ${res.error.message}`);
  return res.data as T;
}
