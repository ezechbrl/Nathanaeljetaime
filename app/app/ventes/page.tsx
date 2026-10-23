"use client";

import { ArrowDownRight, ArrowUpRight, ExternalLink, Gift, RefreshCw, Users } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/components/app/AppContext";
import { PageHeader } from "@/components/app/PageHeader";
import { ErrorState, Skeleton } from "@/components/ui/Feedback";
import * as api from "@/lib/api/client";
import { useApi } from "@/lib/api/hooks";
import type { OwnerStats } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { formatMoney, formatShortDate } from "@/lib/format";

const PERIODS = [
  { id: "today", label: "Aujourd'hui" },
  { id: "week", label: "7 jours" },
  { id: "month", label: "30 jours" },
] as const;

const PLAN_NAME: Record<string, string> = { pro: "Starter", agency: "Pro" };
const eur = (cents: number) => formatMoney(cents, "EUR");

function Kpi({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "up" | "down" }) {
  return (
    <div className="surface rounded-card p-5">
      <p className="text-sm text-fg-muted">{label}</p>
      <p className={cn("mt-2 text-[2rem] font-semibold leading-none tracking-[-0.03em] tabular-nums", tone === "down" && "text-[#fca5a5]")}>{value}</p>
      {hint && <p className="mt-2 text-xs text-fg-faint">{hint}</p>}
    </div>
  );
}

// Barres des 30 derniers jours (revenus encaissés).
function RevenueChart({ series }: { series: OwnerStats["series"] }) {
  const max = Math.max(...series.map((d) => d.revenue), 1);
  const total = series.reduce((t, d) => t + d.revenue, 0);
  return (
    <section className="surface rounded-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg tracking-tight">Revenus des 30 derniers jours</h2>
        <span className="text-sm tabular-nums text-fg-muted">{eur(total)}</span>
      </div>
      <div className="mt-5 flex h-40 items-end gap-[3px]" role="img" aria-label="Revenus par jour">
        {series.map((d) => (
          <div key={d.day} className="group relative flex h-full flex-1 items-end">
            <div className={cn("w-full rounded-t-[3px]", d.revenue ? "bg-[linear-gradient(180deg,#34f0b0,#0fae7c)]" : "bg-white/[0.06]")} style={{ height: `${d.revenue ? Math.max(6, (d.revenue / max) * 100) : 4}%` }} />
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-black/90 px-2 py-1 text-[11px] group-hover:block">
              {formatShortDate(d.day)} · {eur(d.revenue)} · {d.signups} inscrit{d.signups > 1 ? "s" : ""}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-fg-faint"><span>{formatShortDate(series[0].day)}</span><span>Aujourd'hui</span></div>
    </section>
  );
}

function Dashboard({ s }: { s: OwnerStats }) {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]["id"]>("today");
  const p = s.periods[period];
  return (
    <div className="space-y-6 p-5 sm:p-8">
      {/* MRR en grand, comme sur Stripe */}
      <section className="glow-frame rounded-[22px] p-[1.5px]">
        <div className="grid gap-6 rounded-[21px] bg-[linear-gradient(180deg,rgb(8_40_31/0.95),rgb(4_20_15/0.97))] p-6 sm:grid-cols-[1.4fr_1fr_1fr] sm:p-8">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#6ee7b7]">Revenu mensuel (MRR)</p>
            <p className="mt-3 text-[clamp(2.6rem,1.8rem+2.6vw,3.8rem)] font-semibold leading-none tracking-[-0.035em] tabular-nums">{eur(s.mrr)}</p>
            <p className="mt-2 text-sm text-fg-muted">Soit {eur(s.arr)} par an au rythme actuel</p>
          </div>
          <div>
            <p className="text-sm text-fg-muted">Abonnés payants</p>
            <p className="mt-2 text-[2.2rem] font-semibold leading-none tabular-nums">{s.subscribers.total}</p>
            <p className="mt-2 text-xs text-fg-faint">{s.subscribers.starter} Starter · {s.subscribers.pro} Pro</p>
          </div>
          <div>
            <p className="text-sm text-fg-muted">Liste d'attente</p>
            <p className="mt-2 text-[2.2rem] font-semibold leading-none tabular-nums">{s.totals.waitlist}</p>
            <p className="mt-2 text-xs text-fg-faint">{s.totals.accounts} compte{s.totals.accounts > 1 ? "s" : ""} créé{s.totals.accounts > 1 ? "s" : ""}</p>
          </div>
        </div>
      </section>

      <div role="tablist" aria-label="Période" className="flex w-fit gap-1 rounded-full border border-white/10 bg-black/25 p-1">
        {PERIODS.map((x) => (
          <button key={x.id} type="button" role="tab" aria-selected={period === x.id} onClick={() => setPeriod(x.id)} className={cn("rounded-full px-4 py-1.5 text-sm font-medium transition-all", period === x.id ? "bg-[linear-gradient(180deg,#34f0b0,#0fae7c)] text-[#03140d]" : "text-fg-muted hover:text-fg")}>
            {x.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Kpi label="Encaissé" value={eur(p.revenue)} hint="Paiements d'abonnements (hors tests)" />
        <Kpi label="Nouveaux abonnés" value={`+${p.newSubs}`} />
        <Kpi label="Désabonnements" value={p.cancels ? `−${p.cancels}` : "0"} tone={p.cancels ? "down" : undefined} />
        <Kpi label="Inscrits liste d'attente" value={`+${p.waitlist}`} />
        <Kpi label="Comptes créés" value={`+${p.accounts}`} />
        <Kpi label="Boutiques créées" value={`+${p.stores}`} hint="Aperçus gratuits compris" />
      </div>

      <RevenueChart series={s.series} />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="surface rounded-card p-5">
          <h2 className="flex items-center gap-2 text-lg tracking-tight"><Gift className="h-4 w-4 text-accent" /> Affiliation</h2>
          {s.affiliates.length ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[460px] text-sm">
                <thead className="text-left text-xs text-fg-faint">
                  <tr><th className="pb-2 font-medium">Affilié</th><th className="pb-2 text-right font-medium">Clics</th><th className="pb-2 text-right font-medium">Inscrits</th><th className="pb-2 text-right font-medium">Clients</th><th className="pb-2 text-right font-medium">Commission due</th></tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {s.affiliates.map((a) => (
                    <tr key={a.code}>
                      <td className="py-2.5"><span className="block">{a.name}</span><span className="text-xs text-fg-faint">vigenia.com/r/{a.code} · {Math.round(a.rate * 100)} %</span></td>
                      <td className="py-2.5 text-right tabular-nums">{a.clicks}</td>
                      <td className="py-2.5 text-right tabular-nums">{a.signups}</td>
                      <td className="py-2.5 text-right tabular-nums">{a.customers}</td>
                      <td className="py-2.5 text-right tabular-nums">{eur(a.commission)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="mt-3 text-sm text-fg-muted">Personne n'a encore créé de lien d'affiliation. Chaque utilisateur peut en créer un depuis la page Affiliation.</p>}
        </section>

        <section className="surface rounded-card p-5">
          <h2 className="flex items-center gap-2 text-lg tracking-tight"><Users className="h-4 w-4 text-accent" /> D'où viennent les inscrits</h2>
          {s.sources.length ? (
            <ul className="mt-4 space-y-2 text-sm">
              {s.sources.slice(0, 8).map((x) => (
                <li key={x.ref} className="flex justify-between gap-3"><span className="truncate text-fg-muted">{x.ref === "direct" ? "Direct (TikTok, bouche-à-oreille…)" : `Lien affilié ${x.ref}`}</span><span className="tabular-nums">{x.count}</span></li>
              ))}
            </ul>
          ) : <p className="mt-3 text-sm text-fg-muted">Pas encore d'inscrits.</p>}
        </section>
      </div>

      <section className="surface rounded-card p-5">
        <h2 className="text-lg tracking-tight">Dernières ventes</h2>
        {s.recent.length ? (
          <ul className="mt-3 divide-y divide-white/[0.06] text-sm">
            {s.recent.map((r, i) => (
              <li key={i} className="flex items-center gap-3 py-2.5">
                {r.kind === "cancel" ? <ArrowDownRight className="h-4 w-4 shrink-0 text-[#fca5a5]" /> : <ArrowUpRight className="h-4 w-4 shrink-0 text-accent" />}
                <span className="min-w-0 flex-1 truncate">
                  {r.kind === "new" ? "Nouvel abonné" : r.kind === "payment" ? "Paiement" : "Désabonnement"} · {PLAN_NAME[r.plan ?? ""] ?? r.plan}
                  {r.email && <span className="text-fg-faint"> · {r.email}</span>}
                </span>
                {r.kind !== "cancel" && <span className="tabular-nums">{eur(r.amount)}</span>}
                <span className="w-24 shrink-0 text-right text-xs text-fg-faint">{formatShortDate(r.at)}</span>
              </li>
            ))}
          </ul>
        ) : <p className="mt-3 text-sm text-fg-muted">Aucune vente pour l'instant. Elles apparaîtront ici dès le premier abonné.</p>}
      </section>

      <p className="text-xs text-fg-faint">
        Montants en euros, hors paiements de test. L'argent réellement viré sur ton compte est sur{" "}
        <a href="https://partners.shopify.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline">Shopify Partners → Versements <ExternalLink className="h-3 w-3" /></a>.
      </p>
    </div>
  );
}

export default function SalesPage() {
  const { user } = useApp();
  const stats = useApi(() => (user.isOwner ? api.getOwnerStats() : Promise.reject(new Error("Réservé au fondateur de Vigenia."))), [user.isOwner]);
  return (
    <>
      <PageHeader title="Mes ventes" subtitle="Ton tableau de bord, visible par toi seul." actions={
        <button type="button" onClick={() => stats.reload?.()} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-sm text-fg-muted hover:text-fg"><RefreshCw className="h-3.5 w-3.5" /> Actualiser</button>
      } />
      {stats.error ? <div className="p-5 sm:p-8"><ErrorState message={stats.error.message} onRetry={stats.reload} /></div>
        : stats.data ? <Dashboard s={stats.data} />
        : <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-8">{[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-28" />)}</div>}
    </>
  );
}
