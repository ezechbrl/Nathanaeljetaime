import Link from "next/link";
import { PageHeader, StatTile } from "@/components/dashboard/PageHeader";
import { StoreMockup } from "@/components/landing/StoreMockup";
import { euros, percent } from "@/lib/format";
import { MOCK_STORES } from "@/lib/mock";

export const metadata = { title: "Mes boutiques" };

export default function DashboardPage() {
  const live = MOCK_STORES.filter((s) => s.status === "publiée");
  const revenue = live.reduce((sum, s) => sum + s.revenue30d, 0);
  const orders = live.reduce((sum, s) => sum + s.orders30d, 0);
  const avgConversion = live.reduce((sum, s) => sum + s.conversion.after, 0) / (live.length || 1);

  return (
    <>
      <PageHeader
        title="Mes boutiques"
        subtitle="Données de démonstration"
        action={
          <Link href="/dashboard/nouvelle" className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand/90">
            + Nouvelle boutique
          </Link>
        }
      />
      <div className="space-y-8 px-6 py-8 sm:px-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Boutiques" value={String(MOCK_STORES.length)} hint={`${live.length} en ligne`} />
          <StatTile label="Chiffre d'affaires (30 j)" value={euros(revenue)} />
          <StatTile label="Commandes (30 j)" value={String(orders)} />
          <StatTile label="Conversion moyenne" value={percent(avgConversion)} hint="↗ depuis l'optimisation IA" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {MOCK_STORES.map((s) => (
            <Link key={s.id} href={`/dashboard/boutiques/${s.id}`} className="group rounded-3xl border border-black/5 bg-black/[0.02] p-4 transition hover:shadow-lg">
              <div className="flex justify-center rounded-2xl bg-white p-4 [&>div]:w-full">
                <StoreMockup name={s.name} niche={s.niche} colors={[s.colors.background, s.colors.accent, s.colors.primary]} />
              </div>
              <div className="mt-4 flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold group-hover:text-brand">{s.name}</p>
                  <p className="text-xs text-black/50">{s.niche} · {s.language}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${s.status === "publiée" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                  {s.status}
                </span>
              </div>
              <p className="mt-3 text-xs text-black/40">Modifiée {s.updatedAt}</p>
            </Link>
          ))}
          <Link href="/dashboard/nouvelle" className="grid min-h-64 place-items-center rounded-3xl border-2 border-dashed border-black/10 text-sm font-medium text-black/50 hover:border-brand hover:text-brand">
            + Créer une boutique
          </Link>
        </div>
      </div>
    </>
  );
}
