"use client";

import { Camera, Check, MessageCircle, RefreshCw, ShieldCheck, Sparkles, Star, Store, X, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Spinner } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import * as api from "@/lib/api/client";
import { useApi } from "@/lib/api/hooks";
import { site } from "@/lib/site";
import { cn } from "@/lib/cn";
import { ShopifyForm } from "@/components/auth/AuthForms";
import type { GenerateStoreInput } from "@/lib/api/types";
import { PLANS, PRO_FAQ, PRO_GROUPS, WITHOUT_VITRIO, euro } from "@/lib/content/pricing";

const GROUP_ICONS: Record<(typeof PRO_GROUPS)[number]["icon"], LucideIcon> = { store: Store, camera: Camera, star: Star, chat: MessageCircle };

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
  const action = needShop ? (
    // L'abonnement est réglé sur la facture Shopify : il faut d'abord relier (ou créer) sa boutique.
    <div>
      <p className="mb-3 text-sm text-fg-muted">Pour t'abonner, relie ta boutique Shopify : le paiement passe par ta facture Shopify. Pas encore de compte ? Shopify coûte en ce moment <strong className="text-fg">{site.shopifyOffer}</strong> : ton premier mois de boutique complète te revient à environ {euro(pro.monthly + 1)}.</p>
      <ShopifyForm next="/app" onBeforeRedirect={savePending} />
    </div>
  ) : (
    <Button size="lg" className="w-full" onClick={activate} disabled={busy}>
      {busy ? <Spinner /> : "Activer Vitrio Pro"}
    </Button>
  );

  return (
    <div className="mx-auto w-full max-w-[780px] overflow-hidden rounded-[20px] border border-accent/25 bg-[linear-gradient(180deg,rgb(var(--accent-deep)/0.45),rgb(var(--bg-2)/0.92))] shadow-[0_40px_80px_-40px_rgb(0_0_0/0.8)]">
      <div className="p-6 sm:p-8">
        <p className="flex items-center gap-2 text-sm text-accent"><Sparkles className="h-4 w-4" /> {draft ? "Dernière étape" : "Vitrio Pro"}</p>
        <h2 className="mt-3 text-h3">{draft ? "Ta boutique est prête à être construite" : "Tout ce qu'il faut pour lancer une boutique qui vend"}</h2>
        <p className="mt-2 text-[15px] text-fg-muted">{draft ? "Active Vitrio Pro : la génération démarre toute seule dès ton retour, avec tout ce que tu as rempli." : "Boutique, photos, avis, textes de vente et éditeur IA : une seule offre, tout compris."}</p>
        {(draft?.brief || brief) && <Recap text={draft?.brief || brief!} />}

        <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_1.05fr] sm:items-center">
          <div>
            <div className="flex w-fit rounded-full border border-white/10 p-1 text-[13px]" role="radiogroup" aria-label="Période">
              {[{ v: false, l: "Mensuel" }, { v: true, l: "Annuel · 2 mois offerts" }].map((o) => (
                <button key={o.l} type="button" role="radio" aria-checked={yearly === o.v} onClick={() => setYearly(o.v)} className={cn("rounded-full px-3 py-1 transition-colors", yearly === o.v ? "bg-white/[0.1] text-fg" : "text-fg-muted hover:text-fg")}>{o.l}</button>
              ))}
            </div>
            <p className="mt-4 flex items-baseline gap-1.5">
              <span className="text-5xl tracking-[-0.04em] tabular-nums">{euro(perMonth)}</span>
              <span className="text-sm text-fg-muted">/ mois</span>
            </p>
            <p className="mt-1 text-sm text-fg-muted">{yearly ? `Facturé ${euro(pro.yearly)} par an, soit ${euro(pro.monthly * 12 - pro.yearly)} d'économie.` : `Soit environ ${euro(Math.round((pro.monthly / 30) * 100) / 100)} par jour.`}</p>
          </div>
          <div className="rounded-[14px] border border-white/[0.08] bg-black/15 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-fg-faint">Sans Vitrio, il faudrait payer</p>
            <ul className="mt-2.5 space-y-1.5 text-sm">
              {WITHOUT_VITRIO.map((w) => <li key={w.label} className="flex justify-between gap-3"><span className="text-fg-muted">{w.label}</span><span className="shrink-0 whitespace-nowrap tabular-nums text-fg-muted line-through decoration-white/30">{w.price}</span></li>)}
            </ul>
            <p className="mt-2.5 border-t border-white/[0.08] pt-2.5 text-sm"><strong className="text-accent">Avec Vitrio : {euro(perMonth)} / mois</strong>, tout compris.</p>
          </div>
        </div>

        {connections.data && !needShop && (
          <p className="mt-5 rounded-ctl border border-accent/20 bg-accent-deep/25 px-3 py-2.5 text-sm text-fg-muted">Tu as déjà ta boutique Shopify : Vitrio te fait gagner des semaines. Design pro, photos du produit, textes et offres pensés pour vendre, prêts en quelques minutes.</p>
        )}
        <div className="mt-6">{action}</div>
        <Reassurance />
      </div>

      <div className="grid gap-px border-t border-white/[0.08] bg-white/[0.06] sm:grid-cols-2">
        {PRO_GROUPS.map((g) => {
          const I = GROUP_ICONS[g.icon];
          return (
            <div key={g.title} className="bg-bg-2/80 p-5 sm:p-6">
              <p className="flex items-center gap-2.5 font-medium"><span className="grid h-8 w-8 place-items-center rounded-lg bg-accent/15 text-accent"><I className="h-4 w-4" /></span>{g.title}</p>
              <ul className="mt-3 space-y-2 text-sm text-fg-muted">
                {g.items.map((f) => <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{f}</li>)}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Reassurance() {
  return (
    <div className="mt-4 grid gap-2 text-xs text-fg-faint sm:grid-cols-3">
      <p className="flex items-start gap-1.5"><ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0 text-accent" />Paiement sécurisé par Shopify, sur ta facture Shopify</p>
      <p className="flex items-start gap-1.5"><RefreshCw className="mt-px h-3.5 w-3.5 shrink-0 text-accent" />Sans engagement, tu arrêtes en un clic</p>
      <p className="flex items-start gap-1.5"><Store className="mt-px h-3.5 w-3.5 shrink-0 text-accent" />Tu gardes ta boutique et tout ce qui a été créé</p>
    </div>
  );
}

// Questions fréquentes sous l'offre (page Abonnement).
export function ProFaq() {
  return (
    <section className="mx-auto mt-8 w-full max-w-[780px]">
      <h3 className="text-lg tracking-tight">Questions fréquentes</h3>
      <div className="mt-3 divide-y divide-white/[0.06] rounded-card border border-white/[0.08]">
        {PRO_FAQ.map((f) => (
          <details key={f.q} className="group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">{f.q}<span className="text-xl leading-none text-fg-faint transition-transform group-open:rotate-45">+</span></summary>
            <p className="mt-2 text-sm text-fg-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
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
      <div className="relative my-auto w-full max-w-[780px] [animation:rise_.35s_cubic-bezier(.2,.8,.2,1)]" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Fermer" className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-fg-muted hover:bg-white/10 hover:text-fg"><X className="h-4 w-4" /></button>
        <Paywall draft={draft} />
      </div>
    </div>
  );
}
