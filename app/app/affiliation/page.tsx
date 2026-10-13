"use client";

import { Copy, Gift } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/components/app/AppContext";
import { PageHeader } from "@/components/app/PageHeader";
import { Button, Spinner } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Feedback";
import { useToast } from "@/components/ui/Toast";
import * as api from "@/lib/api/client";
import { useApi } from "@/lib/api/hooks";
import { AFFILIATE } from "@/lib/content/affiliate";
import { formatMoney } from "@/lib/format";

export default function AffiliateDashboard() {
  const { user } = useApp();
  const toast = useToast();
  const aff = useApi(() => api.getAffiliate(), []);
  const [email, setEmail] = useState(user.email);
  const [joining, setJoining] = useState(false);

  async function join(e: React.FormEvent) {
    e.preventDefault();
    setJoining(true);
    try {
      const res = await api.joinAffiliate(email);
      aff.setData(res);
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setJoining(false);
    }
  }

  const a = aff.data?.affiliate;
  return (
    <>
      <PageHeader title="Affiliation" subtitle={`${AFFILIATE.rate * 100} % de commission pendant ${AFFILIATE.months} mois sur chaque client recommandé.`} />
      <div className="p-5 sm:p-8">
        {aff.loading && !aff.data ? <Skeleton className="h-40" /> : !a ? (
          <form onSubmit={join} className="surface max-w-lg rounded-card p-6">
            <Gift className="h-6 w-6 text-accent" />
            <h2 className="mt-4 text-xl tracking-tight">Active ton lien d'affiliation</h2>
            <p className="mt-2 text-sm text-fg-muted">Partage ton lien : chaque personne qui crée un compte dans les {AFFILIATE.cookieDays} jours t'est attribuée.</p>
            <label className="mt-5 block text-sm">E-mail pour recevoir les paiements<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field mt-1.5" /></label>
            <Button type="submit" className="mt-4" disabled={joining}>{joining ? <Spinner /> : "Activer"}</Button>
            <p className="mt-3 text-xs text-fg-faint">En activant, tu acceptes les <a href="/legal/conditions-affiliation" className="underline">conditions d'affiliation</a>.</p>
          </form>
        ) : (
          <div className="space-y-6">
            <section className="surface-accent rounded-card p-5">
              <p className="text-sm text-fg-muted">Ton lien</p>
              <div className="mt-2 flex gap-2">
                <input readOnly value={a.link} className="field font-mono text-sm" onFocus={(e) => e.currentTarget.select()} aria-label="Lien d'affiliation" />
                <Button variant="secondary" onClick={() => { navigator.clipboard?.writeText(a.link); toast("Lien copié"); }}><Copy className="h-4 w-4" /> Copier</Button>
              </div>
            </section>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              {[
                ["Clics", String(a.stats.clicks)], ["Inscriptions", String(a.stats.signups)], ["Clients payants", String(a.stats.paidCustomers)],
                ["Gagné", formatMoney(a.stats.earned)], ["En attente", formatMoney(a.stats.pending)],
              ].map(([k, v]) => (
                <div key={k} className="rounded-card border border-white/[0.07] p-4"><p className="text-xs text-fg-muted">{k}</p><p className="mt-2 text-2xl tracking-tight tabular-nums">{v}</p></div>
              ))}
            </div>
            <p className="text-sm text-fg-muted">Paiement mensuel à {a.payoutEmail} dès {AFFILIATE.minPayout} € de commissions validées.</p>
          </div>
        )}
      </div>
    </>
  );
}
