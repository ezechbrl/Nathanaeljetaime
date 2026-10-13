"use client";

import { Check, ExternalLink } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useApp } from "@/components/app/AppContext";
import { PageHeader } from "@/components/app/PageHeader";
import { Button, Spinner } from "@/components/ui/Button";
import { AiBudgetMeter, Meter, Skeleton } from "@/components/ui/Feedback";
import { useToast } from "@/components/ui/Toast";
import * as api from "@/lib/api/client";
import { useApi } from "@/lib/api/hooks";
import { cn } from "@/lib/cn";
import { PLANS, euro } from "@/lib/content/pricing";
import { formatDate, formatMoney } from "@/lib/format";

function Billing() {
  const { refresh } = useApp();
  const params = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const billing = useApi(() => api.getBilling(), []);
  const [yearly, setYearly] = useState(params.get("interval") !== "month");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (params.get("checkout") === "success") {
      toast("Abonnement activé, merci !");
      refresh();
      router.replace("/app/abonnement");
    }
  }, [params, refresh, router, toast]);

  async function choose(plan: "pro" | "agency") {
    setBusy(plan);
    try {
      const { url } = await api.startCheckout(plan, yearly ? "year" : "month");
      window.location.href = url;
    } catch (e) {
      toast((e as Error).message, "error");
      setBusy(null);
    }
  }

  async function portal() {
    setBusy("portal");
    const { url } = await api.openBillingPortal();
    window.location.href = url;
  }

  const sub = billing.data?.subscription;
  const usage = billing.data?.usage;
  const current = PLANS.find((p) => p.id === sub?.plan);

  return (
    <>
      <PageHeader title="Abonnement" actions={sub && sub.plan !== "free" && <Button variant="secondary" onClick={portal} disabled={busy === "portal"}>{busy === "portal" ? <Spinner /> : <ExternalLink className="h-4 w-4" />} Gérer le paiement</Button>} />
      <div className="space-y-8 p-5 sm:p-8">
        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <section className="surface rounded-card p-5">
            <p className="text-sm text-fg-muted">Offre actuelle</p>
            {sub ? (
              <>
                <p className="mt-2 text-3xl tracking-tight">{current?.name}</p>
                <p className="mt-1 text-sm text-fg-muted">{sub.renewsAt ? `${sub.cancelAtPeriodEnd ? "Se termine" : "Renouvellement"} le ${formatDate(sub.renewsAt)}` : "Gratuit, sans limite de durée"}</p>
              </>
            ) : <Skeleton className="mt-2 h-9 w-40" />}
          </section>
          <section className="surface rounded-card p-5">
            <p className="text-sm text-fg-muted">Utilisation ce mois-ci</p>
            {usage ? (
              <div className="mt-4 space-y-4">
                <AiBudgetMeter budget={usage.aiBudget} />
                <Meter label="Messages à l'IA" used={usage.conversations.used} limit={usage.conversations.limit} />
                <Meter label="Images générées" used={usage.images.used} limit={usage.images.limit} />
                <Meter label="Boutiques" used={usage.stores.used} limit={usage.stores.limit} />
                <p className="text-xs text-fg-faint">Quotas remis à zéro le {formatDate(usage.resetsAt)}. Crédit IA : {usage.aiBudget.session.limitEur} € qui se recharge toutes les {usage.aiBudget.session.hours} h, et {usage.aiBudget.limitEur} € maximum par semaine (au-delà, pause de 24 h).</p>
              </div>
            ) : <Skeleton className="mt-4 h-24" />}
          </section>
        </div>

        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg tracking-tight">Changer d'offre</h2>
            <div className="flex rounded-full border border-black/[0.08] p-1 text-[13px]" role="radiogroup" aria-label="Période">
              {[{ v: false, l: "Mensuel" }, { v: true, l: "Annuel · 2 mois offerts" }].map((o) => (
                <button key={o.l} role="radio" aria-checked={yearly === o.v} onClick={() => setYearly(o.v)} className={cn("rounded-full px-3 py-1", yearly === o.v ? "bg-black/[0.08] text-fg" : "text-fg-muted")}>{o.l}</button>
              ))}
            </div>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {PLANS.map((p) => {
              const isCurrent = p.id === sub?.plan;
              const highlighted = params.get("plan") === p.id || (!params.get("plan") && p.featured);
              return (
                <div key={p.id} className={cn("flex flex-col rounded-card border p-5", highlighted ? "border-accent/35 bg-accent-deep/20" : "border-black/[0.07]")}>
                  <p className="text-lg tracking-tight">{p.name}</p>
                  <p className="mt-3 text-3xl tracking-tight">{euro(yearly ? Math.round(p.yearly / 12) : p.monthly)}<span className="text-sm text-fg-muted"> / mois</span></p>
                  <ul className="mt-4 flex-1 space-y-2 text-sm text-fg-muted">
                    {p.features.slice(0, 4).map((f) => <li key={f} className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />{f}</li>)}
                  </ul>
                  {isCurrent ? <p className="mt-5 text-center text-sm text-fg-faint">Offre actuelle</p> : p.id === "free" ? (
                    <Button variant="ghost" className="mt-5" onClick={portal}>Revenir à Découverte</Button>
                  ) : (
                    <Button className="mt-5" variant={highlighted ? "primary" : "secondary"} disabled={!!busy} onClick={() => choose(p.id as "pro" | "agency")}>{busy === p.id ? <Spinner /> : `Passer à ${p.name}`}</Button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-lg tracking-tight">Factures</h2>
          {billing.data?.invoices.length ? (
            <table className="mt-4 w-full text-sm">
              <thead className="text-left text-fg-faint"><tr><th className="py-2 font-normal">Numéro</th><th className="py-2 font-normal">Date</th><th className="py-2 font-normal">Montant</th><th className="py-2 font-normal" /></tr></thead>
              <tbody>
                {billing.data.invoices.map((i) => (
                  <tr key={i.id} className="border-t border-black/[0.05]">
                    <td className="py-3">{i.number}</td><td className="py-3 text-fg-muted">{formatDate(i.createdAt)}</td><td className="py-3 tabular-nums">{formatMoney(i.amount, i.currency)}</td>
                    <td className="py-3 text-right"><a href={i.pdfUrl} className="text-fg-muted hover:text-fg">PDF</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="mt-3 text-sm text-fg-muted">Aucune facture pour l'instant.</p>}
        </section>
      </div>
    </>
  );
}

export default function BillingPage() {
  return <Suspense><Billing /></Suspense>;
}
