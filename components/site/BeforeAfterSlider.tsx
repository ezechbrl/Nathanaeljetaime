"use client";

import { ChevronsLeftRight } from "lucide-react";
import { useRef, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";

// La page brute d'un fournisseur (dessinée, aucun vrai site copié) : ce que le client colle dans Vigenia.
function SupplierPage() {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#f2f2f2] text-left text-[#333]">
      <div className="flex items-center gap-2 bg-[#e8e8e8] px-3 py-1.5"><span className="h-2 w-2 rounded-full bg-black/15" /><span className="h-2 w-2 rounded-full bg-black/15" /><span className="ml-2 h-3.5 flex-1 rounded bg-white/70 px-2 text-[7px] leading-[14px] text-black/50">fournisseur.com/item/100501266…</span></div>
      <div className="flex items-center gap-2 bg-[#e62e04] px-3 py-1 text-[7px] font-bold text-white sm:text-[9px]"><span>SUPER DEALS</span><span className="opacity-80">Free shipping · Coupon -5€ · Flash sale 23:59:59</span></div>
      <div className="grid flex-1 grid-cols-[1fr_1.3fr] gap-3 p-3">
        <div className="relative overflow-hidden rounded bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/showcase/velaro-supplier.jpg" alt="" className="h-full w-full object-contain opacity-90 saturate-[0.6]" />
          <span className="absolute left-1 top-1 rounded bg-[#e62e04] px-1 text-[7px] font-bold text-white sm:text-[9px]">-68%</span>
          <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 text-[6px] text-white sm:text-[8px]">HOT SALE</span>
        </div>
        <div className="text-[7.5px] leading-tight sm:text-[10px]">
          <p className="font-bold">2026 NEW Carbon Fiber Triathlon Bike TT Time Trial Road Bicycle 700C Aero Frame 22 Speed Disc Brake Racing Bike For Adult Men Women</p>
          <p className="mt-1.5 text-[11px] font-bold text-[#e62e04] sm:text-[15px]">€799,00 <span className="text-[7px] font-normal text-black/40 line-through sm:text-[9px]">€2 499,00</span></p>
          <p className="mt-1 text-black/50">4.5 ★ | 300+ sold | Ships from CN</p>
          <div className="mt-1.5 flex flex-wrap gap-1">{["48cm", "51cm", "54cm", "56cm", "Black", "Black Gold"].map((c) => <span key={c} className="rounded border border-black/15 px-1 text-[6px] sm:text-[8px]">{c}</span>)}</div>
          <p className="mt-1.5 text-black/45">Specification: Frame material: carbon fiber T800. Wheel size: 700C. Package include: 1pc bike (need assembly). Note: due to the light and screen difference, the item's color may be slightly different…</p>
          <span className="mt-2 inline-block rounded bg-[#e62e04] px-3 py-1 text-[7px] font-bold text-white sm:text-[9px]">Buy Now</span>
        </div>
      </div>
    </div>
  );
}

// La vraie boutique Vélaro créée avec Vigenia (capture de son vrai design).
function VigeniaStore() {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#0c0d10]">
      <div className="flex items-center gap-2 bg-[#ececec] px-3 py-1.5"><span className="h-2 w-2 rounded-full bg-black/15" /><span className="h-2 w-2 rounded-full bg-black/15" /><span className="ml-2 h-3.5 flex-1 rounded bg-white px-2 text-[7px] leading-[14px] text-black/60">velaro.com</span></div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/showcase/velaro-store.jpg" alt="La boutique Vélaro créée avec Vigenia" className="min-h-0 w-full flex-1 object-cover object-top" />
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
          <Reveal delay={80} as="p" className="mx-auto mt-3 max-w-lg text-fg-muted">Fais glisser : à gauche, la page du fournisseur que tu colles. À droite, la vraie boutique Vélaro créée avec Vigenia.</Reveal>
        </div>
        <div ref={box} className="relative mx-auto mt-8 max-w-[760px] select-none touch-pan-y"
          onPointerDown={(e) => { drag.current = true; move(e.clientX); (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); }}
          onPointerMove={(e) => { if (drag.current) move(e.clientX); }}
          onPointerUp={() => { drag.current = false; }}>
          <div className="rounded-[22px] bg-[linear-gradient(160deg,#f7dc7a,#f2c230)] p-2.5 ring-1 ring-white/15 sm:p-4">
            <div className="aspect-[16/10] overflow-hidden rounded-[12px] shadow-[0_20px_50px_-20px_rgb(0_0_0/0.6)]"><VigeniaStore /></div>
          </div>
          <div className="absolute inset-0 rounded-[22px] bg-[#d9d9d9] p-2.5 sm:p-4" style={{ clipPath: `inset(0 ${100 - x}% 0 0)` }}>
            <div className="aspect-[16/10] overflow-hidden rounded-[12px] border border-black/10"><SupplierPage /></div>
          </div>
          <span className="pointer-events-none absolute bottom-5 left-4 rounded-full bg-black/75 px-3 py-1 text-xs font-semibold text-white sm:bottom-7 sm:left-6">Avant</span>
          <span className="pointer-events-none absolute bottom-5 right-4 rounded-full bg-[#34f0b0] px-3 py-1 text-xs font-semibold text-[#03140d] sm:bottom-7 sm:right-6">Avec Vigenia</span>
          <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_12px_rgb(0_0_0/0.4)]" style={{ left: `${x}%` }}>
            <span className="absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-[#03140d] shadow-xl"><ChevronsLeftRight className="h-5 w-5" /></span>
          </div>
          <input type="range" min={2} max={98} value={x} onChange={(e) => setX(Number(e.target.value))} aria-label="Comparer avant et après" className="sr-only" />
        </div>
        <p className="mt-3 text-center text-[11px] text-fg-faint">À gauche : page fournisseur illustrée. À droite : la vraie boutique Vélaro.</p>
      </div>
    </section>
  );
}
