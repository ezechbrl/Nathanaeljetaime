"use client";

import { Check, ShieldCheck, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Spinner } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import * as api from "@/lib/api/client";
import { useApi } from "@/lib/api/hooks";
import { cn } from "@/lib/cn";
import { ShopifyForm } from "@/components/auth/AuthForms";
import type { GenerateStoreInput } from "@/lib/api/types";
import { PLANS, euro } from "@/lib/content/pricing";

export const PENDING_BRIEF_KEY = "vitrio-pending-brief";

// Projet saisi avant l'activation : il est relancé tout seul au retour du paiement.
export type PendingDraft = GenerateStoreInput & { autostart?: boolean };

export function readPendingDraft(): PendingDraft | null {
  try {
    const raw = localStorage.getItem(PENDING_BRIEF_KEY);
    if (!raw) return null;
    localStorage.removeItem(PENDING_BRIEF_KEY);
    try {
      const v = JSON.parse(raw) as PendingDraft;
      if (v && typeof v.brief === "string") return v;
    } catch {
      // ancien format : texte brut
    }
    return { mode: "start", brief: raw, language: "français" };
  } catch {
    return null;
  }
}

// Écran d'activation : sans abonnement, l'IA n'est pas disponible (pas d'offre gratuite).
export function Paywall({ brief, draft }: { brief?: string; draft?: GenerateStoreInput }) {
  const pro = PLANS.find((p) => p.id === "pro")!;
  const toast = useToast();
  const [yearly, setYearly] = useState(false);
  const [busy, setBusy] = useState(false);

  const connections = useApi(() => api.listConnections(), []);
  const needShop = !!connections.data && !connections.data.connections.some((c) => c.status === "active");

  // Le projet en cours est gardé pour reprendre là où on en était au retour.
  function savePending(autostart = true) {
    try {
      if (draft) localStorage.setItem(PENDING_BRIEF_KEY, JSON.stringify({ ...draft, autostart }));
      else if (brief) localStorage.setItem(PENDING_BRIEF_KEY, JSON.stringify({ mode: "start", brief, language: "français" }));
    } catch {
      // stockage indisponible : le brief sera simplement à retaper
    }
  }

  async function activate() {
    setBusy(true);
    savePending();
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
      <h2 className="mt-3 text-h3">{draft ? "Ta boutique est prête à être construite" : "Active Vitrio Pro pour créer ta boutique"}</h2>
      {draft && <p className="mt-2 text-[15px] text-fg-muted">Active Vitrio Pro : la génération démarre toute seule dès ton retour, avec tout ce que tu as rempli.</p>}
      {(draft?.brief || brief) && <Recap text={draft?.brief || brief!} />}

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
      {needShop ? (
        // L'abonnement est réglé sur la facture Shopify : il faut d'abord relier (ou créer) sa boutique.
        <div className="mt-7">
          <p className="mb-3 text-sm text-fg-muted">Pour t'abonner, relie ta boutique Shopify : le paiement passe par ta facture Shopify.</p>
          <ShopifyForm next="/app" onBeforeRedirect={savePending} />
        </div>
      ) : (
        <Button size="lg" className="mt-7 w-full" onClick={activate} disabled={busy}>
          {busy ? <Spinner /> : "Activer Vitrio Pro"}
        </Button>
      )}
      <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-fg-faint">
        <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0" />
        Paiement sécurisé par Shopify, ajouté à ta facture Shopify. Sans engagement : tu arrêtes en un clic et tu gardes tout ce qui a été créé.
      </p>
    </div>
  );
}

function Recap({ text }: { text: string }) {
  return <p className="mt-3 rounded-ctl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-fg-muted">Ton projet : « {text.length > 120 ? `${text.slice(0, 120)}…` : text} »</p>;
}

// Le même écran, par-dessus le formulaire de création.
export function PaywallDialog({ draft, onClose }: { draft: GenerateStoreInput; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <div role="dialog" aria-modal="true" aria-label="Activer Vitrio Pro" className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm [animation:fade-in_.2s_ease-out] sm:items-center" onClick={onClose}>
      <div className="relative w-full max-w-[560px] [animation:rise_.35s_cubic-bezier(.2,.8,.2,1)]" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Fermer" className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-fg-muted hover:bg-white/10 hover:text-fg"><X className="h-4 w-4" /></button>
        <Paywall draft={draft} />
      </div>
    </div>
  );
}
