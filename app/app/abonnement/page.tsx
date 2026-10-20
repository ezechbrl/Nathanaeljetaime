"use client";

import { ExternalLink } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useApp } from "@/components/app/AppContext";
import { PageHeader } from "@/components/app/PageHeader";
import { Paywall } from "@/components/app/Paywall";
import { Button, Spinner } from "@/components/ui/Button";
import { Skeleton, UsagePercent } from "@/components/ui/Feedback";
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
        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          {/* Ton abonnement, en grand, avec le prix réellement payé (offre de lancement comprise) */}
          <section className="relative overflow-hidden rounded-[22px] bg-[linear-gradient(160deg,#2ee6a6,rgb(255_255_255/0.08)_45%,rgb(46_230_166/0.45))] p-px shadow-[0_0_60px_-20px_rgb(46_230_166/0.55)]">
            <div className="h-full rounded-[21px] bg-[linear-gradient(180deg,rgb(8_40_31/0.95),rgb(4_20_15/0.97))] p-6 sm:p-8">
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#6ee7b7]">Ton abonnement</p>
              {sub ? (
                <>
                  <p className="mt-3 text-[clamp(2.2rem,1.6rem+2vw,3.2rem)] font-semibold leading-none tracking-[-0.03em]">Vitrio {current?.name}</p>
                  {/* Accès donné à la main (pas d'abonnement Stripe) : rien n'est facturé. */}
                  {!sub.interval && !sub.renewsAt ? (
                    <p className="mt-4 text-[2.4rem] font-semibold leading-none tracking-[-0.03em]">Accès offert</p>
                  ) : (
                  <p className="mt-4 flex items-baseline gap-2">
                    <span className="text-[2.4rem] font-semibold leading-none tracking-[-0.03em] tabular-nums">{sub.amount ? formatMoney(sub.amount, "EUR") : euro(sub.interval === "year" ? current?.yearly ?? 0 : current?.monthly ?? 0)}</span>
                    <span className="text-fg-muted">{sub.interval === "year" ? "/ an" : "/ mois"}</span>
                    {sub.amount != null && current && sub.amount < (sub.interval === "year" ? current.yearly : current.monthly) * 100 && (
                      <span className="ml-1 rounded-full bg-[#2ee6a6]/15 px-2.5 py-1 text-[12px] font-semibold text-[#a7f3d0]">Prix de lancement à vie</span>
                    )}
                  </p>
                  )}
                  <p className="mt-3 text-sm text-fg-muted">{!sub.interval && !sub.renewsAt ? "Rien n'est facturé sur ce compte." : sub.renewsAt ? `${sub.cancelAtPeriodEnd ? "Se termine" : "Prochain paiement"} le ${formatDate(sub.renewsAt)}` : "Abonnement actif"}</p>
                </>
              ) : <Skeleton className="mt-3 h-12 w-56" />}
            </div>
          </section>
          <section className="surface rounded-card p-5">
            <p className="text-sm text-fg-muted">Utilisation</p>
            {usage ? (
              <div className="mt-4 space-y-4">
                <UsagePercent usage={usage} />
                <p className="text-xs text-fg-faint">Le crédit IA se recharge tout seul toutes les quelques heures. Les images repartent à zéro le {formatDate(usage.resetsAt)}.</p>
              </div>
            ) : <Skeleton className="mt-4 h-24" />}
          </section>
        </div>

        {!(sub && !sub.interval && !sub.renewsAt) && <section className="surface rounded-card p-5">
          <h2 className="text-lg tracking-tight">Changer ou arrêter mon abonnement</h2>
          <p className="mt-2 text-sm text-fg-muted">Sur la page sécurisée de Stripe, tu peux : changer de carte bancaire, passer de Starter à Pro (ou à l'annuel), télécharger tes factures, ou arrêter ton abonnement en un clic. Si tu arrêtes, tout ce qui a été créé reste dans ta boutique.</p>
          <Button variant="secondary" className="mt-4" onClick={portal} disabled={busy === "portal"}>{busy === "portal" ? <Spinner /> : <ExternalLink className="h-4 w-4" />} Gérer mon abonnement</Button>
        </section>}

        {!(sub && !sub.interval && !sub.renewsAt && !billing.data?.invoices.length) && <section>
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
        </section>}
      </div>
    </>
  );
}

export default function BillingPage() {
  return <Suspense><Billing /></Suspense>;
}
