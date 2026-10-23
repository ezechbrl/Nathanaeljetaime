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

  const [changing, setChanging] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  async function cancel() {
    setBusy("cancel");
    try {
      await api.cancelSubscription();
      toast("Abonnement arrêté. Tout ce qui a été créé reste dans ta boutique.");
      refresh();
      billing.reload?.();
      window.location.reload();
    } catch (e) {
      toast((e as Error).message, "error");
      setBusy(null);
    }
  }

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
  const gifted = Boolean(sub && !sub.interval && !sub.renewsAt);

  return (
    <>
      <PageHeader title="Abonnement" />
      <div className="space-y-8 p-5 sm:p-8">
        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          {/* Ton abonnement, en grand, avec le prix réellement payé (offre de lancement comprise) */}
          <section className="glow-frame relative overflow-hidden rounded-[22px] p-[1.5px]">
            <div className="h-full rounded-[21px] bg-[linear-gradient(180deg,rgb(8_40_31/0.95),rgb(4_20_15/0.97))] p-6 sm:p-8">
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#6ee7b7]">Ton abonnement</p>
              {sub ? (
                <>
                  <p className="mt-3 text-[clamp(2.2rem,1.6rem+2vw,3.2rem)] font-semibold leading-none tracking-[-0.03em]">Vigenia {current?.name}</p>
                  {/* Accès donné à la main (pas d'abonnement Shopify) : rien n'est facturé. */}
                  {gifted ? (
                    <p className="mt-4 text-[2.4rem] font-semibold leading-none tracking-[-0.03em]">Accès offert</p>
                  ) : (
                  <p className="mt-4 flex items-baseline gap-2">
                    <span className="text-[2.4rem] font-semibold leading-none tracking-[-0.03em] tabular-nums">{sub.amount ? formatMoney(sub.amount, sub.currency ?? "EUR") : euro(sub.interval === "year" ? current?.yearly ?? 0 : current?.monthly ?? 0)}</span>
                    <span className="text-fg-muted">{sub.interval === "year" ? "/ an" : "/ mois"}</span>
                    {sub.amount != null && current && sub.amount < (sub.interval === "year" ? current.yearly : current.monthly) * 100 && (
                      <span className="ml-1 rounded-full bg-[#2ee6a6]/15 px-2.5 py-1 text-[12px] font-semibold text-[#a7f3d0]">Prix de lancement à vie</span>
                    )}
                  </p>
                  )}
                  <p className="mt-3 text-sm text-fg-muted">{gifted ? "Rien n'est facturé sur ce compte." : sub.renewsAt ? `${sub.cancelAtPeriodEnd ? "Se termine" : "Prochain paiement"} le ${formatDate(sub.renewsAt)}` : "Abonnement actif"}</p>
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

        {sub && <section className="surface rounded-card p-5">
          <h2 className="text-lg tracking-tight">{gifted ? "Changer d'offre" : "Changer ou arrêter mon abonnement"}</h2>
          <p className="mt-2 text-sm text-fg-muted">{gifted
            ? "Ton accès est offert. Tu peux quand même choisir une offre : elle sera ajoutée à ta facture Shopify."
            : "Ton abonnement Vigenia est ajouté à ta facture Shopify : tes factures sont dans ton admin Shopify (Paramètres → Facturation). Si tu arrêtes, tout ce qui a été créé reste dans ta boutique."}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setChanging((v) => !v)}>Changer d'offre</Button>
            {!gifted && <><Button variant="secondary" onClick={portal} disabled={busy === "portal"}>{busy === "portal" ? <Spinner /> : <ExternalLink className="h-4 w-4" />} Mes factures Shopify</Button>
            {confirmCancel ? (
              <span className="flex items-center gap-2 text-sm">Arrêter maintenant ?
                <Button variant="danger" size="sm" onClick={cancel} disabled={busy === "cancel"}>{busy === "cancel" ? <Spinner /> : "Oui, arrêter"}</Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmCancel(false)}>Annuler</Button>
              </span>
            ) : <Button variant="ghost" onClick={() => setConfirmCancel(true)}>Arrêter mon abonnement</Button>}</>}
          </div>
        </section>}
        {changing && <Paywall initialInterval={sub?.interval === "year" ? "year" : "month"} />}
      </div>
    </>
  );
}

export default function BillingPage() {
  return <Suspense><Billing /></Suspense>;
}
