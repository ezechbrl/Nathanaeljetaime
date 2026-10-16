import type { StorePlan } from "@/lib/store-schema";
import { ownedStore, requireUser } from "@/lib/server/auth";
import { route } from "@/lib/server/http";
import type { ShopifyIds } from "@/lib/server/shopify";
import { buildThemeZip, type ThemeContext } from "@/lib/server/theme/build";

type Ctx = { params: Promise<{ id: string }> };

// Thème Vitrio de la boutique en .zip, à importer à la main dans Shopify (Boutique en ligne → Thèmes → Importer).
export const GET = route<Ctx>(async (_req, { params }) => {
  const user = await requireUser();
  const store = await ownedStore(user.id, (await params).id);
  if (!store.plan) return new Response("Boutique pas encore générée", { status: 404 });
  const ids = (store.shopify ?? {}) as ShopifyIds;
  const zip = buildThemeZip({ plan: store.plan as StorePlan, theme: store.theme as ThemeContext["theme"], productHandle: ids.productHandle, aboutHandle: ids.aboutPageHandle, faqHandle: ids.faqPageHandle, language: store.language ?? undefined, files: ids.files });
  const slug = String(store.name ?? "boutique").normalize("NFD").replace(/[^\w]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "boutique";
  return new Response(zip as unknown as BodyInit, { headers: { "content-type": "application/zip", "content-disposition": `attachment; filename="vitrio-${slug}.zip"`, "cache-control": "no-store" } });
});
