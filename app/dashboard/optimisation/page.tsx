import { OptimizationList } from "@/components/dashboard/OptimizationList";
import { PageHeader, StatTile } from "@/components/dashboard/PageHeader";
import { percent } from "@/lib/format";
import { MOCK_STORES } from "@/lib/mock";

export const metadata = { title: "Optimisation" };

export default function OptimizationPage() {
  const store = MOCK_STORES[0];
  return (
    <>
      <PageHeader title="Optimisation quotidienne" subtitle={`${store.name} · Données de démonstration`} />
      <div className="space-y-8 px-6 py-8 sm:px-10">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatTile label="Conversion avant l'IA" value={percent(store.conversion.before)} />
          <StatTile label="Conversion actuelle" value={percent(store.conversion.after)} hint={`↗ +${(store.conversion.after - store.conversion.before).toFixed(1).replace(".", ",")} pt`} />
          <StatTile label="Optimisations appliquées" value="3" />
        </div>

        <div className="rounded-3xl bg-brand-soft/50 p-6">
          <p className="text-sm font-semibold text-brand">L'avis de l'IA</p>
          <p className="mt-2 text-sm leading-relaxed text-black/70">
            Ta fiche produit convertit bien sur ordinateur, mais 68 % de tes visiteurs sont sur mobile et le bouton d'achat
            n'apparaît qu'après deux écrans. Remonter le prix et le bouton au-dessus de la galerie devrait réduire les abandons.
          </p>
        </div>

        <div>
          <h2 className="mb-4 font-semibold">Recommandations</h2>
          <OptimizationList />
        </div>
      </div>
    </>
  );
}
