"use client";

import { ChevronsLeftRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { SHOWCASE } from "@/lib/content/showcase";
import { StoreFrame } from "./StoreFrame";

type Pair = {
  id: string; tab: string; store: string; image: string; url: string; title: string;
  price: string; old: string; badge: string; variants: string[]; spec: string; frame: string;
};
// Les avant / après au choix : la page brute d'un fournisseur (dessinée, aucun vrai site copié), puis la boutique créée.
const PAIRS: Pair[] = [
  { id: "ouate", tab: "Sac", store: "maison-ouate", image: "/showcase/ouate-supplier.jpg", url: "fournisseur.com/item/100501266…", frame: "linear-gradient(160deg,#e7a08f,#c8553d)",
    title: "2026 NEW Women Shoulder Bag PU Leather Quilted Handbag Large Capacity Casual Tote Zipper Crossbody Bag For Lady Work Shopping", price: "€8,93", old: "€27,90", badge: "-68%",
    variants: ["Khaki", "Black", "Brown", "Beige", "Pink", "Grey"], spec: "Specification: Material: PU leather. Size: 28x24x9cm. Package include: 1pc bag. Note: due to the light and screen difference, the item's color may be slightly different…" },
  { id: "klinn", tab: "Aspirateur", store: "klinn", image: "/showcase/klinn.jpg", url: "fournisseur.com/item/100500873…", frame: "linear-gradient(160deg,#a5b4fc,#4f46e5)",
    title: "Car Vacuum Cleaner Wireless 9000Pa Strong Suction Mini Handheld Portable Cordless Vacuum For Car Home Pet Hair Cleaning Tool", price: "€11,47", old: "€35,80", badge: "-67%",
    variants: ["Black", "White", "Grey", "Blue"], spec: "Specification: Power: 120W. Battery: 2000mAh. Charging: USB. Package: 1 x vacuum, 1 x cable, 2 x nozzle. Note: please allow 1-3cm error due to manual measurement…" },
  { id: "vortex", tab: "Casque gaming", store: "vortex", image: "/showcase/vortex.jpg", url: "fournisseur.com/item/100501947…", frame: "linear-gradient(160deg,#7dd3fc,#0284c7)",
    title: "Gaming Headset Wired Over Ear Headphones With Microphone RGB Light Stereo Bass Noise Cancelling For PC PS4 PS5 Xbox Laptop Gamer", price: "€9,86", old: "€29,99", badge: "-65%",
    variants: ["Black", "Red", "Blue", "White"], spec: "Specification: Driver: 50mm. Cable: 2.1m. Interface: 3.5mm + USB. Compatible: PC/PS4/PS5/Xbox. Note: the light effect may vary on different devices…" },
  { id: "nido", tab: "Station de recharge", store: "nido", image: "/showcase/nido.jpg", url: "fournisseur.com/item/100502318…", frame: "linear-gradient(160deg,#fcd34d,#d97706)",
    title: "3 In 1 Wireless Charger Stand 15W Fast Charging Station Dock For iPhone 16 15 14 Apple Watch AirPods Pro Wooden Holder", price: "€13,20", old: "€39,00", badge: "-66%",
    variants: ["Wood", "Black", "White"], spec: "Specification: Input: 9V/2A. Output: 15W/10W/7.5W/5W. Material: wood + ABS. Package: 1 x charger, 1 x cable (adapter not included)…" },
];

function SupplierPage({ p }: { p: Pair }) {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#f2f2f2] text-left text-[#333]">
      <div className="flex items-center gap-2 bg-[#e8e8e8] px-3 py-1.5"><span className="h-2 w-2 rounded-full bg-black/15" /><span className="h-2 w-2 rounded-full bg-black/15" /><span className="ml-2 h-3.5 flex-1 rounded bg-white/70 px-2 text-[7px] leading-[14px] text-black/50 sm:text-[9px]">{p.url}</span></div>
      <div className="flex items-center gap-2 bg-[#e62e04] px-3 py-1 text-[7px] font-bold text-white sm:text-[11px]"><span>SUPER DEALS</span><span className="opacity-80">Free shipping · Coupon -5€ · Flash sale 23:59:59</span></div>
      <div className="grid flex-1 grid-cols-[1fr_1.3fr] gap-3 p-3 sm:gap-5 sm:p-5">
        <div className="relative overflow-hidden rounded bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.image} alt="" className="h-full w-full object-contain p-[6%] opacity-90 blur-[0.5px] contrast-[0.85] saturate-[0.5]" />
          <span className="absolute left-1 top-1 rounded bg-[#e62e04] px-1 text-[7px] font-bold text-white sm:text-[11px]">{p.badge}</span>
          <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 text-[6px] text-white sm:text-[10px]">HOT SALE</span>
        </div>
        <div className="text-[7.5px] leading-tight sm:text-[12.5px]">
          <p className="font-bold">{p.title}</p>
          <p className="mt-1.5 text-[11px] font-bold text-[#e62e04] sm:text-[19px]">{p.price} <span className="text-[7px] font-normal text-black/40 line-through sm:text-[11px]">{p.old}</span></p>
          <p className="mt-1 text-black/50">4.5 ★ | 5000+ sold | Ships from CN</p>
          <div className="mt-1.5 flex flex-wrap gap-1">{p.variants.map((c) => <span key={c} className="rounded border border-black/15 px-1 text-[6px] sm:text-[10px]">{c}</span>)}</div>
          <p className="mt-1.5 text-black/45">{p.spec}</p>
          <span className="mt-2 inline-block rounded bg-[#e62e04] px-3 py-1 text-[7px] font-bold text-white sm:text-[11px]">Buy Now</span>
        </div>
      </div>
    </div>
  );
}

// Après : la vraie boutique Maison Ouate (capture de son vrai design), ou l'aperçu de la boutique créée.
function VigeniaStore({ p }: { p: Pair }) {
  const s = SHOWCASE.find((x) => x.slug === p.store);
  const box = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    // L'aperçu est dessiné à 640 px de large puis agrandi, comme une vraie capture d'écran.
    const ro = new ResizeObserver(([e]) => setZoom(e.contentRect.width / 640));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  if (p.id !== "ouate" && s) return (
    <div ref={box} className="h-full overflow-hidden" style={{ background: s.palette.bg }}>
      <div style={{ width: 640, zoom }}><StoreFrame s={s} phone={false} className="[&>div]:rounded-none [&>div]:border-0 [&>div]:shadow-none" /></div>
    </div>
  );
  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#f7efe4]">
      <div className="flex items-center gap-2 bg-[#ececec] px-3 py-1.5"><span className="h-2 w-2 rounded-full bg-black/15" /><span className="h-2 w-2 rounded-full bg-black/15" /><span className="ml-2 h-3.5 flex-1 rounded bg-white px-2 text-[7px] leading-[14px] text-black/60">maisonouate.com</span></div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/showcase/ouate-store.jpg" alt="La boutique Maison Ouate créée avec Vigenia" className="min-h-0 w-full flex-1 object-cover object-top" />
    </div>
  );
}

// Avant / après à faire glisser, en grand, avec plusieurs produits au choix :
// la page du fournisseur à gauche, la boutique Vigenia à droite.
export function BeforeAfterSlider() {
  const [x, setX] = useState(50);
  const [id, setId] = useState(PAIRS[0].id);
  const p = PAIRS.find((y) => y.id === id) ?? PAIRS[0];
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef(false);
  const move = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (r) setX(Math.min(98, Math.max(2, ((clientX - r.left) / r.width) * 100)));
  };
  return (
    <section className="py-16">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="text-center">
          <Reveal as="h2" className="text-h2">D'un lien moche à une <span className="serif-accent">vraie marque</span></Reveal>
          <Reveal delay={80} as="p" className="mx-auto mt-3 max-w-lg text-fg-muted">Choisis un produit, puis fais glisser : à gauche, la page du fournisseur que tu colles. À droite, la boutique créée avec Vigenia.</Reveal>
        </div>
        <div role="tablist" aria-label="Produits" className="mx-auto mt-7 flex max-w-full flex-wrap justify-center gap-2">
          {PAIRS.map((y) => (
            <button key={y.id} type="button" role="tab" aria-selected={y.id === p.id} onClick={() => { setId(y.id); setX(50); }}
              className={cn("rounded-full border px-4 py-2 text-sm font-semibold transition-all", y.id === p.id ? "border-transparent bg-[linear-gradient(180deg,#34f0b0,#0fae7c)] text-[#03140d] shadow-[0_0_20px_-4px_rgb(46_230_166/0.7)]" : "border-white/15 bg-black/20 text-fg-muted hover:text-fg")}>
              {y.tab}
            </button>
          ))}
        </div>
        <div ref={box} className="relative mx-auto mt-6 max-w-[1100px] select-none touch-pan-y"
          onPointerDown={(e) => { drag.current = true; move(e.clientX); (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); }}
          onPointerMove={(e) => { if (drag.current) move(e.clientX); }}
          onPointerUp={() => { drag.current = false; }}>
          <div className="rounded-[22px] p-2.5 ring-1 ring-white/15 transition-[background] duration-500 sm:p-4" style={{ background: p.frame }}>
            <div key={p.id} className="aspect-[4/3] overflow-hidden rounded-[12px] shadow-[0_20px_50px_-20px_rgb(0_0_0/0.6)] [animation:fade-in_.4s_ease-out_both] sm:aspect-[16/10]"><VigeniaStore p={p} /></div>
          </div>
          <div className="absolute inset-0 rounded-[22px] bg-[#d9d9d9] p-2.5 sm:p-4" style={{ clipPath: `inset(0 ${100 - x}% 0 0)` }}>
            <div className="aspect-[4/3] overflow-hidden rounded-[12px] border border-black/10 sm:aspect-[16/10]"><SupplierPage p={p} /></div>
          </div>
          <span className="pointer-events-none absolute bottom-5 left-4 rounded-full bg-black/75 px-3 py-1 text-xs font-semibold text-white sm:bottom-7 sm:left-6">Avant</span>
          <span className="pointer-events-none absolute bottom-5 right-4 rounded-full bg-[#34f0b0] px-3 py-1 text-xs font-semibold text-[#03140d] sm:bottom-7 sm:right-6">Avec Vigenia</span>
          <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_12px_rgb(0_0_0/0.4)]" style={{ left: `${x}%` }}>
            <span className="absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-[#03140d] shadow-xl"><ChevronsLeftRight className="h-5 w-5" /></span>
          </div>
          <input type="range" min={2} max={98} value={x} onChange={(e) => setX(Number(e.target.value))} aria-label="Comparer avant et après" className="sr-only" />
        </div>
        <p className="mt-3 text-center text-[11px] text-fg-faint">À gauche : page fournisseur illustrée. À droite : {p.id === "ouate" ? "la vraie boutique Maison Ouate" : `la boutique ${SHOWCASE.find((y) => y.slug === p.store)?.name ?? ""} créée avec Vigenia`}.</p>
      </div>
    </section>
  );
}
