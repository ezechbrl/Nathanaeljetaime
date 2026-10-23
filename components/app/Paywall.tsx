"use client";

import { ArrowRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import * as api from "@/lib/api/client";
import type { GenerateStoreInput } from "@/lib/api/types";
import { AuroraBackground, IntervalToggle, OfferBanner, PlanCards, TrustRow, planButtonClass, planPrice, useCountdown, type Interval } from "@/components/pricing/PlanCards";
import { useApi } from "@/lib/api/hooks";
import { euro, type Plan } from "@/lib/content/pricing";

export const PENDING_BRIEF_KEY = "vitrio-pending-brief";
// Boutique d'aperçu à débloquer au retour du paiement.
export const UNLOCK_KEY = "vg-unlock";

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

// Écran d'abonnement : sans abonnement, l'IA n'est pas disponible (pas d'offre gratuite).
export function Paywall({ brief, draft, unlockStoreId, initialInterval = "month" }: { brief?: string; draft?: GenerateStoreInput; unlockStoreId?: string; initialInterval?: Interval }) {
  const toast = useToast();
  const [interval, setPeriod] = useState<Interval>(initialInterval);
  const [busy, setBusy] = useState<string | null>(null);
  const billing = useApi(() => api.getBilling(), []);
  const left = useCountdown(billing.data?.offerEndsAt);

  // Le projet en cours est gardé pour reprendre là où on en était au retour du paiement.
  function savePending() {
    try {
      if (unlockStoreId) return localStorage.setItem(UNLOCK_KEY, unlockStoreId);
      if (draft) localStorage.setItem(PENDING_BRIEF_KEY, JSON.stringify({ ...draft, autostart: true }));
      else if (brief) localStorage.setItem(PENDING_BRIEF_KEY, JSON.stringify({ mode: "start", brief, language: "français", autostart: true }));
    } catch {
      // stockage indisponible : le brief sera simplement à retaper
    }
  }

  // Page de paiement Shopify créée au clic (chaque préparation crée une demande de paiement chez Shopify).
  const sessions = useRef(new Map<string, Promise<{ url: string }>>());
  function prepare(plan: Plan["id"], iv: Interval) {
    const key = `${plan}:${iv}`;
    let p = sessions.current.get(key);
    if (!p) {
      p = api.startCheckout(plan as "pro" | "agency", iv);
      p.catch(() => sessions.current.delete(key));
      sessions.current.set(key, p);
    }
    return p;
  }

  async function subscribe(plan: Plan, iv: Interval) {
    setBusy(plan.id);
    savePending();
    try {
      const { url } = await prepare(plan.id, iv);
      window.location.href = url;
    } catch (e) {
      toast((e as Error).message, "error");
      setBusy(null);
    }
  }

  const text = draft?.brief || brief;
  return (
    <div className="relative isolate overflow-hidden rounded-[26px] border border-white/10 px-4 py-8 sm:px-8 sm:py-10">
      <AuroraBackground className="-z-10" />
      {left && <div className="mb-6"><OfferBanner left={left} /></div>}
      {text && !unlockStoreId && <p className="mx-auto max-w-xl truncate text-center text-[13px] text-fg-muted">Ton projet est gardé : <span className="italic text-fg">« {text} »</span></p>}
      <h2 className="mt-3 text-center text-[clamp(1.7rem,1.2rem+1.6vw,2.4rem)] font-semibold tracking-[-0.03em]">{unlockStoreId ? "Débloque ta boutique" : draft ? "Ta boutique t'attend 🚀" : "Choisis ton offre"}</h2>
      <p className="mt-1.5 text-center text-sm text-fg-muted">Une boutique Shopify complète, prête à vendre en 10 minutes.</p>
      <div className="mt-6"><IntervalToggle value={interval} onChange={setPeriod} /></div>
      <div className="mx-auto mt-7 max-w-[760px]">
        <PlanCards
          interval={interval}
          left={left}
          action={(plan, iv) => (
            <button type="button" onClick={() => subscribe(plan, iv)} disabled={!!busy} className={planButtonClass(plan.featured)}>
              {busy === plan.id ? <Spinner /> : <>{unlockStoreId ? "Débloquer" : "Payer"} {euro(planPrice(plan, iv, !!left).billed)}{unlockStoreId ? "" : " et créer"} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>}
            </button>
          )}
        />
        <TrustRow />
      </div>
    </div>
  );
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
    <div role="dialog" aria-modal="true" aria-label="Choisir mon abonnement" className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm [animation:fade-in_.2s_ease-out] sm:items-center" onClick={onClose}>
      <div className="relative my-auto w-full max-w-[860px] [animation:rise_.35s_cubic-bezier(.2,.8,.2,1)]" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Fermer" className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-fg-muted hover:bg-white/10 hover:text-fg"><X className="h-4 w-4" /></button>
        <Paywall draft={draft} />
      </div>
    </div>
  );
}
