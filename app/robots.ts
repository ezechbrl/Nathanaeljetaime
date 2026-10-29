import type { MetadataRoute } from "next";

const base = (process.env.NEXT_PUBLIC_APP_URL ?? "https://vigenia.com").replace(/\/$/, "");

// Pages publiques ouvertes aux moteurs de recherche ; l'espace client et l'API restent privés.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/app", "/api", "/ventes", "/dashboard", "/connexion", "/inscription", "/connecter-shopify", "/r/"] },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
