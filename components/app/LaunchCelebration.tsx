"use client";

import { ArrowRight, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Store } from "@/lib/api/types";

// Explosion de confettis aux couleurs de la marque.
function Confetti({ colors }: { colors: string[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = (canvas.width = window.innerWidth * dpr) / dpr;
    const h = (canvas.height = window.innerHeight * dpr) / dpr;
    ctx.scale(dpr, dpr);
    const burst = (x: number, y: number, n: number, spread: number) =>
      Array.from({ length: n }, () => {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * spread;
        const v = 6 + Math.random() * 11;
        return { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.4, s: 5 + Math.random() * 7, c: colors[Math.floor(Math.random() * colors.length)], round: Math.random() < 0.3 };
      });
    const ps = [...burst(w * 0.5, h * 0.55, 140, Math.PI * 1.1), ...burst(0, h, 70, 0.9).map((p) => ({ ...p, vx: Math.abs(p.vx) + 4 })), ...burst(w, h, 70, 0.9).map((p) => ({ ...p, vx: -Math.abs(p.vx) - 4 }))];
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const fade = Math.max(0, 1 - (t - t0 - 2600) / 1200);
      for (const p of ps) {
        p.vy += 0.28; p.vx *= 0.985; p.vy *= 0.985;
        p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.s / 2.4, 0, Math.PI * 2); ctx.fill(); }
        else ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        ctx.restore();
      }
      if (fade > 0) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [colors]);
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 h-full w-full" />;
}

export function LaunchCelebration({ store, onClose }: { store: Store; onClose: () => void }) {
  const c = store.theme.colors;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label="Ta boutique est prête" onClick={onClose} className="fixed inset-0 z-50 grid place-items-center bg-[#020a06]/80 p-5 backdrop-blur-md [animation:fade-in_.4s_ease-out]">
      <Confetti colors={[c.accent, c.primary, "#5ed38c", "#ffffff", "#f5c451"]} />
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-[460px] text-center [animation:rise_.6s_.15s_cubic-bezier(.2,.8,.2,1)_both]">
        <div className="relative mx-auto grid h-24 w-24 place-items-center">
          <span className="absolute inset-0 rounded-full border-2 border-accent [animation:ring-out_1.6s_.3s_ease-out_infinite]" />
          <span className="absolute inset-0 rounded-full border-2 border-accent [animation:ring-out_1.6s_.9s_ease-out_infinite]" />
          <span className="grid h-20 w-20 place-items-center rounded-full bg-[linear-gradient(160deg,#00a676,#007a5a)] shadow-[0_0_60px_rgb(0_166_118/.6)] [animation:pop-in_.5s_.2s_cubic-bezier(.34,1.56,.64,1)_both]">
            <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="white" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" strokeDasharray={30} className="[animation:draw-check_.5s_.6s_ease-out_both]" /></svg>
          </span>
        </div>
        <p className="mt-7 text-sm uppercase tracking-[0.2em] text-accent">C'est prêt</p>
        <h2 className="mt-2 text-h2">Ta boutique <span className="serif-accent">{store.name}</span> est née</h2>
        <p className="mx-auto mt-3 max-w-sm text-fg-muted">Textes, fiche produit, pages et couleurs : tout est en place. Jette un œil, ajuste ce que tu veux, puis publie sur Shopify.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" autoFocus onClick={onClose} className="inline-flex h-11 items-center justify-center gap-2 rounded-ctl border border-accent/40 bg-[linear-gradient(180deg,#00a676,#007a5a)] px-5 text-[15px] font-medium text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_10px_30px_-8px_rgb(0_166_118/0.7)]">
            Découvrir ma boutique <ArrowRight className="h-4 w-4" />
          </button>
          <Link href={`/app/boutiques/${store.id}/editeur`} onClick={onClose} className="inline-flex h-11 items-center justify-center gap-2 rounded-ctl border border-white/15 px-5 text-[15px] text-fg hover:bg-white/5">
            <MessageSquare className="h-4 w-4" /> Modifier avec l'IA
          </Link>
        </div>
      </div>
    </div>
  );
}
