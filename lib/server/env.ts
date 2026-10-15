import "server-only";

// Lecture des variables d'environnement avec un message clair si l'une manque.
function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new ConfigError(`Variable d'environnement manquante : ${name} (voir docs/CLES-ET-COMPTES.md)`);
  return v;
}

export class ConfigError extends Error {}

export const env = {
  appUrl: () => (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  supabaseUrl: () => required("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: () => required("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceKey: () => required("SUPABASE_SERVICE_ROLE_KEY"),
  anthropicKey: () => required("ANTHROPIC_API_KEY"),
  encryptionKey: () => required("ENCRYPTION_KEY"),
  shopifyKey: () => required("SHOPIFY_API_KEY"),
  shopifySecret: () => required("SHOPIFY_API_SECRET"),
  shopifyScopes: () =>
    process.env.SHOPIFY_SCOPES ??
    "read_products,write_products,read_content,write_content,read_online_store_pages,write_online_store_pages,read_files,write_files,read_publications,write_publications,read_orders,read_reports,read_themes,write_themes",
  shopifyApiVersion: () => process.env.SHOPIFY_API_VERSION ?? "2025-10",
  // Paiement par Shopify App Pricing (voir docs/CLES-ET-COMPTES.md).
  shopifyAppHandle: () => process.env.SHOPIFY_APP_HANDLE ?? null,
  shopifyAppId: () => process.env.SHOPIFY_APP_ID ?? null, // nombre visible dans l'URL de l'app (Partner Dashboard)
  partnerOrgId: () => process.env.SHOPIFY_PARTNER_ORG_ID ?? null,
  partnerToken: () => process.env.SHOPIFY_PARTNER_TOKEN ?? null,
  stripeKey: () => required("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: () => required("STRIPE_WEBHOOK_SECRET"),
  stripePrice: (plan: "pro" | "agency", interval: "month" | "year") =>
    required(`STRIPE_PRICE_${plan === "pro" ? "PRO" : "AGENCY"}_${interval === "month" ? "MONTH" : "YEAR"}`),
  resendKey: () => process.env.RESEND_API_KEY ?? null,
  contactEmail: () => process.env.CONTACT_EMAIL ?? null,
  falKey: () => process.env.FAL_KEY ?? null,
  cronSecret: () => process.env.CRON_SECRET ?? null,
};
