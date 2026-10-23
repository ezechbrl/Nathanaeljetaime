import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Service worker de l'app « Vigenia Ventes » : jamais mis en cache, pour que les mises à jour arrivent tout de suite.
  async headers() {
    return [{ source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }, { key: "Content-Type", value: "application/javascript; charset=utf-8" }] }];
  },
  async redirects() {
    return [
      // Ancienne adresse : tout le monde passe sur vigenia.com (les cookies de connexion restent sur le même domaine).
      // Les webhooks et retours Shopify / Stripe déjà configurés sur l'ancienne adresse ne sont pas redirigés.
      { source: "/:path((?!api/).*)", has: [{ type: "host", value: "nathanaeljetaime.vercel.app" }], destination: "https://vigenia.com/:path", permanent: true },
      // Les outils (nom, slogan, description, FAQ) sont maintenant dans l'app, après la création de la boutique.
      { source: "/outils", destination: "/app/outils", permanent: false },
      // Ouverture de l'app depuis Shopify (installation ou admin) : l'adresse de l'app reçoit ?shop=…&hmac=…
      // On lance tout de suite la connexion Shopify, qui ramène le marchand dans son espace Vigenia.
      { source: "/", has: [{ type: "query", key: "shop" }, { type: "query", key: "hmac" }], destination: "/api/shopify/install", permanent: false },
    ];
  },
};

export default nextConfig;
