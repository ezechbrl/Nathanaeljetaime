"use client";

import { ArrowRight, Camera, MessageCircle, Star, Store, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import * as api from "@/lib/api/client";
import { useApi } from "@/lib/api/hooks";
import { site } from "@/lib/site";
import { cn } from "@/lib/cn";
import { ShopifyForm } from "@/components/auth/AuthForms";
import type { GenerateStoreInput } from "@/lib/api/types";
import { PLANS, euro } from "@/lib/content/pricing";

// Les 4 raisons d'acheter, chacune avec sa couleur.
const PERKS = [
  { icon: Store, title: "Boutique complète", sub: "prête en 5 minutes", color: "#34d399" },
  { icon: Camera, title: "Photos de pro", sub: "+ ton produit en situation", color: "#5eead4" },
  { icon: Star, title: "Vrais avis clients", sub: "étoiles et photos", color: "#fcd34d" },
  { icon: MessageCircle, title: "Éditeur IA", sub: "tu modifies en discutant", color: "#a3e635" },
];

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

  const perMonth = yearly ? Math.round(pro.yearly / 12) : pro.monthly;
  return (
    <div className="mx-auto w-full max-w-[500px] rounded-[22px] bg-[linear-gradient(160deg,rgb(52_211_153/0.7),rgb(255_255_255/0.08)_40%,rgb(52_211_153/0.35))] p-px shadow-[0_40px_90px_-40px_rgb(0_0_0/0.9),0_0_60px_-20px_rgb(16_176_127/0.35)]">
      <div className="rounded-[21px] p-6 sm:p-7" style={{ background: "radial-gradient(120% 70% at 50% 0%, rgb(16 176 127 / 0.16), transparent 60%), #070b0a" }}>
        <p className="w-fit bg-[linear-gradient(90deg,#34d399,#a3e635,#fcd34d)] bg-clip-text text-xs font-bold uppercase tracking-[0.2em] text-transparent">Vitrio Pro</p>
        <h2 className="mt-2 text-[1.65rem] font-semibold leading-tight tracking-[-0.02em]">{draft ? "Ta boutique t'attend 🚀" : "Une boutique qui vend. En 5 minutes."}</h2>
        {draft?.brief || brief ? <Recap text={draft?.brief || brief!} /> : connections.data && (
          <p className="mt-2 text-sm text-fg-muted">{needShop ? "Ta marque en ligne en 10 minutes, sans freelance ni designer." : "Tu as déjà Shopify : Vitrio te fait gagner des semaines."}</p>
        )}

        <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
          <p className="flex items-baseline gap-1.5">
            <span className="text-5xl font-semibold tracking-[-0.04em] tabular-nums">{euro(perMonth)}</span>
            <span className="text-sm text-fg-muted">/ mois</span>
          </p>
          <div className="flex rounded-full bg-white/[0.06] p-1 text-[12.5px]" role="radiogroup" aria-label="Période">
            {[{ v: false, l: "Mensuel" }, { v: true, l: "Annuel −2 mois" }].map((o) => (
              <button key={o.l} type="button" role="radio" aria-checked={yearly === o.v} onClick={() => setYearly(o.v)} className={cn("rounded-full px-3 py-1 transition-colors", yearly === o.v ? "bg-accent text-[#04110d]" : "text-fg-muted hover:text-fg")}>{o.l}</button>
            ))}
          </div>
        </div>
        <p className="mt-1 text-[13px] text-fg-faint">{yearly ? `${euro(pro.yearly)} par an, soit ${euro(pro.monthly * 12 - pro.yearly)} d'économie` : "Un freelance te demanderait 800 à 2 000 €."}</p>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          {PERKS.map(({ icon: I, title, sub, color }) => (
            <div key={title} className="rounded-[14px] border p-3" style={{ borderColor: `${color}33`, background: `${color}14` }}>
              <I className="h-5 w-5" style={{ color }} />
              <p className="mt-2 text-[14px] font-semibold leading-tight">{title}</p>
              <p className="mt-0.5 text-[12px] leading-snug text-fg-muted">{sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-5">
          {needShop ? (
            // L'abonnement est réglé sur la facture Shopify : il faut d'abord relier (ou créer) sa boutique.
            <div>
              <p className="mb-3 text-[13px] text-fg-muted">Le paiement passe par ta facture Shopify. Pas encore de compte ? Shopify coûte <strong className="text-fg">{site.shopifyOffer}</strong>.</p>
              <ShopifyForm next="/app" onBeforeRedirect={savePending} />
            </div>
          ) : (
            <button type="button" onClick={activate} disabled={busy} className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-[14px] border border-accent/40 bg-[linear-gradient(180deg,#10b07f,#00876a)] text-[15px] font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_12px_30px_-10px_rgb(0_166_118/0.6)] transition-transform hover:-translate-y-px disabled:opacity-60">
              {busy ? <Spinner /> : <>Activer Vitrio Pro <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>}
            </button>
          )}
        </div>
        <p className="mt-3 text-center text-[12px] text-fg-faint">Sans engagement · Payé via Shopify · Ta boutique reste à toi</p>
      </div>
    </div>
  );
}

function Recap({ text }: { text: string }) {
  return <p className="mt-2 truncate text-sm text-fg-muted">« {text} »</p>;
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
      <div className="relative my-auto w-full max-w-[500px] [animation:rise_.35s_cubic-bezier(.2,.8,.2,1)]" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Fermer" className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-fg-muted hover:bg-white/10 hover:text-fg"><X className="h-4 w-4" /></button>
        <Paywall draft={draft} />
      </div>
    </div>
  );
}
