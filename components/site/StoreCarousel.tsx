"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { SHOWCASE } from "@/lib/content/showcase";
import { cn } from "@/lib/cn";
import { StoreFrame } from "./StoreFrame";

// Haut de page : les vraies boutiques créées avec Vigenia, à faire glisser au doigt (ou avec les flèches).
const ORDER = ["velaro", "nido", "pas-sur", "kordo", "silencio", "maison-ouate", "macho", "delie", "pincee"];
const STORES = ORDER.map((slug) => SHOWCASE.find((s) => s.slug === slug)).filter((s): s is (typeof SHOWCASE)[number] => !!s);

export function StoreCarousel() {
  const [i, setI] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const go = (k: number) => {
    const el = track.current;
    if (!el) return;
    const n = (k + STORES.length) % STORES.length;
    el.scrollTo({ left: n * el.clientWidth, behavior: "smooth" });
  };
  const onScroll = () => {
    const el = track.current;
    if (el) setI(Math.round(el.scrollLeft / el.clientWidth));
  };
  const s = STORES[i] ?? STORES[0];
  return (
    <div className="mx-auto max-w-[760px]">
      <div className="relative rounded-[26px] p-4 shadow-[0_40px_90px_-40px_rgb(0_0_0/0.9)] ring-1 ring-white/15 transition-[background] duration-500 sm:p-7"
        style={{ background: `linear-gradient(160deg, color-mix(in oklab, ${s.palette.accent} 65%, white), ${s.palette.accent} 55%, color-mix(in oklab, ${s.palette.accent} 70%, black))` }}>
        <div className="relative">
          <div ref={track} onScroll={onScroll} className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {STORES.map((x, k) => (
              <div key={x.slug} aria-hidden={k !== i} className="w-full shrink-0 snap-center snap-always pb-5 pr-3 sm:pr-5">
                <StoreFrame s={x} />
              </div>
            ))}
          </div>
          <button type="button" aria-label="Boutique précédente" onClick={() => go(i - 1)} className="absolute left-0 top-1/2 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-[#03140d] shadow-xl sm:grid"><ChevronLeft className="h-5 w-5" /></button>
          <button type="button" aria-label="Boutique suivante" onClick={() => go(i + 1)} className="absolute right-0 top-1/2 hidden h-10 w-10 -translate-y-1/2 translate-x-1/2 place-items-center rounded-full bg-white text-[#03140d] shadow-xl sm:grid"><ChevronRight className="h-5 w-5" /></button>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 text-white">
          <p className="text-left"><span className="block text-lg font-semibold leading-tight">{s.name}</span><span className="text-xs opacity-80">{s.category} · créée avec Vigenia</span></p>
          <div className="flex gap-1.5">
            {STORES.map((x, k) => <button key={x.slug} type="button" aria-label={`Voir ${x.name}`} onClick={() => go(k)} className={cn("h-2 rounded-full transition-all", k === i ? "w-6 bg-white" : "w-2 bg-white/45 hover:bg-white/70")} />)}
          </div>
        </div>
        <p className="mt-2 text-center text-[11px] text-white/70 sm:hidden">Fais glisser pour voir les autres boutiques</p>
      </div>
    </div>
  );
}
