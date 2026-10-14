import { NextResponse } from "next/server";
import { hmacBase64, safeEqual } from "@/lib/server/crypto";
import { env } from "@/lib/server/env";
import { endSubscriptionForShop } from "@/lib/server/billing";
import { db } from "@/lib/server/supabase";

// Webhooks Shopify : app/uninstalled et les trois webhooks RGPD obligatoires.
// À déclarer dans la configuration de l'app (Partner Dashboard / Dev Dashboard), URL : /api/webhooks/shopify
export async function POST(req: Request) {
  const raw = Buffer.from(await req.arrayBuffer());
  const hmac = req.headers.get("x-shopify-hmac-sha256") ?? "";
  let valid = false;
  try {
    valid = safeEqual(hmacBase64(env.shopifySecret(), raw), hmac);
  } catch {
    valid = false; // secret non configuré
  }
  if (!valid) return new NextResponse("signature invalide", { status: 401 });

  const topic = req.headers.get("x-shopify-topic") ?? "";
  const shop = req.headers.get("x-shopify-shop-domain") ?? "";
  const eventId = req.headers.get("x-shopify-event-id") ?? req.headers.get("x-shopify-webhook-id");
  if (eventId) {
    const { error } = await db().from("webhook_events").insert({ id: `shopify:${eventId}` });
    if (error) return new NextResponse("déjà traité", { status: 200 });
  }

  switch (topic) {
    case "app/uninstalled":
    case "shop/redact":
      // L'app est retirée (ou Shopify demande l'effacement 48 h après) : on supprime l'accès.
      await db().from("shop_connections").update({ status: "uninstalled", access_token_encrypted: null, updated_at: new Date().toISOString() }).eq("shop_domain", shop);
      await endSubscriptionForShop(shop); // Shopify arrête aussi la facturation de l'app
      break;
    case "customers/data_request":
    case "customers/redact":
      // Nous ne stockons aucune donnée personnelle des clients finaux des boutiques
      // (seulement des totaux agrégés par jour) : rien à exporter ni à effacer.
      break;
  }
  return new NextResponse("ok", { status: 200 });
}
