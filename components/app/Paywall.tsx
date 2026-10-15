"use client";

import { Check, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button, Spinner } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import * as api from "@/lib/api/client";
import { cn } from "@/lib/cn";
import { PLANS, euro } from "@/lib/content/pricing";

export const PENDING_BRIEF_KEY = "vitrio-pending-brief";

// Écran d'activation : sans abonnement, l'IA n'est pas disponible (pas d'offre gratuite).
export function Paywall({ brief }: { brief?: string }) {
  const pro = PLANS.find((p) => p.id === "pro")!;
  const toast = useToast();
  const [yearly, setYearly] = useState(false);
  const [busy, setBusy] = useState(false);

  async function activate() {
    setBusy(true);
    try {
      if (brief) localStorage.setItem(PENDING_BRIEF_KEY, brief);
    } catch {
      // stockage indisponible : le brief sera simplement à retaper
    }
    try {
      const { url } = await api.startCheckout("pro", yearly ? "year" : "month");
      window.location.href = url;
    } catch (e) {
      toast((e as Error).message, "error");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[560px] rounded-[18px] border border-accent/25 bg-[linear-gradient(180deg,rgb(var(--accent-deep)/0.45),rgb(var(--bg-2)/0.9))] p-6 shadow-[0_40px_80px_-40px_rgb(0_0_0/0.8)] sm:p-8">
      <p className="flex items-center gap-2 text-sm text-accent"><Sparkles className="h-4 w-4" /> Dernière étape</p>
      <h2 className="mt-3 text-h3">Active Vitrio Pro pour créer ta boutique</h2>
      {brief && <p className="mt-3 rounded-ctl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-fg-muted">Ton projet : « {brief.length > 120 ? `${brief.slice(0, 120)}…` : brief} »</p>}

      <div className="mt-6 flex w-fit rounded-full border border-white/10 p-1 text-[13px]" role="radiogroup" aria-label="Période">
        {[{ v: false, l: "Mensuel" }, { v: true, l: "Annuel · 2 mois offerts" }].map((o) => (
          <button key={o.l} type="button" role="radio" aria-checked={yearly === o.v} onClick={() => setYearly(o.v)} className={cn("rounded-full px-3 py-1 transition-colors", yearly === o.v ? "bg-white/[0.1] text-fg" : "text-fg-muted hover:text-fg")}>{o.l}</button>
        ))}
      </div>
      <p className="mt-4 flex items-baseline gap-1.5">
        <span className="text-5xl tracking-[-0.04em] tabular-nums">{euro(yearly ? Math.round(pro.yearly / 12) : pro.monthly)}</span>
        <span className="text-sm text-fg-muted">/ mois{yearly ? ` · facturé ${euro(pro.yearly)} par an` : ""}</span>
      </p>
      <ul className="mt-5 grid gap-2 text-[15px] sm:grid-cols-2">
        {pro.features.map((f) => <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{f}</li>)}
      </ul>
      <Button size="lg" className="mt-7 w-full" onClick={activate} disabled={busy}>
        {busy ? <Spinner /> : "Activer Vitrio Pro"}
      </Button>
      <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-fg-faint">
        <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0" />
        Paiement sécurisé par Shopify, ajouté à ta facture Shopify. Sans engagement : tu arrêtes en un clic et tu gardes tout ce qui a été créé.
      </p>
    </div>
  );
}
