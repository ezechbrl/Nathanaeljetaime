import { noContent, route } from "@/lib/server/http";
import { authClient } from "@/lib/server/supabase";

export const POST = route(async () => {
  const supa = await authClient();
  await supa.auth.signOut({ scope: "local" }); // seulement cet appareil : l'app Ventes et les autres appareils restent connectés
  return noContent();
});
