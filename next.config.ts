import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Ouverture de l'app depuis Shopify (installation ou admin) : l'adresse de l'app reçoit ?shop=…&hmac=…
      // On lance tout de suite la connexion Shopify, qui ramène le marchand dans son espace Vitrio.
      { source: "/", has: [{ type: "query", key: "shop" }, { type: "query", key: "hmac" }], destination: "/api/shopify/install", permanent: false },
    ];
  },
};

export default nextConfig;
