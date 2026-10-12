"use client";

import { ArrowDownRight, ArrowUpRight, BarChart3, Check, Lightbulb, Table2, X } from "lucide-react";
import { useState } from "react";
import { MetricChart } from "@/components/app/MetricChart";
import { PageHeader } from "@/components/app/PageHeader";
import { PublishButton } from "@/components/app/PublishButton";
import { useStore } from "@/components/app/StoreContext";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/Feedback";
import { useToast } from "@/components/ui/Toast";
import * as api from "@/lib/api/client";
import { useApi } from "@/lib/api/hooks";
import type { MetricsPoint, Recommendation, StoreMetrics } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { formatMoney, formatNumber, formatPercent, formatShortDate } from "@/lib/format";

type Metric = keyof Omit<MetricsPoint, "date">;
const METRICS: { id: Metric; label: string; format: (n: number) => string }[] = [
  { id: "conversionRate", label: "Taux de conversion", format: formatPercent },
  { id: "revenue", label: "Chiffre d'affaires", format: (n) => formatMoney(n) },
  { id: "orders", label: "Commandes", format: formatNumber },
  { id: "sessions", label: "Visites", format: formatNumber },
];
const IMPACT = { high: "Impact fort", medium: "Impact moyen", low: "Impact faible" };
const AREA = { copy: "Textes", offer: "Offre", "product-page": "Fiche produit", trust: "Réassurance", seo: "SEO", speed: "Vitesse" };

function Delta({ now, before, invert }: { now: number; before: number; invert?: boolean }) {
  if (!before) return null;
  const pct = ((now - before) / before) * 100;
  const up = pct >= 0;
  const good = invert ? !up : up;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs", good ? "text-good" : "text-bad")}>
      {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
      {Math.abs(pct).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} %
      <span className="sr-only">{up ? "en hausse" : "en baisse"} par rapport à la période précédente</span>
    </span>
  );
}

export default function PilotPage() {
  const { store } = useStore();
  const toast = useToast();
  const [range, setRange] = useState<StoreMetrics["range"]>("30d");
  const [metric, setMetric] = useState<Metric>("conversionRate");
  const [table, setTable] = useState(false);
  const metrics = useApi(() => api.getMetrics(store.id, range), [store.id, range]);
  const recos = useApi(() => api.listRecommendations(store.id), [store.id]);
  const m = METRICS.find((x) => x.id === metric)!;

  async function act(r: Recommendation, action: "apply" | "dismiss") {
    try {
      const res = action === "apply" ? await api.applyRecommendation(r.id) : await api.dismissRecommendation(r.id);
      recos.setData((d) => d && { ...d, recommendations: d.recommendations.map((x) => (x.id === r.id ? res.recommendation : x)) });
      toast(action === "apply" ? "Recommandation appliquée" : "Recommandation ignorée");
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }

  if (store.status !== "published") {
    return (
      <>
        <PageHeader title="Pilotage" />
        <div className="p-5 sm:p-8">
          <EmptyState icon={BarChart3} title="Publie ta boutique pour activer le pilotage" text="Dès que ta boutique reçoit ses premières visites, l'IA analyse tes statistiques chaque matin et te propose des améliorations." action={<PublishButton />} />
        </div>
      </>
    );
  }

  const t = metrics.data?.totals;
  const p = metrics.data?.previous;
  const proposed = recos.data?.recommendations.filter((r) => r.status === "proposed") ?? [];
  const done = recos.data?.recommendations.filter((r) => r.status !== "proposed") ?? [];

  return (
    <>
      <PageHeader title="Pilotage" subtitle="Comparé à la période précédente de même durée." actions={
        <div className="flex rounded-ctl border border-white/[0.07] p-1" role="group" aria-label="Période">
          {(["7d", "30d", "90d"] as const).map((r) => (
            <button key={r} onClick={() => setRange(r)} aria-pressed={range === r} className={cn("rounded-[7px] px-3 py-1 text-[13px]", range === r ? "bg-white/[0.08] text-fg" : "text-fg-muted hover:text-fg")}>{r.replace("d", " j")}</button>
          ))}
        </div>
      } />
      <div className="space-y-6 p-5 sm:p-8">
        {recos.data?.insight && (
          <section className="flex gap-4 rounded-card border border-accent/20 bg-accent-deep/20 p-5">
            <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <div><h2 className="text-sm text-accent">L'avis de l'IA aujourd'hui</h2><p className="mt-1.5 text-[15px] leading-relaxed text-fg">{recos.data.insight.summary}</p></div>
          </section>
        )}

        {metrics.error ? <ErrorState message={metrics.error.message} onRetry={metrics.reload} /> : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {METRICS.map((x) => (
              <button key={x.id} onClick={() => setMetric(x.id)} aria-pressed={metric === x.id} className={cn("rounded-card border p-4 text-left transition-colors", metric === x.id ? "border-accent/35 bg-accent-deep/20" : "border-white/[0.07] bg-white/[0.02] hover:border-white/15")}>
                <p className="text-xs text-fg-muted">{x.label}</p>
                {t && p ? (
                  <>
                    <p className="mt-2 text-2xl tracking-tight tabular-nums">{x.format(t[x.id === "revenue" ? "revenue" : x.id])}</p>
                    <Delta now={t[x.id]} before={p[x.id]} />
                  </>
                ) : <Skeleton className="mt-2 h-8 w-24" />}
              </button>
            ))}
          </div>
        )}

        <section className="surface rounded-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px]">{m.label} par jour</h2>
            <button onClick={() => setTable((v) => !v)} className="flex items-center gap-1.5 text-xs text-fg-muted hover:text-fg"><Table2 className="h-3.5 w-3.5" /> {table ? "Voir le graphique" : "Voir le tableau"}</button>
          </div>
          <div className="mt-4">
            {!metrics.data ? <Skeleton className="h-56 w-full" /> : table ? (
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-bg-2 text-left text-fg-faint"><tr><th className="py-2 font-normal">Date</th><th className="py-2 text-right font-normal">{m.label}</th></tr></thead>
                  <tbody>{metrics.data.series.map((s) => <tr key={s.date} className="border-t border-white/[0.05]"><td className="py-1.5 text-fg-muted">{formatShortDate(s.date)}</td><td className="py-1.5 text-right tabular-nums">{m.format(s[metric])}</td></tr>)}</tbody>
                </table>
              </div>
            ) : <MetricChart series={metrics.data.series} metric={metric} format={m.format} label={m.label} />}
          </div>
        </section>

        <section>
          <h2 className="text-lg tracking-tight">Recommandations</h2>
          <div className="mt-4 space-y-2">
            {!recos.data ? <Skeleton className="h-24 w-full" /> : proposed.length === 0 ? (
              <p className="rounded-card border border-white/[0.07] p-5 text-sm text-fg-muted">Rien à corriger aujourd'hui. Les prochaines recommandations arrivent demain matin.</p>
            ) : proposed.map((r) => (
              <article key={r.id} className="surface rounded-card p-5">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-fg-muted">{AREA[r.area]}</span>
                  <span className={cn("rounded-full border px-2 py-0.5", r.expectedImpact === "high" ? "border-accent/30 text-accent" : "border-white/10 text-fg-muted")}>{IMPACT[r.expectedImpact]}</span>
                </div>
                <h3 className="mt-3 text-[16px] tracking-tight">{r.title}</h3>
                <p className="mt-1.5 text-sm text-fg-muted">{r.rationale}</p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" onClick={() => act(r, "apply")}><Check className="h-3.5 w-3.5" /> Appliquer</Button>
                  <Button size="sm" variant="ghost" onClick={() => act(r, "dismiss")}><X className="h-3.5 w-3.5" /> Ignorer</Button>
                </div>
              </article>
            ))}
          </div>
          {done.length > 0 && (
            <details className="mt-4 text-sm">
              <summary className="cursor-pointer text-fg-muted hover:text-fg">Historique ({done.length})</summary>
              <ul className="mt-3 space-y-2">
                {done.map((r) => <li key={r.id} className="flex items-center gap-2 text-fg-muted">{r.status === "applied" ? <Check className="h-4 w-4 text-good" /> : <X className="h-4 w-4 text-fg-faint" />} {r.title}</li>)}
              </ul>
            </details>
          )}
        </section>
      </div>
    </>
  );
}
