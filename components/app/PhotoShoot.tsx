"use client";

import { Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Store } from "@/lib/api/types";
import { cn } from "@/lib/cn";

// Les prises de vue, dans l'ordre où elles « se développent » (purement indicatif : la génération est parallèle).
const SHOTS: { label: string; line: string; bg: (c: Store["theme"]["colors"]) => string }[] = [
  { label: "Packshot", line: "Mise en place du produit sur le fond…", bg: (c) => `linear-gradient(160deg, ${c.background}, #ffffff)` },
  { label: "Fond blanc", line: "Lumière blanche et reflets aux couleurs de la marque…", bg: (c) => `radial-gradient(circle at 70% 30%, ${c.accent}55, #ffffff 60%)` },
  { label: "Studio noir", line: "Fond noir, éclairage de contour…", bg: (c) => `radial-gradient(circle at 50% 30%, ${c.accent}40, #050505 65%)` },
  { label: "Gros plan", line: "Mise au point sur la matière…", bg: (c) => `radial-gradient(circle at 40% 60%, ${c.primary}, #111 80%)` },
  { label: "Dans son décor", line: "Installation du décor…", bg: (c) => `linear-gradient(180deg, #2a2f36, ${c.accent}55)` },
  { label: "Photo d'accueil", line: "Cadrage large pour la page d'accueil…", bg: (c) => `linear-gradient(110deg, #0d0f12 40%, ${c.accent}66)` },
  { label: "Moment 1", line: "Mise en scène du premier moment…", bg: (c) => `linear-gradient(140deg, ${c.background}, ${c.accent}66)` },
  { label: "Moment 2", line: "Mise en scène du deuxième moment…", bg: (c) => `linear-gradient(200deg, #1b1f24, ${c.primary})` },
  { label: "Moment 3", line: "Dernière mise en scène…", bg: (c) => `linear-gradient(20deg, ${c.accent}55, ${c.background})` },
];
const EXPECTED_MS = 100_000;

// Animation « séance photo » pendant que les visuels de la boutique sont refaits.
export function PhotoShoot({ store }: { store: Store }) {
  const c = store.theme.colors;
  const [elapsed, setElapsed] = useState(0);
  const [flash, setFlash] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t0 = Date.now();
    const id = setInterval(() => setElapsed(Date.now() - t0), 250);
    const fl = setInterval(() => setFlash((f) => f + 1), 3800);
    return () => { clearInterval(id); clearInterval(fl); };
  }, []);

  // Progression estimée : ralentit en approchant de la fin, ne dépasse jamais 95 % avant le vrai résultat.
  const pct = Math.min(95, Math.round(100 * (1 - Math.exp(-elapsed / (EXPECTED_MS / 2.2)))));
  const developed = Math.min(SHOTS.length, Math.floor((pct / 95) * SHOTS.length));
  const current = SHOTS[Math.min(developed, SHOTS.length - 1)];
  const left = Math.max(0, Math.round((EXPECTED_MS - elapsed) / 1000));
  const remaining = left > 60 ? `Tes photos arrivent dans environ ${Math.ceil(left / 60)} min` : left > 10 ? `Tes photos arrivent dans environ ${Math.ceil(left / 10) * 10} s` : "Tes photos arrivent dans quelques secondes…";

  function onMove(e: React.PointerEvent) {
    if (e.pointerType !== "mouse" || !box.current) return;
    const r = box.current.getBoundingClientRect();
    setTilt({ x: ((e.clientY - r.top) / r.height - 0.5) * -8, y: ((e.clientX - r.left) / r.width - 0.5) * 10 });
  }

  return (
    <section className="surface overflow-hidden rounded-card p-5 sm:p-6" aria-live="polite">
      {/* Bandeau de chargement bien visible, avec le temps restant estimé */}
      <div className="rounded-[14px] border border-accent/25 bg-accent-deep/30 p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-sm text-fg-muted">
              <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-70" /><span className="relative h-2.5 w-2.5 rounded-full bg-red-500" /></span>
              Séance photo en cours
            </p>
            <p className="mt-1 text-xl font-medium tracking-tight sm:text-2xl">{remaining}</p>
          </div>
          <p className="text-3xl font-semibold tabular-nums text-accent sm:text-4xl">{pct} %</p>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/[0.08]" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progression de la séance photo">
          <div className="relative h-full overflow-hidden rounded-full bg-accent transition-[width] duration-500" style={{ width: `${Math.max(pct, 3)}%` }}>
            <span className="absolute inset-0 animate-shimmer bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.55),transparent)] bg-[length:200%_100%]" />
          </div>
        </div>
        <p className="mt-2 text-xs text-fg-faint">{developed} photo{developed > 1 ? "s" : ""} sur {SHOTS.length} · tu peux quitter la page, la séance continue.</p>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        {/* Le viseur */}
        <div ref={box} onPointerMove={onMove} onPointerLeave={() => setTilt({ x: 0, y: 0 })} className="[perspective:1200px]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[18px] border border-white/10 shadow-[0_40px_80px_-40px_rgb(0_0_0/.8)] transition-transform duration-300 ease-out" style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}>
            <div key={current.label} className="absolute inset-0 [animation:fade-in_.8s_ease-out]" style={{ background: current.bg(c) }} />
            {/* Le produit sur le plateau */}
            <div className="absolute left-1/2 top-1/2 h-[46%] w-[28%] -translate-x-1/2 -translate-y-1/2"><div className="h-full w-full rounded-[22%] shadow-[0_30px_60px_-20px_rgb(0_0_0/.6)] [animation:float_6s_ease-in-out_infinite]" style={{ background: `linear-gradient(160deg, ${c.accent}, ${c.primary})` }} /></div>
            <div className="absolute left-1/2 top-[73%] h-3 w-[30%] -translate-x-1/2 rounded-full bg-black/30 blur-md" />
            {/* Repères du viseur */}
            {["left-3 top-3 border-l-2 border-t-2", "right-3 top-3 border-r-2 border-t-2", "left-3 bottom-3 border-b-2 border-l-2", "right-3 bottom-3 border-b-2 border-r-2"].map((p) => <span key={p} className={cn("absolute h-6 w-6 border-white mix-blend-difference", p)} />)}
            <span className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-md border-2 border-accent/90 [animation:focus_2.4s_ease-in-out_infinite]" />
            <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/50 px-2 py-0.5 font-mono text-[10px] text-white"><span className="h-1.5 w-1.5 rounded-full bg-red-500" /> REC</span>
            <span className="absolute bottom-4 right-4 rounded-full bg-black/50 px-2.5 py-0.5 font-mono text-[10px] text-white">ISO 100 · f/2.8 · 1/125</span>
            {/* Flash */}
            <span key={flash} className="pointer-events-none absolute inset-0 bg-white opacity-0 [animation:flash_.6s_ease-out]" />
          </div>
          <p key={current.line} className="mt-4 flex items-center gap-2 text-[15px] [animation:fade-in_.4s_ease-out]"><Camera className="h-4 w-4 text-accent" />{current.line}</p>
        </div>

        {/* Les tirages qui se développent */}
        <div className="grid grid-cols-3 gap-3">
          {SHOTS.map((s, i) => {
            const done = i < developed;
            return (
              <figure key={s.label} className={cn("group rounded-[10px] bg-white p-1.5 pb-0 shadow-[0_14px_30px_-14px_rgb(0_0_0/.7)] transition-transform duration-300 hover:-translate-y-1 hover:rotate-0", i % 2 ? "rotate-[1.5deg]" : "-rotate-[1.5deg]")}>
                <div className="relative aspect-square overflow-hidden rounded-[6px] bg-neutral-200">
                  {done ? (
                    <div className="absolute inset-0 [animation:develop_1.4s_ease-out_both]" style={{ background: s.bg(c) }}>
                      <span className="absolute left-1/2 top-1/2 h-[46%] w-[28%] -translate-x-1/2 -translate-y-1/2 rounded-[22%]" style={{ background: `linear-gradient(160deg, ${c.accent}, ${c.primary})` }} />
                    </div>
                  ) : i === developed ? (
                    <span className="absolute inset-0 animate-shimmer bg-[linear-gradient(90deg,rgb(0_0_0/.05),rgb(0_0_0/.15),rgb(0_0_0/.05))] bg-[length:200%_100%]" />
                  ) : null}
                </div>
                <figcaption className="py-1.5 text-center text-[10.5px] font-medium text-neutral-600">{s.label}</figcaption>
              </figure>
            );
          })}
        </div>
      </div>
      <p className="mt-5 text-xs text-fg-faint">Le produit reste le même sur chaque photo, sans personnes. Ça prend en général 1 à 2 minutes.</p>
    </section>
  );
}
