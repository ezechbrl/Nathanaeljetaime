"use client";

import { useLiveProgress } from "@/lib/use-progress";
import { Check, ChevronLeft, ChevronRight, Lightbulb, Monitor, Smartphone, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { LightRays } from "@/components/ui/LightRays";
import { BuildStage } from "./BuildStage";
import type { Job, JobStepKey, Store } from "@/lib/api/types";
import { cn } from "@/lib/cn";

// Ce que l'IA « pense » pendant chaque étape (affiché en boucle, purement indicatif).
const THOUGHTS: Partial<Record<JobStepKey, string[]>> = {
  strategy: ["Je cerne ta cible idéale…", "J'analyse ce qui fait acheter dans ta niche…", "Je liste les hésitations de tes clients…", "Je choisis ta promesse principale…"],
  brand: ["Je cherche un nom qui sonne juste…", "Je compose ta palette de couleurs…", "Je choisis le ton de ta marque…"],
  pages: ["J'écris ton accroche d'accueil…", "Je rédige les réponses de la FAQ…", "Je prépare ta page À propos…"],
  product: ["Je transforme les caractéristiques en bénéfices…", "Je prépare le titre et la description SEO…", "Je propose un prix et une offre…"],
  images: ["Je prépare tes visuels…", "J'ajuste la lumière et le cadrage…"],
  theme: ["J'applique tes couleurs et tes polices…", "Dernières vérifications…"],
  publish: ["J'envoie ta fiche produit à Shopify…", "Je mets le produit en vente…"],
};

const TIPS = [
  "Une fiche produit qui répond aux objections (« ça tient combien de temps ? ») convertit nettement mieux qu'une simple description.",
  "Les boutiques qui affichent clairement délais et retours rassurent dès la première visite.",
  "Après la génération, demande simplement « rends le ton plus premium » dans l'éditeur : tout est réécrit.",
  "Chaque modification crée une version : tu peux toujours revenir en arrière.",
];

function useTicker(length: number, ms: number, key: unknown) {
  const [i, setI] = useState(0);
  useEffect(() => {
    setI(0);
    if (length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((x) => (x + 1) % length), ms);
    return () => clearInterval(id);
  }, [length, ms, key]);
  return i;
}

function useElapsed() {
  const [s, setS] = useState(0);
  useEffect(() => {
    const t0 = Date.now();
    const id = setInterval(() => setS(Math.floor((Date.now() - t0) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function GenerationProgress({ store, job }: { store: Store; job: Job | null }) {
  const steps = job?.steps ?? [];
  const progress = useLiveProgress(job?.progress ?? 2);
  const running = steps.find((s) => s.status === "running") ?? steps.find((s) => s.status === "pending");
  const thoughts = (running && THOUGHTS[running.key]) ?? ["L'IA travaille…"];
  const t = useTicker(thoughts.length, 2600, running?.key);
  const [tip, setTip] = useState(0);
  const [mobile, setMobile] = useState(false);
  const elapsed = useElapsed();
  const publishing = job?.kind === "publish";

  return (
    <div className="relative min-h-[calc(100dvh-3.5rem)] overflow-hidden px-5 py-12 lg:min-h-dvh lg:py-16">
      <LightRays />
      <div className="relative mx-auto grid max-w-[1100px] items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="flex items-center gap-2 text-sm text-fg-muted">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" /><span className="relative h-2 w-2 rounded-full bg-accent" /></span>
            En cours · <span className="tabular-nums">{elapsed}</span>
          </p>
          <h1 className="mt-4 text-h2">{publishing ? <>Publication sur <span className="serif-accent">Shopify</span></> : <>On construit ta <span className="serif-accent">boutique</span></>}</h1>
          <p className="mt-2 text-fg-muted">{store.name} · {store.language}</p>

          <div className="mt-6 flex min-h-[48px] items-center gap-3 rounded-card border border-accent/20 bg-accent-deep/25 px-4 py-3" aria-live="polite">
            <Sparkles className="h-4 w-4 shrink-0 animate-pulse text-accent" />
            <p key={`${running?.key}-${t}`} className="animate-[fade-in_.4s_ease-out] text-[15px]">{thoughts[t]}</p>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-xs text-fg-muted"><span>Progression</span><span className="tabular-nums">{progress} %</span></div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.07]" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <div className="relative h-full overflow-hidden rounded-full bg-accent transition-[width] duration-700 ease-out" style={{ width: `${Math.max(progress, 4)}%` }}>
                <span className="absolute inset-0 animate-shimmer bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.5),transparent)] bg-[length:200%_100%]" />
              </div>
            </div>
            <ul className="mt-5 space-y-2.5">
              {steps.map((s) => (
                <li key={s.key} className={cn("flex items-center gap-3 text-[15px] transition-colors duration-500", s.status === "pending" ? "text-fg-faint" : "text-fg")}>
                  <span className={cn("grid h-6 w-6 place-items-center rounded-full border transition-colors duration-500", s.status === "done" ? "border-accent/50 bg-accent-deep/60" : s.status === "running" ? "border-accent/40" : "border-white/10")}>
                    {s.status === "done" ? <Check className="h-3.5 w-3.5 animate-[pop-in_.3s_ease-out] text-accent" /> : s.status === "running" ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-accent border-r-transparent" /> : null}
                  </span>
                  {s.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 rounded-card border border-white/[0.07] bg-white/[0.02] p-4">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-xs text-fg-muted"><Lightbulb className="h-3.5 w-3.5 text-leaf" /> Le savais-tu ?</p>
              <div className="flex items-center gap-1">
                <button type="button" aria-label="Conseil précédent" onClick={() => setTip((x) => (x + TIPS.length - 1) % TIPS.length)} className="grid h-6 w-6 place-items-center rounded-full text-fg-faint hover:bg-white/5 hover:text-fg"><ChevronLeft className="h-3.5 w-3.5" /></button>
                <span className="text-[11px] tabular-nums text-fg-faint">{tip + 1}/{TIPS.length}</span>
                <button type="button" aria-label="Conseil suivant" onClick={() => setTip((x) => (x + 1) % TIPS.length)} className="grid h-6 w-6 place-items-center rounded-full text-fg-faint hover:bg-white/5 hover:text-fg"><ChevronRight className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <p key={tip} className="mt-2 animate-[fade-in_.3s_ease-out] text-sm leading-relaxed text-fg-muted">{TIPS[tip]}</p>
          </div>
          <p className="mt-6 text-xs text-fg-faint">Tu peux quitter cette page : la génération continue, on te prévient quand c'est prêt.</p>
        </div>

        <div className="order-first lg:order-none">
          <div className="mb-2 flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm text-fg-muted"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /> Chantier en direct</p>
            <div className="flex rounded-full border border-white/10 p-0.5 text-xs" role="radiogroup" aria-label="Format d'aperçu">
              {[{ v: false, l: "Ordinateur", I: Monitor }, { v: true, l: "Mobile", I: Smartphone }].map(({ v, l, I }) => (
                <button key={l} type="button" role="radio" aria-checked={mobile === v} onClick={() => setMobile(v)} className={cn("flex items-center gap-1.5 rounded-full px-3 py-1 transition-colors", mobile === v ? "bg-white/10 text-fg" : "text-fg-muted hover:text-fg")}>
                  <I className="h-3.5 w-3.5" /> {l}
                </button>
              ))}
            </div>
          </div>
          <BuildStage store={store} job={job} mobile={mobile} />
        </div>
      </div>
    </div>
  );
}
