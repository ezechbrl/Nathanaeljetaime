"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

// Simulateur simple : combien de temps tu gagnes selon le nombre de boutiques.
const CHOICES = [1, 3, 5, 10];
const WEEKS_ALONE = 3; // une boutique faite seul : ~3 semaines
const AGENCY = 2000; // une boutique en agence : ~2 000 €

export function SavingsCalculator() {
  const [n, setN] = useState(3);
  const weeks = n * WEEKS_ALONE;
  const minutes = n * 10;

  return (
    <div className="mt-6 rounded-[18px] border border-accent/20 bg-accent-deep/20 p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <p className="text-h3">Combien de boutiques veux-tu lancer ?</p>
        <div className="flex gap-2" role="group" aria-label="Nombre de boutiques">
          {CHOICES.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={n === c}
              onClick={() => setN(c)}
              className={cn("h-10 min-w-10 rounded-full border px-3 text-[15px] tabular-nums transition-colors", n === c ? "border-accent/60 bg-accent text-bg" : "border-white/15 text-fg-muted hover:border-white/30 hover:text-fg")}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 space-y-5">
        <div>
          <div className="flex justify-between text-sm"><span className="text-fg-muted">Seul, dans Shopify</span><span className="tabular-nums text-fg">{weeks} semaines</span></div>
          <div className="mt-2 h-4 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-[linear-gradient(90deg,#f59e8b,#f87171)] transition-[width] duration-700 ease-out" style={{ width: `${Math.min(100, (weeks / 30) * 100)}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm"><span className="text-fg-muted">Avec Vitrio</span><span className="tabular-nums text-accent">{minutes} minutes</span></div>
          <div className="mt-2 h-4 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full w-[1.5%] min-w-3 rounded-full bg-accent" />
          </div>
        </div>
      </div>

      <p className="mt-8 text-[clamp(1.25rem,1rem+1vw,1.75rem)] leading-snug tracking-tight">
        Tu gagnes <span className="text-accent">{weeks} semaines</span> de travail
        {" "}et tu évites environ <span className="whitespace-nowrap text-accent">{(n * AGENCY).toLocaleString("fr-FR")} €</span> d'agence.
      </p>
    </div>
  );
}
