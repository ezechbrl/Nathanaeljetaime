"use client";

import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

// Tuile d'attente d'une photo : verre sombre, balayage lumineux vert, étincelle,
// texte court qui change et fine barre de progression.
const LINES = ["Lumière…", "Mise en scène…", "Cadrage…", "Finitions…"];

export function PhotoLoadingTile({ progress, className, delay = 0 }: { progress?: number; className?: string; delay?: number }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setI((n) => (n + 1) % LINES.length), 1600);
    return () => window.clearInterval(t);
  }, []);
  return (
    <div role="status" aria-label="Photo en préparation" className={cn("relative isolate overflow-hidden rounded-card border border-[#2ee6a6]/25 bg-[linear-gradient(160deg,rgb(10_45_35/0.9),rgb(3_16_12/0.95))]", className)}>
      <div aria-hidden className="absolute inset-0 opacity-30 [background-image:radial-gradient(rgb(167_243_208/0.5)_1px,transparent_1.2px)] [background-size:14px_14px]" />
      <div aria-hidden className="absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-[linear-gradient(90deg,transparent,rgb(46_230_166/0.22),transparent)] [animation:photo-sweep_1.8s_ease-in-out_infinite]" style={{ animationDelay: `${delay}ms` }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 p-3 text-center">
        <span className="grid h-9 w-9 place-items-center rounded-full border border-[#2ee6a6]/40 bg-[#2ee6a6]/10 shadow-[0_0_18px_-2px_rgb(46_230_166/0.6)]">
          <Sparkles className="h-4 w-4 animate-pulse text-[#6ee7b7]" />
        </span>
        <p key={i} className="text-[12.5px] font-medium text-[#a7f3d0] [animation:fade-in_.35s_ease-out]">{LINES[i]}</p>
      </div>
      <div className="absolute inset-x-3 bottom-3 h-1 overflow-hidden rounded-full bg-white/[0.08]">
        {progress != null ? (
          <div className="h-full rounded-full bg-[linear-gradient(90deg,#10b07f,#6ee7b7)] transition-[width] duration-500" style={{ width: `${Math.max(6, Math.min(100, progress))}%` }} />
        ) : (
          <div className="h-full w-1/3 rounded-full bg-[linear-gradient(90deg,transparent,#6ee7b7,transparent)] [animation:photo-bar_1.4s_ease-in-out_infinite]" />
        )}
      </div>
    </div>
  );
}

// Image qui arrive en fondu, de floue à nette (~400 ms), chargée seulement quand elle approche de l'écran.
export function FadeImage({ src, alt, className, eager = false }: { src: string; alt: string; className?: string; eager?: boolean }) {
  const [loaded, setLoaded] = useState(false);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onLoad={() => setLoaded(true)}
      ref={(el) => { if (el?.complete && el.naturalWidth) setLoaded(true); }}
      className={cn("transition-[opacity,filter,transform] duration-[400ms] ease-out", loaded ? "opacity-100 blur-0" : "scale-[1.02] opacity-0 blur-md", className)}
    />
  );
}
