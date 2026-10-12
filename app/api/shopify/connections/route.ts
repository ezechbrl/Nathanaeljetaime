import { requireUser } from "@/lib/server/auth";
import { json, route } from "@/lib/server/http";
import { toConnection } from "@/lib/server/mappers";
import { db, must } from "@/lib/server/supabase";

export const GET = route(async () => {
  const user = await requireUser();
  const rows = must(await db().from("shop_connections").select("id, shop_domain, shop_name, status, created_at").eq("user_id", user.id).neq("status", "uninstalled").order("created_at")) as Record<string, any>[];
  return json({ connections: rows.map(toConnection) });
});
