"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { SHOWCASE } from "@/lib/content/showcase";
import { StoreFrame } from "./StoreFrame";


// Aperçu du hero : les boutiques d'exemple défilent seules, on peut aussi cliquer sur une pastille.
export function HeroVisual() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const s = SHOWCASE[i];

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((x) => (x + 1) % SHOWCASE.length), 3800);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <div className="relative mx-auto w-full max-w-[520px] lg:mr-0" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div aria-hidden className="absolute -inset-8 rounded-[32px] opacity-60 blur-2xl transition-[background] duration-700" style={{ background: `radial-gradient(closest-side, ${s.palette.accent}66, transparent)` }} />
      <div className="relative rotate-[1.5deg] transition-transform duration-700 hover:rotate-0">
        <div key={s.slug} className="animate-[fade-in_.5s_ease-out]"><StoreFrame s={s} /></div>
      </div>

      <div className="absolute -right-2 -top-12 flex items-center gap-1.5 rounded-full border border-white/10 bg-bg-2/90 px-2.5 py-2 backdrop-blur sm:-right-6" role="tablist" aria-label="Boutiques d'exemple">
        {SHOWCASE.map((x, k) => (
          <button
            key={x.slug}
            role="tab"
            aria-selected={k === i}
            aria-label={x.name}
            title={`${x.name} · ${x.category}`}
            onClick={() => setI(k)}
            className={cn("h-4 w-4 rounded-full ring-offset-2 ring-offset-bg-2 transition-transform hover:scale-125", k === i && "scale-110 ring-2 ring-white/70")}
            style={{ background: `linear-gradient(135deg, ${x.palette.accent}, ${x.palette.ink})` }}
          />
        ))}
      </div>
      <span className="absolute -bottom-12 right-0 text-xs text-fg-faint">{s.name} · {s.category} · {s.language}</span>
    </div>
  );
}
