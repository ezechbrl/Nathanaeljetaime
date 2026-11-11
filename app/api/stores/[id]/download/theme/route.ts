import { ownedStore, requireUser } from "@/lib/server/auth";
import { checkSellable, downloadableThemeZip, fileSlug, storeVisuals } from "@/lib/server/export";
import { HttpError, route } from "@/lib/server/http";
import type { StorePlan } from "@/lib/store-schema";

type Ctx = { params: Promise<{ id: string }> };
export const maxDuration = 60;

// Thème de la boutique (.zip, photos comprises), à importer dans Shopify : Boutique en ligne → Thèmes → Importer.
export const GET = route<Ctx>(async (_req, { params }) => {
  const user = await requireUser();
  if (user.plan === "free") throw new HttpError(402, "subscription_required", "Choisis ton offre pour télécharger ta boutique.");
  const store = await ownedStore(user.id, (await params).id);
  if (!store.plan) throw new HttpError(404, "not_found", "Boutique pas encore générée.");
  checkSellable(store.plan as StorePlan);
  const { scenes } = await storeVisuals(store);
  const zip = await downloadableThemeZip(store, scenes);
  return new Response(zip as unknown as BodyInit, { headers: { "content-type": "application/zip", "content-disposition": `attachment; filename="vigenia-theme-${fileSlug(store.name)}.zip"`, "cache-control": "no-store" } });
});
