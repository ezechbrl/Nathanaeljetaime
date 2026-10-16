// Liens utiles vers la boutique Shopify d'un marchand, à partir de l'adresse en ligne (https://xxx.myshopify.com).
export function shopifyLinks(liveUrl: string | null | undefined) {
  if (!liveUrl) return null;
  const domain = liveUrl.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const handle = domain.replace(/\.myshopify\.com$/, "");
  const admin = `https://admin.shopify.com/store/${handle}`;
  return {
    storefront: `https://${domain}`,
    admin,
    themes: `${admin}/themes`,
    // Où trouver (ou retirer) le mot de passe d'une boutique protégée.
    password: `${admin}/online_store/preferences`,
    // Réglages à faire par le marchand dans Shopify avant de vendre.
    payments: `${admin}/settings/payments`,
    shipping: `${admin}/settings/shipping`,
    policies: `${admin}/settings/legal`,
  };
}
