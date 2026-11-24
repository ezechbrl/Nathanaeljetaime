"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { StyleSwipe } from "./StyleSwipe";

const STYLE_NAME: Record<string, string> = { premium: "premium et épuré", direct: "vente directe", lifestyle: "lifestyle chaleureux", tech: "sport et tech" };

// Haut de page : les vraies boutiques créées avec Vigenia, en grand, à aimer (cœur) ou non (croix).
// Le style préféré est gardé et sert pour la boutique qu'on crée ensuite.
export function LandingSwipe() {
  const [done, setDone] = useState<string | null | undefined>(undefined);
  const [round, setRound] = useState(0);
  return (
    <div className="mx-auto max-w-[920px] text-center">
      <p className="text-[clamp(1.4rem,1.1rem+1vw,2rem)] font-semibold tracking-[-0.02em]">Laquelle tu préfères ?</p>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-fg-muted">Des vraies boutiques créées avec Vigenia. Cœur ou croix : ta boutique reprendra le style que tu aimes.</p>
      <div className="mt-5">
        {done === undefined ? (
          <StyleSwipe key={round} big onDone={(st) => setDone(st)} />
        ) : (
          <div className="mx-auto max-w-[520px] rounded-[22px] border border-white/10 bg-white/[0.05] p-6 [animation:fade-in_.4s_ease-out_both]">
            <p className="text-lg font-semibold">{done ? <>C'est noté : tu aimes le style <span className="serif-accent">{STYLE_NAME[done] ?? done}</span>.</> : "Aucune ne t'a plu ? Pas de souci, on s'adapte à ton produit."}</p>
            <p className="mt-2 text-sm text-fg-muted">Colle le lien de ton produit tout en haut, ou laisse-toi guider par le quiz.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Link href="/quiz" className="rounded-full bg-white glow-hover px-5 py-3 text-sm font-semibold text-[#03140d]">Créer ma boutique</Link>
              <Link href="/quiz" className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold">Faire le quiz</Link>
              <button type="button" onClick={() => { setDone(undefined); setRound((r) => r + 1); }} className="inline-flex items-center gap-1.5 rounded-full px-4 py-3 text-sm text-fg-muted hover:text-fg"><RotateCcw className="h-4 w-4" /> Revoir</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
