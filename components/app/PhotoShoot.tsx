"use client";

import { Sparkles } from "lucide-react";
import type { Asset, Job, Store } from "@/lib/api/types";
import { useLiveProgress, useRemaining } from "@/lib/use-progress";
import { FadeImage, PhotoLoadingTile } from "./PhotoLoading";

// Séance photo en cours : les vraies photos apparaissent une par une dès qu'elles sont prêtes
// (la génération est parallèle côté serveur), les autres places attendent avec une tuile animée.
const EXPECTED = 9; // packshot + 8 mises en scène (+ jusqu'à 3 scènes de vie selon la boutique)

export function PhotoShoot({ store, job, photos }: { store: Store; job: Job | null; photos: Asset[] }) {
  const pct = useLiveProgress(job?.progress ?? 0, job?.status === "succeeded");
  const left = useRemaining(pct);
  const remaining = left == null ? "Mise en place du studio…" : left > 60 ? `Encore environ ${Math.ceil(left / 60)} min` : left > 10 ? `Encore environ ${Math.ceil(left / 10) * 10} s` : "Presque fini…";
  const slots = Math.max(EXPECTED, photos.length + 1);
  const accent = store.theme.colors.accent;

  return (
    <section aria-live="polite" className="relative overflow-hidden rounded-[22px] bg-[linear-gradient(160deg,rgb(46_230_166/0.5),rgb(255_255_255/0.06)_45%,rgb(46_230_166/0.2))] p-px shadow-[0_0_60px_-25px_rgb(46_230_166/0.6)]">
      <div className="rounded-[21px] bg-[linear-gradient(180deg,rgb(8_40_31/0.94),rgb(3_16_12/0.96))] p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-[#a7f3d0]"><Sparkles className="h-4 w-4 animate-pulse" /> Séance photo en cours</p>
            <p className="mt-1 text-xl font-semibold tracking-tight">{photos.length} photo{photos.length > 1 ? "s" : ""} prête{photos.length > 1 ? "s" : ""} · {remaining}</p>
          </div>
          <p className="text-3xl font-semibold tabular-nums text-[#6ee7b7]">{pct} %</p>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.08]" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progression de la séance photo">
          <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${Math.max(pct, 3)}%`, background: `linear-gradient(90deg, #10b07f, ${accent}, #6ee7b7)` }} />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: slots }, (_, i) => {
            const a = photos[i];
            return a ? (
              <figure key={a.id} className="relative aspect-square overflow-hidden rounded-card border border-white/10 bg-black/30 [animation:pop-in_.4s_cubic-bezier(.2,.8,.2,1)_both]">
                <FadeImage src={a.url} alt="Nouvelle photo de la boutique" eager className="h-full w-full object-cover" />
              </figure>
            ) : (
              <PhotoLoadingTile key={`wait-${i}`} className="aspect-square" delay={(i % 6) * 220} />
            );
          })}
        </div>
        <p className="mt-4 text-xs text-fg-faint">Le produit reste le même sur chaque photo. Tu peux quitter la page : la séance continue.</p>
      </div>
    </section>
  );
}
