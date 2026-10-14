"use client";

import { RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Section";
import { cn } from "@/lib/cn";
import { SHOWCASE, type ShowcaseStore } from "@/lib/content/showcase";
import { StoreFrame } from "./StoreFrame";

// Mini éditeur : on clique une demande, la boutique change (réponses préparées, sans IA).
const BASE = SHOWCASE[3];
const COLORS = ["#b5651d", "#1f6f8b", "#7b3fa0", "#2f7d4f"];

type Edit = { id: string; ask: string; reply: string; apply: (s: ShowcaseStore, k: number) => ShowcaseStore };
const EDITS: Edit[] = [
  {
    id: "premium", ask: "Rends le ton plus premium", reply: "J'ai réécrit l'accroche, plus sobre, et passé les titres en serif.",
    apply: (s) => ({ ...s, headline: "Le café, comme un grand cru.", sub: "Torréfié en petits lots, noté 85+ par nos dégustateurs.", font: "serif" }),
  },
  {
    id: "lot", ask: "Ajoute un lot de 3 à −20 %", reply: "C'est fait : le lot est sous le prix, avec l'économie affichée.",
    apply: (s) => ({ ...s, price: "34,80 € les 3", sub: `${s.sub} Lot de 3 : −20 %.`, layout: "split" }),
  },
  {
    id: "color", ask: "Change la couleur principale", reply: "Nouvelle couleur appliquée partout : boutons, bandeau et visuels.",
    apply: (s, k) => ({ ...s, palette: { ...s.palette, accent: COLORS[k % COLORS.length], ink: "#14202a" } }),
  },
  {
    id: "en", ask: "Traduis en anglais", reply: "Boutique réécrite en anglais (pas traduite mot à mot).",
    apply: (s) => ({ ...s, headline: s.font === "serif" ? "Coffee, like a fine wine." : "Roasted Tuesday, at your door Thursday.", sub: "Small-batch specialty coffee, rated 85+.", price: s.price.includes("3") ? "$38 for 3" : "$16", language: "anglais" }),
  },
];

export function ChatDemo() {
  const [done, setDone] = useState<string[]>([]);
  const [colorTurn, setColorTurn] = useState(0);
  const [typing, setTyping] = useState(false);
  const log = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = log.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [done, typing]);

  const store = done.reduce((s, id, i) => EDITS.find((e) => e.id === id)!.apply(s, colorTurn + i), BASE);

  function ask(e: Edit) {
    if (typing) return;
    setTyping(true);
    setTimeout(() => {
      setDone((d) => [...d, e.id]);
      if (e.id === "color") setColorTurn((c) => c + 1);
      setTyping(false);
    }, 650);
  }

  return (
    <section className="py-24">
      <Container>
        <Reveal as="h2" className="max-w-2xl text-h2">Une modification{"\u00a0"}? <span className="serif-accent">Demande-la.</span></Reveal>
        <Reveal delay={60} as="p" className="mt-4 max-w-xl text-[17px] leading-relaxed text-fg-muted">Clique sur une demande : la boutique change sous tes yeux, comme dans l'éditeur.</Reveal>
        <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal className="flex flex-col rounded-[18px] border border-white/[0.08] bg-bg-2/70 p-5">
            <div ref={log} className="h-[280px] space-y-3 overflow-y-auto pr-1 text-sm [scrollbar-width:thin]">
              <p className="max-w-[85%] rounded-[12px] rounded-bl-[4px] border border-accent/20 bg-accent-deep/25 px-3.5 py-2.5 text-fg-muted">Ta boutique Grain d'Or est prête. Que veux-tu changer ?</p>
              {done.map((id, i) => {
                const e = EDITS.find((x) => x.id === id)!;
                return (
                  <div key={i} className="space-y-3 animate-[fade-in_.3s_ease-out]">
                    <p className="ml-auto w-fit max-w-[80%] rounded-[12px] rounded-br-[4px] bg-white/[0.08] px-3.5 py-2.5">{e.ask}</p>
                    <p className="max-w-[85%] rounded-[12px] rounded-bl-[4px] border border-accent/20 bg-accent-deep/25 px-3.5 py-2.5 text-fg-muted">{e.reply}</p>
                  </div>
                );
              })}
              {typing && <p className="flex w-fit items-center gap-2 rounded-[12px] border border-accent/20 bg-accent-deep/25 px-3.5 py-2.5 text-fg-faint"><Sparkles className="h-3.5 w-3.5 animate-pulse text-accent" /> L'IA modifie la boutique…</p>}
            </div>
            <div className="mt-5 flex flex-wrap gap-2 border-t border-white/[0.06] pt-4">
              {EDITS.map((e) => (
                <button key={e.id} type="button" onClick={() => ask(e)} disabled={typing || (e.id !== "color" && done.includes(e.id))} className={cn("rounded-full border px-3 py-1.5 text-[13px] transition-colors disabled:opacity-40", "border-accent/30 text-fg hover:bg-accent-deep/40")}>
                  {e.ask}
                </button>
              ))}
              {done.length > 0 && (
                <button type="button" onClick={() => { setDone([]); setColorTurn(0); }} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] text-fg-faint hover:text-fg">
                  <RotateCcw className="h-3.5 w-3.5" /> Revenir au début
                </button>
              )}
            </div>
          </Reveal>
          <Reveal delay={100} className="relative">
            <div aria-hidden className="absolute -inset-8 rounded-[40px] opacity-40 blur-3xl transition-[background] duration-700" style={{ background: `radial-gradient(closest-side, ${store.palette.accent}, transparent)` }} />
            <div className={cn("relative transition-[opacity,filter] duration-300", typing && "opacity-60 blur-[1.5px]")}>
              <StoreFrame s={store} />
            </div>
            <p className="relative mt-8 text-xs text-fg-faint">Version {done.length + 1} · chaque modification peut être annulée</p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
