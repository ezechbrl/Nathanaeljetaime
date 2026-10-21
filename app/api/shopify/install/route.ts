import { NextResponse } from "next/server";
import { randomToken } from "@/lib/server/crypto";
import { badRequest, route } from "@/lib/server/http";
import { authorizeUrl, SHOP_RE } from "@/lib/server/shopify";

// Démarre la connexion Shopify. Sert à la fois à se connecter (sans compte) et à relier une boutique.
export const GET = route(async (req) => {
  const params = new URL(req.url).searchParams;
  const raw = (params.get("shop") ?? "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const shop = raw.endsWith(".myshopify.com") ? raw : `${raw}.myshopify.com`;
  if (!SHOP_RE.test(shop)) throw badRequest("Adresse de boutique invalide (ex. ma-boutique.myshopify.com).", "shop");
  const next = params.get("next") ?? "/app";
  const state = randomToken();
  const res = NextResponse.redirect(authorizeUrl(shop, state));
  const opts = { httpOnly: true, secure: true, sameSite: "lax" as const, maxAge: 3600, path: "/" };
  res.cookies.set("shopify_state", state, opts);
  res.cookies.set("shopify_next", next.startsWith("/") && !next.startsWith("//") ? next : "/app", opts);
  if (params.get("retry")) res.cookies.set("shopify_retry", "1", { ...opts, maxAge: 300 });
  else res.cookies.delete("shopify_retry");
  return res;
});
