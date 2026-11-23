// Liens AliExpress qui ne sont pas une fiche produit mais contiennent son numéro : pages « Bundle Deals » /
// « Choice » (aliexpress.com/ssr/300000512/…?productIds=1005…), liens de partage avec x_object_id, etc.
// On les ramène à la vraie fiche produit (aliexpress.com/item/<numéro>.html).
export function normalizeProductUrl(raw: string): string {
  try {
    const u = new URL(raw.trim());
    if (!/(^|\.)aliexpress\./i.test(u.hostname) || /\/item\/\d{6,}/.test(u.pathname)) return raw.trim();
    const params = [u.searchParams.get("productIds"), u.searchParams.get("productId"), u.searchParams.get("x_object_id"), u.searchParams.get("itemId"), decodeURIComponent(u.searchParams.get("utparam-url") ?? "").match(/x_object_id:(\d+)/)?.[1]];
    const id = params.map((v) => v?.match(/\d{10,}/)?.[0]).find(Boolean);
    return id ? `https://fr.aliexpress.com/item/${id}.html` : raw.trim();
  } catch { return raw; }
}
