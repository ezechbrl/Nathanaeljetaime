"use client";

import { Heart, X } from "lucide-react";
import { useRef, useState } from "react";
import { SHOWCASE } from "@/lib/content/showcase";
import { StoreLongFrame } from "./StoreFrame";

// Boutiques à aimer ou non (cœur / croix) : elles servent à choisir le style de la boutique.
export const STYLE_OF: Record<string, string> = { "pas-sur": "premium", "maison-ouate": "premium", kordo: "direct", delie: "direct", nido: "lifestyle", macho: "lifestyle", velaro: "tech", silencio: "tech" };
export const STYLE_TEXT: Record<string, string> = {
  premium: "Style de boutique souhaité : premium minimal, élégant et épuré.",
  direct: "Style de boutique souhaité : vente directe, orienté problème puis solution.",
  lifestyle: "Style de boutique souhaité : lifestyle chaleureux, avec des photos de vie.",
  tech: "Style de boutique souhaité : sport et tech, fond sombre et couleurs vives.",
};
export const SWIPE = ["pas-sur", "kordo", "nido", "velaro", "macho", "silencio"].map((slug) => SHOWCASE.find((x) => x.slug === slug)).filter((x): x is (typeof SHOWCASE)[number] => !!x);

const LIKED_KEY = "vg-liked-style";
export function likedStyle(): string | null {
  try { return localStorage.getItem(LIKED_KEY); } catch { return null; }
}
function saveLikedStyle(style: string | null) {
  try { if (style) localStorage.setItem(LIKED_KEY, style); else localStorage.removeItem(LIKED_KEY); } catch { /* stockage indisponible */ }
}

// Boutiques à aimer (cœur) ou non (croix), comme sur une appli de rencontre : on peut aussi les faire glisser.
export function StyleSwipe({ onDone }: { onDone: (style: string | null) => void }) {
  const [i, setI] = useState(0);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [fly, setFly] = useState<"left" | "right" | null>(null);
  const [dx, setDx] = useState(0);
  const start = useRef<number | null>(null);
  const s = SWIPE[i];

  function decide(like: boolean) {
    if (!s || fly) return;
    const next = { ...likes };
    if (like) next[STYLE_OF[s.slug]] = (next[STYLE_OF[s.slug]] ?? 0) + 1;
    setFly(like ? "right" : "left");
    window.setTimeout(() => {
      setFly(null); setDx(0); setLikes(next);
      if (i + 1 >= SWIPE.length) {
        const best = Object.entries(next).sort((a, b) => b[1] - a[1])[0];
        saveLikedStyle(best ? best[0] : null);
        onDone(best ? best[0] : null);
      } else setI(i + 1);
    }, 280);
  }

  if (!s) return null;
  const tx = fly === "right" ? 520 : fly === "left" ? -520 : dx;
  return (
    <div className="flex flex-col items-center">
      <p className="mb-4 text-center text-sm text-fg-muted">{i + 1} / {SWIPE.length}</p>
      <div className="relative h-[430px] w-full max-w-[320px]">
        {SWIPE[i + 1] && <div className="absolute inset-0 scale-[0.94] rounded-[22px] opacity-50" style={{ background: SWIPE[i + 1].palette.accent }} />}
        <div
          onPointerDown={(e) => { start.current = e.clientX; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); }}
          onPointerMove={(e) => { if (start.current !== null) setDx(e.clientX - start.current); }}
          onPointerUp={() => { const d = dx; start.current = null; if (d > 90) decide(true); else if (d < -90) decide(false); else setDx(0); }}
          className="absolute inset-0 cursor-grab touch-pan-y select-none overflow-hidden rounded-[22px] p-4 shadow-[0_30px_60px_-25px_rgb(0_0_0/0.8)] ring-1 ring-white/15 active:cursor-grabbing"
          style={{ transform: `translateX(${tx}px) rotate(${tx / 22}deg)`, transition: start.current !== null ? "none" : "transform .28s ease-out", background: `linear-gradient(165deg, color-mix(in oklab, ${s.palette.accent} 70%, white), ${s.palette.accent} 55%, color-mix(in oklab, ${s.palette.accent} 75%, black))` }}
        >
          <div className="pointer-events-none"><StoreLongFrame s={s} /></div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-5 pb-4 pt-10">
            <p className="text-xl font-semibold text-white">{s.name}</p>
            <p className="text-xs text-white/75">{s.category}</p>
          </div>
          {dx > 30 && <span className="pointer-events-none absolute left-4 top-4 rotate-[-12deg] rounded-lg border-2 border-[#34f0b0] px-2 py-0.5 text-sm font-bold text-[#34f0b0]">J'AIME</span>}
          {dx < -30 && <span className="pointer-events-none absolute right-4 top-4 rotate-[12deg] rounded-lg border-2 border-[#fb7185] px-2 py-0.5 text-sm font-bold text-[#fb7185]">BOF</span>}
        </div>
      </div>
      <div className="mt-6 flex items-center gap-6">
        <button type="button" aria-label="Je n'aime pas" onClick={() => decide(false)} className="grid h-16 w-16 place-items-center rounded-full border border-[#fb7185]/50 bg-[#fb7185]/10 text-[#fb7185] shadow-[0_10px_30px_-10px_rgb(251_113_133/0.7)] transition-transform hover:scale-110 active:scale-95"><X className="h-8 w-8" /></button>
        <button type="button" aria-label="J'aime" onClick={() => decide(true)} className="grid h-20 w-20 place-items-center rounded-full bg-[linear-gradient(160deg,#34f0b0,#0fae7c)] text-[#03140d] shadow-[0_12px_36px_-8px_rgb(46_230_166/0.8)] transition-transform hover:scale-110 active:scale-95"><Heart className="h-9 w-9 fill-current" /></button>
      </div>
    </div>
  );
}

