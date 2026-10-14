"use client";

import { Check, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { SHOWCASE } from "@/lib/content/showcase";
import { StoreFrame } from "./StoreFrame";

const DONE = [
  { t: "Marché et promesse posés", d: "0:42" },
  { t: "Fiche produit rédigée", d: "2:10" },
  { t: "Visuels générés", d: "3:35" },
];

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

      <div className="absolute -bottom-12 -left-4 w-[260px] rounded-card border border-white/10 bg-bg-2 p-4 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.7)] sm:-left-12">
        <p className="flex items-start gap-2 text-xs text-fg-muted"><Sparkles className="mt-px h-3.5 w-3.5 shrink-0 text-accent" /> <span>Brief : « {s.brief.length > 46 ? `${s.brief.slice(0, 46)}…` : s.brief} »</span></p>
        <ul key={s.slug} className="mt-3 space-y-2">
          {DONE.map((x, k) => (
            <li key={x.t} className="flex items-center gap-2 text-[13px]" style={{ animation: `pop-in .45s ${0.15 + k * 0.25}s both` }}>
              <span className="grid h-4 w-4 place-items-center rounded-full bg-accent/15"><Check className="h-3 w-3 text-accent" /></span>
              {x.t}
              <span className="ml-auto text-[11px] tabular-nums text-fg-faint">{x.d}</span>
            </li>
          ))}
        </ul>
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
