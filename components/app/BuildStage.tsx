"use client";

import { Check, ImageIcon, Type } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Job, JobStepKey, Store } from "@/lib/api/types";
import { cn } from "@/lib/cn";

type Colors = Store["theme"]["colors"];

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Particules aux couleurs de la marque, aspirées en spirale vers la boutique.
function ParticleField({ colors, active }: { colors: Colors; active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || reduced()) return;
    const ctx = canvas.getContext("2d")!;
    const palette = [colors.accent, colors.primary, "#5ed38c", "#ffffff"];
    let w = 0, h = 0, raf = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    type P = { a: number; r: number; v: number; s: number; c: string; life: number };
    const spawn = (): P => ({ a: Math.random() * Math.PI * 2, r: Math.max(w, h) * (0.45 + Math.random() * 0.35), v: 0.4 + Math.random() * 0.9, s: 0.6 + Math.random() * 1.8, c: palette[Math.floor(Math.random() * palette.length)], life: 0 });
    const ps: P[] = Array.from({ length: 90 }, () => { const p = spawn(); p.r *= Math.random(); return p; });

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      const speed = activeRef.current ? 1 : 0.35;
      for (const p of ps) {
        p.life += 1;
        p.a += (0.004 + 0.9 / Math.max(p.r, 30)) * speed;
        p.r -= p.v * speed * (1 + 60 / Math.max(p.r, 20));
        if (p.r < 18) Object.assign(p, spawn());
        const x = cx + Math.cos(p.a) * p.r * 1.25;
        const y = cy + Math.sin(p.a) * p.r * 0.7;
        const fade = Math.min(1, p.life / 40) * Math.min(1, p.r / 120);
        ctx.globalAlpha = 0.75 * fade;
        ctx.fillStyle = p.c;
        ctx.shadowColor = p.c;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(x, y, p.s, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [colors.accent, colors.primary]);

  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />;
}

// Une pièce de la boutique : plan (pointillés) tant qu'elle n'est pas prête, puis elle se pose à sa place.
function Layer({ built, depth, label, className, children, delay = 0 }: { built: boolean; depth: number; label: string; className?: string; children: React.ReactNode; delay?: number }) {
  return (
    <div
      className={cn("relative rounded-md transition-[transform,opacity,box-shadow] duration-[1100ms] [transform-style:preserve-3d] [transition-timing-function:cubic-bezier(.34,1.45,.5,1)]", className)}
      style={{
        transform: built ? "translateZ(0px)" : `translateZ(${depth}px)`,
        boxShadow: built ? "none" : "0 30px 40px -18px rgb(0 0 0 / .45)",
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className={cn("transition-opacity duration-700", built ? "opacity-100" : "opacity-0")}>{children}</div>
      <div aria-hidden className={cn("absolute inset-0 rounded-md border border-dashed border-[#5ed38c]/70 bg-[#0b2a1d]/85 transition-opacity duration-500 [background-image:linear-gradient(rgb(94_211_140/.12)_1px,transparent_1px),linear-gradient(90deg,rgb(94_211_140/.12)_1px,transparent_1px)] [background-size:12px_12px]", built ? "opacity-0" : "opacity-100")}>
        <span className="absolute left-2 top-1.5 font-mono text-[8px] uppercase tracking-[0.18em] text-[#5ed38c]">{label}</span>
      </div>
    </div>
  );
}

// Petites étiquettes qui sortent de la boutique au fil des étapes.
function Chip({ show, className, children, delay = 0 }: { show: boolean; className: string; children: React.ReactNode; delay?: number }) {
  if (!show) return null;
  return (
    <div className={cn("absolute z-20 [animation:chip-in_.7s_cubic-bezier(.34,1.56,.64,1)_both]", className)} style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center gap-2 rounded-full border border-white/15 bg-[#0d2419]/90 px-3 py-1.5 text-[11px] text-fg shadow-[0_12px_30px_-10px_rgb(0_0_0/.8)] backdrop-blur [animation:float_5s_ease-in-out_infinite]" style={{ animationDelay: `${delay}ms` }}>
        {children}
      </div>
    </div>
  );
}

export function BuildStage({ store, job, mobile }: { store: Store; job: Job | null; mobile: boolean }) {
  const colors = store.theme.colors;
  const publishing = job?.kind === "publish";
  const steps = job?.steps ?? [];
  const done = (k: JobStepKey) => publishing || steps.some((s) => s.key === k && s.status === "done");
  const running = steps.find((s) => s.status === "running")?.key;
  const progress = publishing ? 1 : Math.min(1, (job?.progress ?? 3) / 100);
  const finished = done("theme");

  // Caméra : vue isométrique au départ, elle pivote vers la vue de face à mesure que la boutique se monte.
  const rx = 50 - 44 * progress;
  const rz = -24 * (1 - progress);
  const sc = 0.82 + 0.18 * progress;

  const wrap = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  function onMove(e: React.PointerEvent) {
    if (reduced() || e.pointerType !== "mouse") return;
    const r = wrap.current!.getBoundingClientRect();
    setTilt({ x: ((e.clientY - r.top) / r.height - 0.5) * -10, y: ((e.clientX - r.left) / r.width - 0.5) * 12 });
  }

  const brand = done("brand");
  const accent = brand ? colors.accent : "#9aa7a1";
  const primary = brand ? colors.primary : "#6f7a75";

  return (
    <div ref={wrap} onPointerMove={onMove} onPointerLeave={() => setTilt({ x: 0, y: 0 })} className="relative isolate flex min-h-[460px] items-center justify-center sm:min-h-[540px]">
      <ParticleField colors={colors} active={!finished} />
      <div aria-hidden className="absolute inset-[11%] -z-10 animate-spin-slow rounded-full opacity-60 blur-3xl [animation-duration:18s]" style={{ background: `conic-gradient(from 0deg, ${colors.accent}, transparent 30%, ${colors.primary}, transparent 65%, #5ed38c, transparent)` }} />
      <div aria-hidden className="absolute inset-[6%] -z-10 rounded-full border border-white/[0.06] [animation:spin-slow_40s_linear_infinite]">
        <span className="absolute -top-1 left-1/2 h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_rgb(94_211_140)]" />
      </div>

      <div className="[perspective:1600px]">
        <div
          className="transition-transform duration-[1400ms] ease-out [transform-style:preserve-3d]"
          style={{ transform: `rotateX(${rx + tilt.x}deg) rotateY(${tilt.y}deg) rotateZ(${rz}deg) scale(${sc})` }}
        >
          <div className={cn("relative space-y-2 rounded-[14px] border border-white/10 bg-[#f7f6f2] p-2 text-[#1d1d22] shadow-[0_60px_100px_-40px_rgb(0_0_0/0.9)] transition-[width] duration-700 [transform-style:preserve-3d]", mobile ? "w-[270px]" : "w-[min(520px,82vw)]")}>
            {/* sol de chantier : la grille s'efface quand le thème est appliqué */}
            <div aria-hidden className={cn("pointer-events-none absolute inset-0 rounded-[14px] transition-opacity duration-1000 [background-image:linear-gradient(rgb(0_128_96/.12)_1px,transparent_1px),linear-gradient(90deg,rgb(0_128_96/.12)_1px,transparent_1px)] [background-size:16px_16px]", finished ? "opacity-0" : "opacity-100")} />

            <Layer built={brand} depth={150} label="Bandeau">
              <div className="rounded-md py-1.5 text-center text-[8px] tracking-wide text-white" style={{ background: primary }}>Livraison offerte · Retours 30 jours</div>
            </Layer>
            <Layer built={brand} depth={120} label="En-tête" delay={120}>
              <div className="flex items-center justify-between rounded-md px-2 py-2">
                <span className="flex items-center gap-1.5 text-[12px] font-semibold"><span className="h-4 w-4 rounded-full" style={{ background: accent }} />{store.name}</span>
                <span className="flex gap-3 text-[8px] text-black/50"><span>Boutique</span><span>À propos</span><span>FAQ</span></span>
              </div>
            </Layer>
            <div className={cn("grid gap-2 [transform-style:preserve-3d]", !mobile && "grid-cols-[1.1fr_1fr]")}>
              <Layer built={done("pages")} depth={95} label="Accroche">
                <div className="flex h-full flex-col justify-center space-y-1.5 px-2 py-3">
                  <p className="text-[17px] font-semibold leading-tight tracking-tight">Ta promesse, en grand.</p>
                  <p className="text-[9px] text-black/55">Une phrase qui dit pourquoi on doit acheter chez toi.</p>
                  <div className={cn("flex items-center gap-2 pt-1 transition-opacity duration-500", done("product") ? "opacity-100" : "opacity-0")}>
                    <span className="rounded-full px-3 py-1 text-[8px] font-medium text-white" style={{ background: accent }}>Acheter · 29,00 €</span>
                    <span className="text-[8px] text-black/50">★ 4,8</span>
                  </div>
                </div>
              </Layer>
              <Layer built={done("images")} depth={170} label="Visuel" delay={80}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-md" style={{ background: `linear-gradient(150deg, ${colors.background}, ${accent}66)` }}>
                  <div className="absolute left-1/2 top-1/2 h-[60%] w-[30%] -translate-x-1/2 -translate-y-1/2 rounded-[18%] shadow-xl" style={{ background: `linear-gradient(160deg, ${accent}, ${primary})` }} />
                </div>
              </Layer>
            </div>
            <div className={cn("grid gap-2 [transform-style:preserve-3d]", mobile ? "grid-cols-1" : "grid-cols-3")}>
              {["Pourquoi nous", "Ce qui change", "Garantie"].map((t, k) => (
                <Layer key={t} built={done("pages")} depth={60 + k * 30} label={`Bloc ${k + 1}`} delay={200 + k * 140}>
                  <div className="space-y-1 rounded-md bg-black/[0.035] p-2">
                    <span className="block text-[9px] font-medium">{t}</span>
                    <span className="block h-1.5 w-[90%] rounded bg-black/10" /><span className="block h-1.5 w-[70%] rounded bg-black/10" />
                  </div>
                </Layer>
              ))}
            </div>

            {/* faisceau de scan pendant la construction */}
            {!finished && <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-16 rounded-[14px] [animation:scan_2.8s_ease-in-out_infinite] [background:linear-gradient(180deg,transparent,rgb(94_211_140/.35)_50%,transparent)] [transform:translateZ(40px)]"><span className="absolute inset-x-0 top-1/2 h-px bg-[#5ed38c] shadow-[0_0_14px_2px_rgb(94_211_140)]" /></div>}
            {/* reflet final quand tout est en place */}
            {finished && <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[14px]"><span className="absolute inset-y-0 -left-1/2 w-1/3 skew-x-[-20deg] bg-[linear-gradient(90deg,transparent,rgb(255_255_255/.7),transparent)] [animation:shine_1.4s_.3s_ease-out_both]" /></div>}
          </div>
        </div>
      </div>

      <Chip show={brand || running === "brand"} className="left-[2%] top-[10%] sm:left-[4%]">
        {brand ? <span className="flex -space-x-1">{[colors.primary, colors.accent, colors.background].map((c) => <span key={c} className="h-3.5 w-3.5 rounded-full ring-2 ring-[#0d2419]" style={{ background: c }} />)}</span> : <span className="h-3 w-3 animate-spin rounded-full border-2 border-accent border-r-transparent" />}
        {brand ? "Palette choisie" : "Palette…"}
      </Chip>
      <Chip show={brand} className="right-[3%] top-[16%] sm:right-[6%]" delay={300}>
        <Type className="h-3.5 w-3.5 text-accent" /> {store.theme.headingFont || "Police"}
      </Chip>
      <Chip show={done("pages")} className="bottom-[22%] left-[1%] sm:left-[3%]" delay={150}>
        <Check className="h-3.5 w-3.5 text-accent" /> Accueil, FAQ, À propos
      </Chip>
      <Chip show={done("product")} className="right-[2%] top-[46%] sm:right-[4%]" delay={100}>
        <span className="rounded bg-accent/20 px-1.5 py-0.5 font-medium tabular-nums text-accent">29,00 €</span> Fiche produit
      </Chip>
      <Chip show={done("images") || running === "images"} className="bottom-[8%] right-[10%]" delay={100}>
        <ImageIcon className="h-3.5 w-3.5 text-accent" /> {done("images") ? "Visuels prêts" : "Visuels…"}
      </Chip>
      <Chip show={finished} className="bottom-[6%] left-[12%]" delay={500}>
        <span className="grid h-4 w-4 place-items-center rounded-full bg-accent text-[#06180f]"><Check className="h-3 w-3" /></span> {publishing ? "Envoi à Shopify…" : "Thème appliqué"}
      </Chip>
    </div>
  );
}
