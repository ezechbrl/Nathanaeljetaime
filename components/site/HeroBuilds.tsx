"use client";

import { Check, Sparkles, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { ShopifyBag } from "@/components/auth/AuthForms";
import { cn } from "@/lib/cn";
import { SHOWCASE, type ShowcaseStore } from "@/lib/content/showcase";

// De chaque côté du haut de l'accueil : une mini boutique Shopify que l'IA construit pièce par pièce,
// puis publie, avant de passer à une autre marque. Décor discret, masqué sous 1400 px (sinon il gêne le titre).
const STEPS = ["Lit le produit", "Écrit les textes", "Crée les photos", "Importe les avis", "Applique ta marque", "Publié sur Shopify"];
const FONT = { serif: "font-serif", sans: "font-sans", mono: "font-mono" } as const;

function MiniStore({ store, step }: { store: ShowcaseStore; step: number }) {
  const p = store.palette;
  const show = (n: number) => (step >= n ? "opacity-100 [animation:pop-in_.45s_cubic-bezier(.2,.8,.2,1)_both]" : "opacity-0");
  const branded = step >= 4;
  return (
    <div className="relative overflow-hidden rounded-[12px] border border-white/10 text-left shadow-[0_30px_60px_-25px_rgb(0_0_0/0.8)] transition-colors duration-700" style={{ background: branded ? p.bg : "#f4f6f5", color: branded ? p.ink : "#1d2a26" }}>
      {/* Barre du navigateur */}
      <div className="flex items-center gap-1 border-b border-black/5 bg-black/[0.04] px-2 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-black/15" /><span className="h-1.5 w-1.5 rounded-full bg-black/15" /><span className="h-1.5 w-1.5 rounded-full bg-black/15" />
        <span className="ml-1.5 truncate text-[8px] opacity-50">{store.slug}.myshopify.com</span>
      </div>
      <div className={cn("p-3", FONT[store.font])}>
        <p className={cn("text-[10px] font-bold uppercase tracking-[0.18em]", show(1))}>{store.name}</p>
        <div className="mt-2 flex gap-2.5">
          {/* « Photo » du produit : bloc coloré qui se révèle comme une image qu'on développe */}
          <div className={cn("relative h-[74px] w-[74px] shrink-0 overflow-hidden rounded-[8px]", step >= 2 ? "[animation:develop_.9s_ease-out_both]" : "")} style={{ background: step >= 2 ? `radial-gradient(circle at 35% 30%, ${p.soft}, ${p.accent})` : "rgb(0 0 0 / 0.06)" }}>
            {step >= 2 && <span className="absolute bottom-2 left-1/2 h-9 w-6 -translate-x-1/2 rounded-[6px] shadow-lg" style={{ background: p.bg, border: `2px solid ${p.ink}22` }} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className={cn("text-[11px] font-semibold leading-tight", step >= 1 ? "[animation:type-in_.8s_steps(18)_both]" : "opacity-0")}>{store.headline}</p>
            <p className={cn("mt-1 text-[9px] leading-snug opacity-70", show(1))}>{store.sub}</p>
            <p className={cn("mt-1.5 flex items-center gap-0.5 text-[9px]", show(3))}>
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-2.5 w-2.5 fill-[#f5b301] text-[#f5b301]" />)}
              <span className="ml-1 opacity-70">4,8</span>
            </p>
          </div>
        </div>
        <div className={cn("mt-2.5 flex items-center justify-between", show(4))}>
          <span className="text-[11px] font-bold">{store.price}</span>
          <span className="rounded-full px-2.5 py-1 text-[9px] font-semibold" style={{ background: p.accent, color: p.bg }}>Ajouter au panier</span>
        </div>
      </div>
      {/* Balayage de l'IA pendant la construction */}
      {step < 5 && <div className="pointer-events-none absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-[#2ee6a6]/25 to-transparent [animation:scan_1.8s_linear_infinite]" />}
    </div>
  );
}

function Builder({ offset, className }: { offset: number; className: string }) {
  const [i, setI] = useState(offset);
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setStep(STEPS.length - 1); return; }
    const t = window.setTimeout(() => {
      if (step < STEPS.length - 1) setStep(step + 1);
      else { setStep(0); setI((n) => (n + 2) % SHOWCASE.length); }
    }, step === 0 ? 700 + offset * 900 : step === STEPS.length - 1 ? 2800 : 950);
    return () => window.clearTimeout(t);
  }, [step, offset]);
  const store = SHOWCASE[i % SHOWCASE.length];
  const done = step === STEPS.length - 1;
  return (
    <div className={cn("pointer-events-none absolute w-[230px] [animation:float_7s_ease-in-out_infinite]", className)} aria-hidden>
      <MiniStore key={store.slug} store={store} step={step} />
      {/* Ce que fait l'IA en ce moment */}
      <div key={`${store.slug}-${step}`} className={cn("mx-auto mt-3 flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium backdrop-blur [animation:pop-in_.35s_ease-out_both]", done ? "border-[#95bf47]/50 bg-[#95bf47]/15 text-[#d9f99d]" : "border-[#2ee6a6]/40 bg-black/30 text-[#a7f3d0]")}>
        {done ? <><ShopifyBag className="h-3.5 w-3.5" /> {STEPS[step]} <Check className="h-3 w-3" /></> : <><Sparkles className="h-3 w-3 animate-pulse" /> IA · {STEPS[step]}…</>}
      </div>
    </div>
  );
}

export function HeroBuilds() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden min-[1400px]:block">
      <Builder offset={0} className="left-[max(1.5rem,calc(50%-660px))] top-[230px] -rotate-[4deg]" />
      <Builder offset={1} className="right-[max(1.5rem,calc(50%-660px))] top-[400px] rotate-[3deg]" />
    </div>
  );
}
