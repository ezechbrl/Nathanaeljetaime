"use client";

import { ExternalLink } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useApp } from "@/components/app/AppContext";
import { PageHeader } from "@/components/app/PageHeader";
import { Paywall } from "@/components/app/Paywall";
import { Button, Spinner } from "@/components/ui/Button";
import { AiBudgetMeter, Meter, Skeleton } from "@/components/ui/Feedback";
import { useToast } from "@/components/ui/Toast";
import * as api from "@/lib/api/client";
import { useApi } from "@/lib/api/hooks";
import { PLANS, euro } from "@/lib/content/pricing";
import { formatDate, formatMoney } from "@/lib/format";

function Billing() {
  const { refresh } = useApp();
  const params = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const billing = useApi(() => api.getBilling(params.get("checkout") === "success"), []);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (params.get("checkout") === "success") {
      toast("Abonnement activé, merci !");
      refresh();
      router.replace("/app/abonnement");
    }
  }, [params, refresh, router, toast]);

  async function portal() {
    setBusy("portal");
    try {
      const { url } = await api.openBillingPortal();
      window.location.href = url;
    } catch (e) {
      toast((e as Error).message, "error");
      setBusy(null);
    }
  }

  const sub = billing.data?.subscription;
  if (sub?.plan === "free") {
    return (
      <>
        <PageHeader title="Abonnement" />
        <div className="p-5 sm:p-8"><Paywall initialInterval={params.get("interval") === "year" ? "year" : "month"} /></div>
      </>
    );
  }
  const usage = billing.data?.usage;
  const current = PLANS.find((p) => p.id === sub?.plan);

  return (
    <>
      <PageHeader title="Abonnement" />
      <div className="space-y-8 p-5 sm:p-8">
        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <section className="surface rounded-card p-5">
            <p className="text-sm text-fg-muted">Offre actuelle</p>
            {sub ? (
              <>
                <p className="mt-2 text-3xl tracking-tight">{current?.name}</p>
                <p className="mt-1 text-sm text-fg-muted">{sub.interval === "year" ? `${euro(current?.yearly ?? 0)} / an` : `${euro(current?.monthly ?? 0)} / mois`} · {sub.renewsAt ? `${sub.cancelAtPeriodEnd ? "Se termine" : "Renouvellement"} le ${formatDate(sub.renewsAt)}` : "Abonnement actif"}</p>
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

        <section className="surface rounded-card p-5">
          <h2 className="text-lg tracking-tight">Gérer mon abonnement</h2>
          <p className="mt-2 text-sm text-fg-muted">Change d'offre ou de carte, passe à l'annuel ou arrête ton abonnement en un clic. Si tu arrêtes, tout ce qui a été créé reste dans ta boutique.</p>
          <Button variant="secondary" className="mt-4" onClick={portal} disabled={busy === "portal"}>{busy === "portal" ? <Spinner /> : <ExternalLink className="h-4 w-4" />} Gérer mon abonnement</Button>
        </section>

        <section>
          <h2 className="text-lg tracking-tight">Factures</h2>
          {billing.data?.invoices.length ? (
            <table className="mt-4 w-full text-sm">
              <thead className="text-left text-fg-faint"><tr><th className="py-2 font-normal">Numéro</th><th className="py-2 font-normal">Date</th><th className="py-2 font-normal">Montant</th><th className="py-2 font-normal" /></tr></thead>
              <tbody>
                {billing.data.invoices.map((i) => (
                  <tr key={i.id} className="border-t border-white/[0.05]">
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
