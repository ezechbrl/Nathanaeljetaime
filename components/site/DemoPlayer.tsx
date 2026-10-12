"use client";

import { Check, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";
import { SHOWCASE } from "@/lib/content/showcase";
import { StoreFrame } from "./StoreFrame";

const BRIEF = "Boutique premium pour ma marque de baumes à lèvres naturels, 6 ingrédients, fabriqués à Grasse.";
const STEPS = ["Marché et promesse", "Identité de marque", "Page d'accueil", "Fiche produit et SEO", "FAQ et pages", "Visuels"];

// Démo jouée automatiquement : saisie du brief, étapes de génération, puis boutique.
export function DemoPlayer() {
  const [t, setT] = useState(0); // temps écoulé en ms
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const total = 2600 + STEPS.length * 900 + 600;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setPlaying(true);
        io.disconnect();
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing) return;
    const start = performance.now() - t;
    let raf = 0;
    const loop = (now: number) => {
      const el = Math.min(total, now - start);
      setT(el);
      if (el < total) raf = requestAnimationFrame(loop);
      else setPlaying(false);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  const typed = BRIEF.slice(0, Math.floor(Math.min(1, t / 2200) * BRIEF.length));
  const stepDone = Math.max(0, Math.floor((t - 2600) / 900));
  const finished = t >= total;
  const progress = Math.min(100, Math.max(0, ((t - 2600) / (STEPS.length * 900)) * 100));

  return (
    <div ref={ref} className="surface overflow-hidden rounded-[14px]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3 text-sm">
        <span className="flex items-center gap-2"><LogoMark className="h-5 w-5" /> Nouvelle boutique</span>
        <button
          onClick={() => { setT(0); setPlaying(true); }}
          className="flex items-center gap-1.5 rounded-ctl px-2.5 py-1 text-xs text-fg-muted transition-colors hover:bg-white/5 hover:text-fg"
        >
          {finished ? <><RotateCcw className="h-3.5 w-3.5" /> Rejouer</> : <><Play className="h-3.5 w-3.5" /> Lecture</>}
        </button>
      </div>
      <div className="grid gap-6 p-5 lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
        <div>
          <div className="rounded-[11px] border border-accent/25 bg-black/25 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-fg-faint">Ton brief</p>
            <p className="mt-2 min-h-[4.5rem] text-[15px] leading-relaxed">
              {typed}
              {t < 2400 && <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 animate-pulse bg-accent" />}
            </p>
          </div>
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-fg-muted"><span>Génération</span><span className="tabular-nums">{Math.round(progress)} %</span></div>
            <div className="mt-2 h-1 overflow-hidden rounded bg-white/[0.07]"><div className="h-full rounded bg-accent transition-[width] duration-200" style={{ width: `${progress}%` }} /></div>
            <ul className="mt-4 space-y-2">
              {STEPS.map((s, i) => {
                const state = i < stepDone ? "done" : i === stepDone && t > 2600 && !finished ? "run" : "todo";
                return (
                  <li key={s} className={cn("flex items-center gap-2.5 text-sm transition-colors", state === "todo" ? "text-fg-faint" : "text-fg")}>
                    <span className={cn("grid h-5 w-5 place-items-center rounded-full border", state === "done" ? "border-accent/50 bg-accent-deep/60" : "border-white/10")}>
                      {state === "done" ? <Check className="h-3 w-3 text-accent" /> : state === "run" ? <span className="h-2 w-2 animate-pulse rounded-full bg-accent" /> : null}
                    </span>
                    {s}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div className="relative grid min-h-[260px] place-items-center rounded-card bg-black/20 p-4 sm:p-8">
          <div className={cn("w-full transition-all duration-700 ease-out", finished ? "translate-y-0 opacity-100 blur-0" : "translate-y-4 opacity-0 blur-sm")}>
            <StoreFrame s={SHOWCASE[1]} />
          </div>
          {!finished && (
            <p className="absolute text-sm text-fg-faint">{t === 0 ? "La démo démarre quand elle est visible" : "Ta boutique apparaît ici…"}</p>
          )}
        </div>
      </div>
    </div>
  );
}
