import { ownedStore, requireUser } from "@/lib/server/auth";
import { checkSellable, fileSlug, productCsv, productHandle, storeVisuals } from "@/lib/server/export";
import { HttpError, route } from "@/lib/server/http";
import type { StorePlan } from "@/lib/store-schema";

type Ctx = { params: Promise<{ id: string }> };

// Produit de la boutique (fichier CSV au format de Shopify), à importer : Produits → Importer.
export const GET = route<Ctx>(async (_req, { params }) => {
  const user = await requireUser();
  if (user.plan === "free") throw new HttpError(402, "subscription_required", "Choisis ton offre pour télécharger ta boutique.");
  const store = await ownedStore(user.id, (await params).id);
  if (!store.plan) throw new HttpError(404, "not_found", "Boutique pas encore générée.");
  const plan = store.plan as StorePlan;
  checkSellable(plan);
  const { gallery } = await storeVisuals(store);
  const csv = productCsv(plan, productHandle(plan), gallery);
  return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="vigenia-produits-${fileSlug(store.name)}.csv"`, "cache-control": "no-store" } });
});
