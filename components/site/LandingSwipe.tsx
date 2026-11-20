"use client";

import { ArrowUp, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { StyleSwipe } from "./StyleSwipe";

const LABEL: Record<string, string> = { premium: "Premium et épuré", direct: "Vente directe", lifestyle: "Lifestyle chaleureux", tech: "Sport et tech" };

// Page d'accueil : on aime (cœur) ou pas (croix) de vraies boutiques créées avec Vigenia.
// Le style le plus aimé est gardé et appliqué à la boutique que la personne crée ensuite.
export function LandingSwipe() {
  const [result, setResult] = useState<string | null | undefined>(undefined);
  const [round, setRound] = useState(0);
  return (
    <section className="py-16">
      <div className="mx-auto max-w-[1100px] px-4 text-center sm:px-6">
        <Reveal as="h2" className="text-h2">Quelle boutique te <span className="serif-accent">plaît</span> ?</Reveal>
        <Reveal delay={80} as="p" className="mx-auto mt-3 max-w-lg text-fg-muted">Des vraies boutiques créées avec Vigenia. Un cœur si tu aimes, une croix sinon : on créera la tienne dans le style que tu préfères.</Reveal>
        <div className="mt-8">
          {result === undefined ? (
            <StyleSwipe key={round} onDone={(s) => setResult(s)} />
          ) : (
            <div className="mx-auto max-w-md rounded-[22px] border border-[#34f0b0]/40 bg-[#34f0b0]/[0.07] p-6 [animation:fade-in_.4s_ease-out_both]">
              <p className="text-sm text-fg-muted">{result ? "Ton style préféré" : "Aucune boutique aimée"}</p>
              <p className="mt-1 text-2xl font-semibold text-white">{result ? LABEL[result] : "Pas de souci"}</p>
              <p className="mt-2 text-sm text-fg-muted">{result ? "Ta boutique sera créée dans ce style." : "L'IA choisira le style qui va le mieux avec ton produit."}</p>
              <a href="#creer" className="mt-5 inline-flex h-12 items-center gap-2 rounded-full bg-[linear-gradient(180deg,#34f0b0,#0fae7c)] px-6 font-semibold text-[#03140d] shadow-[0_10px_30px_-10px_rgb(46_230_166/0.8)]">Créer ma boutique <ArrowUp className="h-4 w-4" /></a>
              <button type="button" onClick={() => { setResult(undefined); setRound((r) => r + 1); }} className="mt-4 flex w-full items-center justify-center gap-1.5 text-sm text-fg-muted hover:text-white"><RotateCcw className="h-3.5 w-3.5" /> Recommencer</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
