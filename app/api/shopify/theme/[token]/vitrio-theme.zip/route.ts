import type { StorePlan } from "@/lib/store-schema";
import type { ShopifyIds } from "@/lib/server/shopify";
import { db } from "@/lib/server/supabase";
import { buildThemeZip, type ThemeContext } from "@/lib/server/theme/build";
import { readThemeToken } from "@/lib/server/theme/link";

// Archive du thème Vigenia d'une boutique, téléchargée par Shopify (lien signé, valable 30 min).
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const access = readThemeToken((await params).token);
  if (!access) return new Response("Lien expiré", { status: 403 });
  const { storeId } = access;
  const { data: store } = await db().from("stores").select("plan, theme, shopify, language").eq("id", storeId).maybeSingle();
  if (!store?.plan) return new Response("Introuvable", { status: 404 });
  const ids = (store.shopify ?? {}) as ShopifyIds;
  const zip = buildThemeZip({ plan: store.plan as StorePlan, theme: store.theme as ThemeContext["theme"], productHandle: ids.productHandle, aboutHandle: ids.aboutPageHandle, faqHandle: ids.faqPageHandle, language: store.language ?? undefined, files: access.withFiles ? ids.files : undefined });
  return new Response(zip as unknown as BodyInit, { headers: { "content-type": "application/zip", "cache-control": "no-store" } });
}
