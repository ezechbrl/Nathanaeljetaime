"use client";

import { useEffect, useState } from "react";
import { SHOWCASE } from "@/lib/content/showcase";
import { cn } from "@/lib/cn";
import { StoreFrame } from "./StoreFrame";

// Haut de page : une vraie boutique créée avec Vigenia, qui change toutes les 3 secondes.
const ORDER = ["velaro", "nido", "pas-sur", "kordo", "silencio", "maison-ouate", "macho", "delie", "pincee"];
const STORES = ORDER.map((slug) => SHOWCASE.find((s) => s.slug === slug)).filter((s): s is (typeof SHOWCASE)[number] => !!s);

export function StoreCarousel() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % STORES.length), 3000);
    return () => window.clearInterval(t);
  }, [paused]);
  const s = STORES[i];
  return (
    <div className="mx-auto max-w-[760px]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="relative rounded-[26px] p-4 shadow-[0_40px_90px_-40px_rgb(0_0_0/0.9)] ring-1 ring-white/15 transition-[background] duration-700 sm:p-7"
        style={{ background: `linear-gradient(160deg, color-mix(in oklab, ${s.palette.accent} 65%, white), ${s.palette.accent} 55%, color-mix(in oklab, ${s.palette.accent} 70%, black))` }}>
        <div className="relative">
          {STORES.map((x, k) => (
            <div key={x.slug} aria-hidden={k !== i} className={cn("transition-all duration-700", k === i ? "relative opacity-100" : "pointer-events-none absolute inset-0 scale-[0.98] opacity-0")}>
              <StoreFrame s={x} />
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 text-white">
          <p className="text-left"><span className="block text-lg font-semibold leading-tight">{s.name}</span><span className="text-xs opacity-80">{s.category} · créée avec Vigenia</span></p>
          <div className="flex gap-1.5">
            {STORES.map((x, k) => <button key={x.slug} type="button" aria-label={`Voir ${x.name}`} onClick={() => setI(k)} className={cn("h-2 rounded-full transition-all", k === i ? "w-6 bg-white" : "w-2 bg-white/45 hover:bg-white/70")} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
