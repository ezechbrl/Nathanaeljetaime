"use client";

import { ArrowRight, Check, Lock, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { TeaserPreview, UNLOCKS } from "@/components/app/LockedStore";
import * as api from "@/lib/api/client";
import type { Preview, Store } from "@/lib/api/types";

const STEPS = ["Je lis ton produit…", "Je choisis le style et les couleurs…", "J'écris ton accroche…", "Je mets en page ta boutique…"];

// Aperçu créé sans compte : il se prépare ici, puis « Débloquer » crée le compte (e-mail + code)
// et rattache l'aperçu au compte avant le paiement.
export function PreviewView({ id }: { id: string }) {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [missing, setMissing] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let stop = false;
    let timer: number | undefined;
    const poll = async () => {
      try {
        const { preview: p } = await api.getPreview(id);
        if (stop) return;
        setPreview(p);
        if (p.status === "generating") timer = window.setTimeout(poll, 1500);
      } catch (e) {
        if (stop) return;
        if (e instanceof api.ApiClientError && e.status === 404) setMissing(true);
        else timer = window.setTimeout(poll, 3000);
      }
    };
    poll();
    const t = window.setInterval(() => setTick((n) => n + 1), 2200);
    return () => { stop = true; window.clearTimeout(timer); window.clearInterval(t); };
  }, [id]);

  const unlockUrl = `/app?claim=${encodeURIComponent(id)}`;

  if (missing || preview?.status === "failed") {
    return (
      <section className="mx-auto max-w-xl px-5 pb-24 pt-36 text-center">
        <h1 className="text-h2">Oups, l'aperçu n'a pas pu se faire</h1>
        <p className="mt-4 text-fg-muted">{preview?.error ?? "Cet aperçu est introuvable."}</p>
        <Link href="/#creer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 font-semibold text-[#03140d]"><RotateCcw className="h-4 w-4" /> Réessayer</Link>
      </section>
    );
  }

  if (!preview || preview.status === "generating" || !preview.teaser || !preview.theme) {
    return (
      <section className="mx-auto max-w-xl px-5 pb-24 pt-40 text-center">
        <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-accent/20 border-t-accent" />
        <h1 className="mt-8 text-[clamp(1.8rem,1.3rem+1.6vw,2.6rem)] leading-tight tracking-tight">Ta boutique arrive</h1>
        <p key={tick} className="mt-3 text-fg-muted [animation:fade-in_.4s_ease-out_both]">{STEPS[Math.min(tick, STEPS.length - 1)]}</p>
        <p className="mt-8 text-sm text-fg-faint">Environ 15 secondes.</p>
      </section>
    );
  }

  const store = { id, name: preview.name ?? "Ma boutique", teaser: preview.teaser, theme: preview.theme } as Store;
  return (
    <section className="mx-auto max-w-[1100px] px-4 pb-28 pt-28 sm:px-6 sm:pt-32">
      <div className="text-center">
        <p className="eyebrow mx-auto">Ton aperçu est prêt</p>
        <h1 className="mt-5 text-[clamp(2rem,1.4rem+2.2vw,3.2rem)] leading-tight tracking-tight">Voici <span className="serif-accent">{store.name}</span></h1>
      </div>
      <div className="mt-8 rounded-[16px] border border-white/10 p-1.5 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.8)]">
        <TeaserPreview store={store} />
      </div>
      <div id="debloquer" className="mx-auto mt-12 max-w-2xl scroll-mt-28 rounded-[22px] border border-accent/25 bg-accent-deep/20 p-6 sm:p-8">
        <h2 className="text-center text-[1.6rem] leading-tight tracking-tight">Débloque ta boutique complète</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {UNLOCKS.map((u) => (
            <li key={u.title} className="flex gap-3 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" /><span><strong className="text-fg">{u.title}</strong><span className="block text-fg-muted">{u.text}</span></span></li>
          ))}
        </ul>
        <Link href={unlockUrl} className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 text-[16px] font-semibold text-[#03140d] shadow-[0_12px_40px_-8px_rgb(46_230_166/0.6)]">
          <Lock className="h-4 w-4" /> Débloquer ma boutique <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-3 text-center text-xs text-fg-faint">Ton aperçu est gardé : tu le retrouves dans ton compte. Sans engagement.</p>
      </div>
    </section>
  );
}
