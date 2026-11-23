import { ownedStore, requireUser } from "@/lib/server/auth";
import { checkSellable, fileSlug, productCsv, productHandle, storeVisuals } from "@/lib/server/export";
import { HttpError, route } from "@/lib/server/http";
import type { StorePlan } from "@/lib/store-schema";

type Ctx = { params: Promise<{ id: string }> };

// Produit de la boutique (fichier CSV au format de Shopify), à importer : Produits → Importer.
export const GET = route<Ctx>(async (_req, { params }) => {
  const user = await requireUser();
  const store = await ownedStore(user.id, (await params).id);
  // Abonné, ou boutique achetée avec « Ma boutique » (à lui pour toujours, même après les 7 jours).
  if (user.plan === "free" && user.single_store_id !== store.id && !store.single_paid_at) throw new HttpError(402, "subscription_required", "Choisis ton offre pour télécharger ta boutique.");
  if (!store.plan) throw new HttpError(404, "not_found", "Boutique pas encore générée.");
  const plan = store.plan as StorePlan;
  checkSellable(plan);
  const { gallery } = await storeVisuals(store);
  const csv = productCsv(plan, productHandle(plan), gallery);
  return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="vigenia-produits-${fileSlug(store.name)}.csv"`, "cache-control": "no-store" } });
});
