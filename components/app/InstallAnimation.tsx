"use client";

import { Check, Download, MousePointer2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

// Petit tuto animé (en boucle, ~10 s) : un seul pour les 2 étapes, qui se font de la même façon.
const FRAMES = [
  { label: "Clique sur le bouton vert", caption: "Le fichier se télécharge" },
  { label: "Shopify s'ouvre", caption: "Clique sur « Importer »" },
  { label: "Choisis le fichier", caption: "Celui qui vient de se télécharger" },
  { label: "C'est importé", caption: "Passe à l'étape suivante" },
];

export function InstallAnimation() {
  const [f, setF] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setF((n) => (n + 1) % FRAMES.length), 2500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <figure className="overflow-hidden rounded-card border border-white/10 bg-black/30">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
        {[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 rounded-full bg-white/20" />)}
        <span className="ml-2 truncate text-[11px] text-fg-faint">{f === 0 ? "vigenia.com" : "admin.shopify.com"}</span>
      </div>
      <div className="relative grid h-[170px] place-items-center bg-[radial-gradient(ellipse_at_center,rgb(46_230_166/0.08),transparent_70%)]">
        {/* 1. bouton Vigenia */}
        <Scene on={f === 0}>
          <span className="relative inline-flex items-center gap-2 rounded-[12px] bg-[linear-gradient(180deg,#34f0b0,#0fae7c)] px-5 py-3 text-sm font-semibold text-[#03140d] [animation:press_2.5s_ease-in-out_infinite]">
            Envoyer dans Shopify
            <MousePointer2 className="absolute -bottom-4 right-2 h-5 w-5 fill-white text-black [animation:cursor_2.5s_ease-in-out_infinite]" />
          </span>
          <span className="mt-4 inline-flex items-center gap-1.5 text-xs text-fg-muted [animation:fade-in_.6s_1s_both]"><Download className="h-3.5 w-3.5 text-accent" /> fichier téléchargé</span>
        </Scene>
        {/* 2. page Shopify, bouton Importer */}
        <Scene on={f === 1}>
          <div className="w-[260px] rounded-[10px] bg-white p-3 text-left text-[#1a1a1a]">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold">Ma boutique Shopify</span>
              <span className="relative rounded-[6px] border border-black/15 px-2 py-1 text-[11px] font-medium ring-2 ring-accent [animation:press_2.5s_ease-in-out_infinite]">Importer
                <MousePointer2 className="absolute -bottom-4 -right-2 h-4 w-4 fill-white text-black" />
              </span>
            </div>
            {[0, 1].map((i) => <div key={i} className="mt-2 h-2.5 rounded bg-black/[0.07]" style={{ width: `${80 - i * 25}%` }} />)}
          </div>
        </Scene>
        {/* 3. choisir le fichier */}
        <Scene on={f === 2}>
          <div className="w-[260px] rounded-[10px] bg-white p-3 text-left text-[#1a1a1a]">
            <p className="text-[12px] font-semibold">Importer</p>
            <div className="mt-2 flex items-center gap-2 rounded-[8px] border-2 border-dashed border-accent/70 p-3 text-[11px] [animation:fade-in_.5s_both]">
              <Upload className="h-4 w-4 text-[#0fae7c]" /> fichier téléchargé
            </div>
            <div className="mt-2 ml-auto w-fit rounded-[6px] bg-[#1a1a1a] px-2.5 py-1 text-[11px] font-medium text-white">Importer</div>
          </div>
        </Scene>
        {/* 4. terminé */}
        <Scene on={f === 3}>
          <span className="grid h-14 w-14 place-items-center rounded-full bg-accent text-[#03140d] [animation:pop_.5s_ease-out_both]"><Check className="h-7 w-7" /></span>
        </Scene>
      </div>
      <figcaption className="flex items-center gap-3 border-t border-white/10 px-4 py-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/15 text-xs font-semibold text-accent">{f + 1}</span>
        <span className="min-w-0 text-sm"><span className="font-medium">{FRAMES[f].label}</span> <span className="text-fg-muted">· {FRAMES[f].caption}</span></span>
        <span className="ml-auto flex gap-1">{FRAMES.map((_, i) => <span key={i} className={cn("h-1.5 w-4 rounded-full transition-colors", i === f ? "bg-accent" : "bg-white/15")} />)}</span>
      </figcaption>
    </figure>
  );
}

function Scene({ on, children }: { on: boolean; children: React.ReactNode }) {
  return (
    <div aria-hidden={!on} className={cn("absolute inset-0 flex flex-col items-center justify-center transition-all duration-500", on ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0")}>
      {on && children}
    </div>
  );
}
