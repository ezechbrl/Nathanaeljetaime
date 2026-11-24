"use client";

import { Heart, X } from "lucide-react";
import { useRef, useState } from "react";
import { SHOWCASE, cardColor } from "@/lib/content/showcase";
import { cn } from "@/lib/cn";
import { StoreFrame, StoreLongFrame } from "./StoreFrame";

// Boutiques à aimer ou non (cœur / croix) : elles servent à choisir le style de la boutique.
export const STYLE_OF: Record<string, string> = { "pas-sur": "premium", "maison-ouate": "premium", "maison-brume": "premium", kordo: "direct", delie: "direct", klinn: "direct", nido: "lifestyle", macho: "lifestyle", velaro: "tech", silencio: "tech", vortex: "tech" };
export const STYLE_TEXT: Record<string, string> = {
  premium: "Style de boutique souhaité : premium minimal, élégant et épuré.",
  direct: "Style de boutique souhaité : vente directe, orienté problème puis solution.",
  lifestyle: "Style de boutique souhaité : lifestyle chaleureux, avec des photos de vie.",
  tech: "Style de boutique souhaité : sport et tech, fond sombre et couleurs vives.",
};
// Une boutique par style, différentes de celles de la grille de l'accueil, couleurs chaudes et froides mêlées.
export const SWIPE = ["maison-brume", "klinn", "nido", "vortex"].map((slug) => SHOWCASE.find((x) => x.slug === slug)).filter((x): x is (typeof SHOWCASE)[number] => !!x);

const LIKED_KEY = "vg-liked-style";
export function likedStyle(): string | null {
  try { return localStorage.getItem(LIKED_KEY); } catch { return null; }
}
function saveLikedStyle(style: string | null) {
  try { if (style) localStorage.setItem(LIKED_KEY, style); else localStorage.removeItem(LIKED_KEY); } catch { /* stockage indisponible */ }
}

// Boutiques à aimer (cœur) ou non (croix), comme sur une appli de rencontre : on peut aussi les faire glisser.
// `big` (page d'accueil) : grande carte, la boutique en version ordinateur sur grand écran, en long sur téléphone.
export function StyleSwipe({ onDone, big = false, compact = false }: { onDone: (style: string | null) => void; big?: boolean; compact?: boolean }) {
  const [i, setI] = useState(0);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [fly, setFly] = useState<"left" | "right" | null>(null);
  const [burst, setBurst] = useState<{ like: boolean; n: number } | null>(null);
  const [dx, setDx] = useState(0);
  const start = useRef<number | null>(null);
  const s = SWIPE[i];

  function decide(like: boolean) {
    if (!s || fly) return;
    const next = { ...likes };
    if (like) next[STYLE_OF[s.slug]] = (next[STYLE_OF[s.slug]] ?? 0) + 1;
    setFly(like ? "right" : "left");
    setBurst({ like, n: Date.now() });
    window.setTimeout(() => {
      setFly(null); setDx(0); setLikes(next);
      if (i + 1 >= SWIPE.length) {
        const best = Object.entries(next).sort((a, b) => b[1] - a[1])[0];
        saveLikedStyle(best ? best[0] : null);
        onDone(best ? best[0] : null);
      } else setI(i + 1);
    }, 420);
  }

  if (!s) return null;
  const tx = fly === "right" ? (big ? 1100 : 520) : fly === "left" ? (big ? -1100 : -520) : dx;
  return (
    <div className="flex flex-col items-center">
      <p className="mb-4 text-center text-sm text-fg-muted">{i + 1} / {SWIPE.length}</p>
      <div className={cn("relative w-full", big ? cn("h-[540px] max-w-[440px] sm:h-auto sm:aspect-[16/10.6]", compact ? "sm:max-w-[640px]" : "sm:max-w-[860px]") : "h-[430px] max-w-[320px]")}>
        {SWIPE[i + 1] && <div className="absolute inset-0 scale-[0.94] rounded-[22px] opacity-50" style={{ background: cardColor(SWIPE[i + 1]) }} />}
        <div
          onPointerDown={(e) => { start.current = e.clientX; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); }}
          onPointerMove={(e) => { if (start.current !== null) setDx(e.clientX - start.current); }}
          onPointerUp={() => { const d = dx; start.current = null; if (d > 90) decide(true); else if (d < -90) decide(false); else setDx(0); }}
          className={cn("absolute inset-0 cursor-grab touch-pan-y select-none overflow-hidden rounded-[22px] p-4 shadow-[0_30px_60px_-25px_rgb(0_0_0/0.8)] ring-1 ring-white/15 active:cursor-grabbing", big && "sm:p-7")}
          style={{ transform: `translateX(${tx}px) rotate(${tx / 22}deg)`, transition: start.current !== null ? "none" : "transform .42s cubic-bezier(.4,0,.6,1)", background: `linear-gradient(165deg, color-mix(in oklab, ${cardColor(s)} 70%, white), ${cardColor(s)} 55%, color-mix(in oklab, ${cardColor(s)} 75%, black))` }}
        >
          {big ? (
            <>
              <div className="pointer-events-none sm:hidden"><StoreLongFrame s={s} /></div>
              <div className="pointer-events-none hidden sm:block"><StoreFrame s={s} /></div>
            </>
          ) : <div className="pointer-events-none"><StoreLongFrame s={s} /></div>}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-5 pb-4 pt-10">
            <p className={cn("text-xl font-semibold text-white", big && "sm:text-2xl")}>{s.name}</p>
            <p className="text-xs text-white/75">{s.category}</p>
          </div>
          {(dx > 30 || fly === "right") && <span className="pointer-events-none absolute left-4 top-4 rotate-[-12deg] rounded-lg border-2 border-white/15 px-2 py-0.5 text-sm font-bold text-[#3dff9a]">J'AIME</span>}
          {(dx < -30 || fly === "left") && <span className="pointer-events-none absolute right-4 top-4 rotate-[12deg] rounded-lg border-2 border-[#fb7185] px-2 py-0.5 text-sm font-bold text-[#fb7185]">BOF</span>}
        </div>
        {/* Animation du choix : un grand cœur qui s'envole avec des petits cœurs, ou une croix qui part à gauche. */}
        {burst && (
          <div key={burst.n} aria-hidden className="pointer-events-none absolute inset-0 z-10 grid place-items-center overflow-visible">
            {burst.like ? (
              <>
                <Heart className="h-28 w-28 fill-[#3dff9a] text-[#3dff9a] drop-shadow-[0_0_30px_rgb(255_255_255/0.8)] [animation:swipe-heart_.9s_cubic-bezier(.2,.8,.2,1)_forwards]" />
                {[-70, -35, 0, 35, 70, -50, 50].map((x, k) => (
                  <Heart key={k} className="absolute h-6 w-6 fill-[#f472b6] text-[#f472b6] [animation:swipe-float_1s_ease-out_forwards]" style={{ ["--x" as string]: `${x}px`, animationDelay: `${k * 50}ms`, opacity: 0 }} />
                ))}
              </>
            ) : (
              <span className="grid h-28 w-28 place-items-center rounded-full bg-[#fb7185]/90 text-white shadow-[0_0_40px_rgb(251_113_133/0.7)] [animation:swipe-nope_.8s_cubic-bezier(.4,0,.6,1)_forwards]"><X className="h-16 w-16" strokeWidth={3} /></span>
            )}
          </div>
        )}
      </div>
      <div className="mt-6 flex items-center gap-6">
        <button type="button" aria-label="Je n'aime pas" onClick={() => decide(false)} className="grid h-16 w-16 place-items-center rounded-full border border-[#fb7185]/50 bg-[#fb7185]/10 text-[#fb7185] shadow-[0_10px_30px_-10px_rgb(251_113_133/0.7)] transition-transform hover:scale-110 active:scale-95"><X className="h-8 w-8" /></button>
        <button type="button" aria-label="J'aime" onClick={() => decide(true)} className="grid h-20 w-20 place-items-center rounded-full bg-[linear-gradient(180deg,#14b886,#00876a)] glow-hover text-white transition-transform hover:scale-110 active:scale-95"><Heart className="h-9 w-9 fill-current" /></button>
      </div>
    </div>
  );
}

