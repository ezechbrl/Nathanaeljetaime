import { noContent, route } from "@/lib/server/http";
import { authClient } from "@/lib/server/supabase";

export const POST = route(async () => {
  const supa = await authClient();
  await supa.auth.signOut();
  return noContent();
});
