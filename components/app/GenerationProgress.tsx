"use client";

import { Check } from "lucide-react";
import { LightRays } from "@/components/ui/LightRays";
import { LogoMark } from "@/components/ui/Logo";
import type { Job, Store } from "@/lib/api/types";
import { cn } from "@/lib/cn";

export function GenerationProgress({ store, job }: { store: Store; job: Job | null }) {
  const steps = job?.steps ?? [];
  const progress = job?.progress ?? 3;
  return (
    <div className="relative grid min-h-[calc(100dvh-3.5rem)] place-items-center px-5 py-16 lg:min-h-dvh">
      <LightRays />
      <div className="relative w-full max-w-md text-center">
        <div className="relative mx-auto grid h-16 w-16 place-items-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-accent/20 [animation-duration:2.4s]" />
          <LogoMark className="relative h-12 w-12" />
        </div>
        <h1 className="mt-8 text-h2">{job?.kind === "publish" ? "Publication sur Shopify" : "On construit ta boutique"}</h1>
        <p className="mt-3 text-fg-muted">{store.name} · {store.language}</p>

        <div className="mt-10 text-left">
          <div className="flex justify-between text-xs text-fg-muted"><span>Progression</span><span className="tabular-nums">{progress} %</span></div>
          <div className="mt-2 h-1 overflow-hidden rounded bg-white/[0.07]" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded bg-accent transition-[width] duration-700 ease-out" style={{ width: `${Math.max(progress, 3)}%` }} />
          </div>
          <ul className="mt-6 space-y-3" aria-live="polite">
            {steps.map((s) => (
              <li key={s.key} className={cn("flex items-center gap-3 text-[15px] transition-colors", s.status === "pending" ? "text-fg-faint" : "text-fg")}>
                <span className={cn("grid h-6 w-6 place-items-center rounded-full border", s.status === "done" ? "border-accent/50 bg-accent-deep/60" : "border-white/10")}>
                  {s.status === "done" ? <Check className="h-3.5 w-3.5 text-accent" /> : s.status === "running" ? <span className="h-2 w-2 animate-pulse rounded-full bg-accent" /> : null}
                </span>
                {s.label}
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-10 text-xs text-fg-faint">Tu peux quitter cette page : la génération continue, on te prévient quand c'est prêt.</p>
      </div>
    </div>
  );
}
