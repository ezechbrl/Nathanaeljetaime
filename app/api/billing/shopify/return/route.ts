import { NextResponse } from "next/server";
import { syncShopifySubscription } from "@/lib/server/billing";
import { env } from "@/lib/server/env";
import { db, must } from "@/lib/server/supabase";

// « Welcome link » des offres Shopify : Shopify y renvoie le marchand après son choix (avec ?shop=…).
export async function GET(req: Request) {
  const shop = new URL(req.url).searchParams.get("shop")?.toLowerCase() ?? "";
  if (/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop)) {
    const owners = must(await db().from("shop_connections").select("user_id").eq("shop_domain", shop).eq("status", "active")) as { user_id: string }[];
    for (const o of owners) await syncShopifySubscription(o.user_id).catch((e) => console.error("Abonnement Shopify", e));
  }
  return NextResponse.redirect(`${env.appUrl()}/app/abonnement?checkout=success`);
}
