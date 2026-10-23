"use client";

import { ArrowDown, Camera, Lock, MessageSquare, PenLine, Rocket, Sparkles, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import * as api from "@/lib/api/client";
import type { Job, Store } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { useApp } from "./AppContext";
import { Paywall } from "./Paywall";

const UNLOCKS = [
  { icon: PenLine, title: "Tous les textes", text: "Accueil, fiche produit, FAQ, offres par lot" },
  { icon: Camera, title: "9 photos de pro", text: "Ton produit en studio et en situation" },
  { icon: Star, title: "Vrais avis acheteurs", text: "Importés et traduits automatiquement" },
  { icon: MessageSquare, title: "Éditeur IA", text: "Modifie tout en une phrase" },
  { icon: Rocket, title: "Publication Shopify", text: "Produit et pages en ligne en un clic" },
];

const eur = (p: string) => `${Number(p).toFixed(2).replace(".", ",")} €`;

// Aperçu de la vraie boutique : en-tête et accroche lisibles, le reste flouté jusqu'au déblocage.
function TeaserPreview({ store }: { store: Store }) {
  const t = store.teaser!;
  const { primary, accent, background } = store.theme.colors;
  const layout = store.theme.heroLayout ?? "left";
  return (
    <div className="relative overflow-hidden rounded-[13px] text-left" style={{ background, color: primary }}>
      <div className="py-2 text-center text-[11px]" style={{ background: primary, color: background }}>Livraison offerte · Retours 30 jours</div>
      <div className="flex items-center justify-between border-b px-5 py-3" style={{ borderColor: `${primary}1a` }}>
        <span className="font-serif text-xl">{store.name}</span>
        <span className="text-xs opacity-60">Boutique · À propos · FAQ</span>
      </div>
      <div className={cn("grid items-center gap-6 p-5 sm:p-8", layout === "center" ? "text-center" : "sm:grid-cols-2")}>
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs" style={{ background: `${accent}22` }}><Sparkles className="h-3 w-3" />{t.tagline}</span>
          <h3 className="mt-4 font-serif text-[clamp(1.6rem,1.1rem+1.6vw,2.4rem)] leading-tight">{t.heroTitle}</h3>
          <p className="mt-3 text-sm opacity-70">{t.heroSubtitle}</p>
          <span className="mt-5 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ background: accent }}>Acheter · {eur(t.price)}</span>
        </div>
        <div className={cn("aspect-[4/3] overflow-hidden rounded-[16px]", layout === "right" && "sm:-order-1", layout === "center" && "mx-auto w-full max-w-[520px]")} style={{ background: `linear-gradient(150deg, ${accent}33, ${accent}88)` }}>
          {t.image && <img src={t.image} alt="" className="h-full w-full object-cover" />}
        </div>
      </div>
      {/* Le reste de la boutique : flouté (les atouts sont réels, les blocs gris arrivent au déblocage). */}
      <div className="relative">
        <div aria-hidden className="pointer-events-none select-none space-y-6 p-5 blur-[7px] sm:p-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {t.benefits.map((b) => (
              <div key={b.title} className="rounded-[14px] p-4" style={{ background: `${accent}14` }}>
                <p className="font-semibold">{b.title}</p><p className="mt-1 text-sm opacity-70">{b.text}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="aspect-square rounded-[16px]" style={{ background: `linear-gradient(150deg, ${accent}55, ${primary}55)` }} />
            <div className="space-y-3">
              <p className="text-xl font-semibold">{t.productTitle}</p>
              <p className="text-lg">{eur(t.price)}</p>
              {[0, 1, 2, 3].map((i) => <div key={i} className="h-3 rounded-full" style={{ background: `${primary}22`, width: `${90 - i * 12}%` }} />)}
              <div className="h-11 rounded-full" style={{ background: accent }} />
            </div>
          </div>
        </div>
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-b from-transparent via-black/10 to-black/30 p-4">
          <a href="#debloquer" className="flex items-center gap-2 rounded-full bg-[#0b1f1b]/90 px-5 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur">
            <Lock className="h-4 w-4 text-[#2ee6a6]" /> Débloque ta boutique complète
          </a>
        </div>
      </div>
    </div>
  );
}

export function LockedStore({ store, onUnlocked }: { store: Store; onUnlocked: (res: { store: Store; job: Job }) => void }) {
  const { user, refresh } = useApp();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const tried = useRef(false);
  const paid = user.plan !== "free";

  // Abonnement actif : on lance tout de suite la vraie génération.
  useEffect(() => {
    if (!paid || tried.current) return;
    tried.current = true;
    setBusy(true);
    api.unlockStore(store.id).then(onUnlocked).catch((e) => { toast((e as Error).message, "error"); setBusy(false); });
  }, [paid, store.id, onUnlocked, toast]);

  // Retour du paiement : le temps que Stripe confirme, on revérifie l'abonnement.
  useEffect(() => {
    if (paid) return;
    const id = window.setInterval(refresh, 5000);
    return () => window.clearInterval(id);
  }, [paid, refresh]);

  if (!store.teaser) return null;
  return (
    <div className="px-5 pb-16 pt-8 sm:px-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#2ee6a6]/40 bg-[#2ee6a6]/10 px-3 py-1 text-xs font-medium text-[#a7f3d0]"><Lock className="h-3.5 w-3.5" /> Aperçu gratuit</span>
          <h1 className="mt-4 text-[clamp(1.9rem,1.3rem+2vw,3rem)] font-semibold leading-tight tracking-[-0.035em]">
            Ta boutique <span className="serif-accent">{store.name}</span> t'attend
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-fg-muted">Ton nom de marque, tes couleurs et ton accroche sont prêts. Débloque-la : tout le reste se crée en quelques minutes.</p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="glow-frame rounded-[14px] p-[1.5px]"><TeaserPreview store={store} /></div>
          <div className="flex flex-col gap-2.5">
            {UNLOCKS.map(({ icon: I, title, text }) => (
              <div key={title} className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-white/[0.04] p-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[linear-gradient(160deg,#34f0b0,#0fae7c)] text-[#03140d]"><I className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><span className="block text-[15px] font-semibold">{title}</span><span className="block text-[13px] text-fg-muted">{text}</span></span>
                <Lock className="h-4 w-4 shrink-0 text-fg-faint" />
              </div>
            ))}
            <a href="#debloquer" className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,#34f0b0,#0fae7c)] text-[15px] font-semibold text-[#03140d] shadow-[0_10px_30px_-10px_rgb(46_230_166/0.8)]">
              {busy ? <><Spinner /> Déblocage…</> : <>Débloquer ma boutique <ArrowDown className="h-4 w-4" /></>}
            </a>
          </div>
        </div>

        {!paid && <div id="debloquer" className="mt-12 scroll-mt-6"><Paywall unlockStoreId={store.id} /></div>}
      </div>
    </div>
  );
}
