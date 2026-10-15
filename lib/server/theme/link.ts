import { env } from "../env";
import { hmacHex, safeEqual } from "../crypto";

// Lien signé et temporaire vers l'archive du thème : Shopify le télécharge lors de themeCreate.
export function themeZipUrl(storeId: string, ttlMs = 30 * 60_000) {
  const exp = Date.now() + ttlMs;
  const payload = `${storeId}.${exp}`;
  const sig = hmacHex(env.encryptionKey(), `theme:${payload}`).slice(0, 32);
  return `${env.appUrl()}/api/shopify/theme/${payload}.${sig}/vitrio-theme.zip`;
}

export function readThemeToken(token: string): string | null {
  const [storeId, exp, sig] = token.split(".");
  if (!storeId || !exp || !sig || Number(exp) < Date.now()) return null;
  const expected = hmacHex(env.encryptionKey(), `theme:${storeId}.${exp}`).slice(0, 32);
  return safeEqual(sig, expected) ? storeId : null;
}
