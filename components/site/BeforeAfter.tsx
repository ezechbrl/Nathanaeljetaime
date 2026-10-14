"use client";

import { MoveHorizontal } from "lucide-react";
import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Section";
import { SHOWCASE, type ShowcaseStore } from "@/lib/content/showcase";
import { StoreFrame } from "./StoreFrame";

// Comparateur à glisser : la boutique Shopify de départ face à la version Vitrio.
const AFTER = SHOWCASE[2];
const BEFORE: ShowcaseStore = {
  ...AFTER,
  slug: "ma-boutique",
  name: "Ma boutique",
  headline: "Bienvenue sur notre boutique",
  sub: "Description du produit.",
  product: "Produit 1",
  palette: { bg: "#f4f4f4", ink: "#3a3a3a", accent: "#8a8a8a", soft: "#dcdcdc" },
  font: "sans",
  layout: "center",
};

export function BeforeAfter() {
  const [x, setX] = useState(50);
  return (
    <section className="py-24">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Reveal as="h2" className="text-h2">Glisse pour voir <span className="serif-accent">la différence</span>.</Reveal>
            <Reveal delay={60} as="p" className="mt-4 max-w-md text-[17px] leading-relaxed text-fg-muted">
              À gauche, une boutique Shopify telle qu'on la reçoit. À droite, la même après Vitrio : une marque, une promesse, des textes qui répondent aux questions des clients.
            </Reveal>
            <Reveal delay={120} className="mt-6"><ul className="space-y-2 text-sm">
              <li className="flex gap-2"><span className="w-20 shrink-0 text-fg-faint">Avant</span><span className="text-fg-muted">« Bienvenue sur notre boutique »</span></li>
              <li className="flex gap-2"><span className="w-20 shrink-0 text-accent">Après</span><span className="text-fg">« {AFTER.headline} »</span></li>
            </ul></Reveal>
          </div>
          <Reveal delay={100}>
            <div className="relative select-none">
              <StoreFrame s={BEFORE} phone={false} />
              <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${x}%)` }}>
                <StoreFrame s={AFTER} phone={false} />
              </div>
              <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,.5)]" style={{ left: `${x}%` }}>
                <span className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-[#041a13] shadow-lg"><MoveHorizontal className="h-5 w-5" /></span>
              </div>
              <span className="pointer-events-none absolute left-3 top-12 rounded-full bg-black/55 px-2.5 py-1 text-xs text-white">Avant</span>
              <span className="pointer-events-none absolute right-3 top-12 rounded-full bg-accent-strong px-2.5 py-1 text-xs text-white">Avec Vitrio</span>
              <input
                type="range"
                min={0}
                max={100}
                value={x}
                onChange={(e) => setX(+e.target.value)}
                aria-label="Comparer avant et après"
                className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
              />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
