import { requireUser } from "@/lib/server/auth";
import { env } from "@/lib/server/env";
import { noContent, notFound, route } from "@/lib/server/http";
import { accessToken } from "@/lib/server/shopify";
import { db, must } from "@/lib/server/supabase";

export const DELETE = route<{ params: Promise<{ id: string }> }>(async (_req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const row = must(await db().from("shop_connections").select("*").eq("id", id).eq("user_id", user.id).maybeSingle()) as Record<string, any> | null;
  if (!row) throw notFound();
  if (row.access_token_encrypted) {
    // Révoque l'accès côté Shopify (désinstalle l'app de la boutique).
    await fetch(`https://${row.shop_domain}/admin/api/${env.shopifyApiVersion()}/api_permissions/current.json`, {
      method: "DELETE",
      headers: { "x-shopify-access-token": await accessToken(row as { id: string; shop_domain: string; access_token_encrypted: string }).catch(() => "") },
    }).catch(() => {});
  }
  await db().from("shop_connections").update({ status: "uninstalled", access_token_encrypted: null, updated_at: new Date().toISOString() }).eq("id", id);
  return noContent();
});
