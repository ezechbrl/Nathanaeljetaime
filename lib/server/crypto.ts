import "server-only";
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { env } from "./env";

// Clé AES de 32 octets : ENCRYPTION_KEY en base64 (32 octets), sinon dérivée par SHA-256
// (accepte donc aussi un code hexadécimal ou un texte quelconque, comme celui de generate-secret.vercel.app).
function key() {
  const raw = env.encryptionKey().trim();
  const k = Buffer.from(raw, "base64");
  return k.length === 32 ? k : createHash("sha256").update(raw).digest();
}

// AES-256-GCM : iv.tag.contenu, en base64.
export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return [iv, c.getAuthTag(), enc].map((b) => b.toString("base64")).join(".");
}

export function decrypt(payload: string): string {
  const [iv, tag, enc] = payload.split(".").map((p) => Buffer.from(p, "base64"));
  const d = createDecipheriv("aes-256-gcm", key(), iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(enc), d.final()]).toString("utf8");
}

export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function hmacHex(secret: string, data: string) {
  return createHmac("sha256", secret).update(data).digest("hex");
}

export function hmacBase64(secret: string, data: string | Buffer) {
  return createHmac("sha256", secret).update(data).digest("base64");
}

export const randomToken = (bytes = 16) => randomBytes(bytes).toString("hex");
