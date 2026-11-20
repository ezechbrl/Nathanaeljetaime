"use client";

import { ChevronsLeftRight } from "lucide-react";
import { useRef, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { SHOWCASE } from "@/lib/content/showcase";
import { StoreFrame } from "./StoreFrame";

const STORE = SHOWCASE.find((s) => s.slug === "silencio") ?? SHOWCASE[0];

// La page brute d'un fournisseur (dessinée, aucun vrai site copié) : ce que le client colle dans Vigenia.
function SupplierPage() {
  return (
    <div className="aspect-[4/3] overflow-hidden rounded-[10px] border border-black/10 bg-[#f2f2f2] text-left text-[#333]">
      <div className="flex items-center gap-2 bg-[#e8e8e8] px-3 py-2"><span className="h-2 w-2 rounded-full bg-black/15" /><span className="h-2 w-2 rounded-full bg-black/15" /><span className="ml-2 h-3.5 flex-1 rounded bg-white/70 px-2 text-[7px] leading-[14px] text-black/50">fournisseur.com/item/100501266…</span></div>
      <div className="grid grid-cols-[0.8fr_1.4fr] gap-3 p-3">
        <div className="relative aspect-square overflow-hidden rounded bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {STORE.image && <img src={STORE.image} alt="" className="h-full w-full object-cover opacity-90 saturate-50" />}
          <span className="absolute left-1 top-1 rounded bg-[#e62e04] px-1 text-[7px] font-bold text-white">-73%</span>
          <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 text-[6px] text-white">HOT SALE</span>
        </div>
        <div className="text-[7.5px] leading-tight">
          <p className="font-bold">2026 NEW Gaming Headset Wired Over Ear Headphones With Mic RGB Light Noise Cancelling For PC PS4 PS5 Xbox Laptop</p>
          <p className="mt-1.5 text-[11px] font-bold text-[#e62e04]">€11,92 <span className="text-[7px] font-normal text-black/40 line-through">€44,15</span></p>
          <p className="mt-1 text-black/50">4.6 ★ | 2000+ sold | Free shipping over €10</p>
          <div className="mt-1.5 flex gap-1">{["Black", "White", "Pink", "Blue"].map((c) => <span key={c} className="rounded border border-black/15 px-1 text-[6px]">{c}</span>)}</div>
          <p className="mt-1.5 text-black/45">Specification: Driver: 50mm. Cable length: 2.1m. Package include: 1pc headset, 1pc adapter. Note: due to the light and screen difference, the item's color may be slightly different…</p>
          <span className="mt-2 inline-block rounded bg-[#e62e04] px-3 py-1 text-[7px] font-bold text-white">Buy Now</span>
        </div>
      </div>
      <div className="mx-3 grid grid-cols-4 gap-1.5">{[0, 1, 2, 3].map((k) => <div key={k} className="h-8 rounded bg-black/[0.06]" />)}</div>
    </div>
  );
}

// Avant / après à faire glisser : la page du fournisseur à gauche, la boutique Vigenia à droite.
export function BeforeAfterSlider() {
  const [x, setX] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef(false);
  const move = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (r) setX(Math.min(98, Math.max(2, ((clientX - r.left) / r.width) * 100)));
  };
  return (
    <section className="py-16">
      <div className="mx-auto max-w-[980px] px-4 sm:px-6">
        <div className="text-center">
          <Reveal as="h2" className="text-h2">D'un lien moche à une <span className="serif-accent">vraie marque</span></Reveal>
          <Reveal delay={80} as="p" className="mx-auto mt-3 max-w-lg text-fg-muted">Fais glisser : à gauche, la page du fournisseur que tu colles. À droite, la boutique que Vigenia en fait.</Reveal>
        </div>
        <div ref={box} className="relative mx-auto mt-8 max-w-[720px] select-none touch-pan-y"
          onPointerDown={(e) => { drag.current = true; move(e.clientX); (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); }}
          onPointerMove={(e) => { if (drag.current) move(e.clientX); }}
          onPointerUp={() => { drag.current = false; }}>
          <div className="rounded-[22px] p-3 ring-1 ring-white/15 sm:p-5" style={{ background: `linear-gradient(160deg, color-mix(in oklab, ${STORE.palette.accent} 60%, white), ${STORE.palette.accent})` }}>
            <StoreFrame s={STORE} phone={false} />
          </div>
          <div className="absolute inset-0 rounded-[22px] bg-[#d9d9d9] p-3 sm:p-5" style={{ clipPath: `inset(0 ${100 - x}% 0 0)` }}>
            <SupplierPage />
          </div>
          <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white sm:left-5 sm:top-5">Avant</span>
          <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-[#34f0b0] px-3 py-1 text-xs font-semibold text-[#03140d] sm:right-5 sm:top-5">Avec Vigenia</span>
          <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_12px_rgb(0_0_0/0.4)]" style={{ left: `${x}%` }}>
            <span className="absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-[#03140d] shadow-xl"><ChevronsLeftRight className="h-5 w-5" /></span>
          </div>
          <span className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-white/60">Exemple illustré</span>
          <input type="range" min={2} max={98} value={x} onChange={(e) => setX(Number(e.target.value))} aria-label="Comparer avant et après" className="sr-only" />
        </div>
      </div>
    </section>
  );
}
