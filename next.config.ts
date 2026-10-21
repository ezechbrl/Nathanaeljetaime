import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Les outils (nom, slogan, description, FAQ) sont maintenant dans l'app, après la création de la boutique.
      { source: "/outils", destination: "/app/outils", permanent: false },
      // Ouverture de l'app depuis Shopify (installation ou admin) : l'adresse de l'app reçoit ?shop=…&hmac=…
      // On lance tout de suite la connexion Shopify, qui ramène le marchand dans son espace Vigenia.
      { source: "/", has: [{ type: "query", key: "shop" }, { type: "query", key: "hmac" }], destination: "/api/shopify/install", permanent: false },
    ];
  },
};

export default nextConfig;
