"use client";

import { useLiveProgress } from "@/lib/use-progress";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Lightbulb, Monitor, Smartphone, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/ui/Logo";
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

// Ce que le marchand peut préparer pendant la création (coché ou non, gardé dans ce navigateur).
const PREP = [
  { id: "payments", label: "Active les paiements", hint: "Shopify Payments ou PayPal, pour encaisser tes ventes", href: "https://admin.shopify.com/settings/payments" },
  { id: "shipping", label: "Règle ta livraison", hint: "Tarifs et délais, ex. livraison offerte dès 39 €", href: "https://admin.shopify.com/settings/shipping" },
  { id: "policies", label: "Ajoute tes mentions légales", hint: "Retours, confidentialité, CGV : Shopify les génère", href: "https://admin.shopify.com/settings/legal" },
  { id: "content", label: "Prépare 3 vidéos de ton produit", hint: "TikTok ou Reels : ta boutique sera prête à les recevoir" },
];

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

// Texte qui s'écrit lettre par lettre.
function useTypewriter(text: string) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(text.length); return; }
    const id = setInterval(() => setN((x) => (x >= text.length ? x : x + 1)), 28);
    return () => clearInterval(id);
  }, [text]);
  return text.slice(0, n);
}

function ProgressRing({ value, label }: { value: number; label: string }) {
  const r = 70, c = 2 * Math.PI * r;
  return (
    <div className="relative grid h-[180px] w-[180px] place-items-center">
      <div aria-hidden className="absolute inset-4 rounded-full bg-accent/10 blur-2xl" />
      <svg viewBox="0 0 160 160" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="80" cy="80" r={r} fill="none" stroke="rgb(255 255 255 / .07)" strokeWidth="8" />
        <circle cx="80" cy="80" r={r} fill="none" stroke="url(#ring)" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} className="transition-[stroke-dashoffset] duration-700 ease-out" />
        <defs><linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#68e6b0" /><stop offset="1" stopColor="#0aa37a" /></linearGradient></defs>
      </svg>
      <div className="relative text-center" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <p className="text-[2.6rem] font-semibold leading-none tracking-[-0.04em] tabular-nums">{value}<span className="text-xl text-fg-muted"> %</span></p>
        <p className="mx-auto mt-1.5 max-w-[120px] text-[11px] leading-tight text-fg-muted">{label}</p>
      </div>
    </div>
  );
}

// Écran de création en plein écran : anneau de progression, pensées de l'IA, chantier de la boutique en direct,
// et une petite liste de choses à préparer pendant l'attente.
export function GenerationProgress({ store, job }: { store: Store; job: Job | null }) {
  const steps = job?.steps ?? [];
  const progress = useLiveProgress(job?.progress ?? 2);
  const running = steps.find((s) => s.status === "running") ?? steps.find((s) => s.status === "pending");
  const thoughts = (running && THOUGHTS[running.key]) ?? ["L'IA travaille…"];
  const t = useTicker(thoughts.length, 3200, running?.key);
  const typed = useTypewriter(thoughts[t]);
  const [tip, setTip] = useState(0);
  const [mobile, setMobile] = useState(false);
  const elapsed = useElapsed();
  const publishing = job?.kind === "publish";
  const doneCount = steps.filter((s) => s.status === "done").length;

  const prepKey = `vitrio-prep-${store.id}`;
  const [prep, setPrep] = useState<string[]>([]);
  useEffect(() => { try { setPrep(JSON.parse(localStorage.getItem(prepKey) ?? "[]")); } catch { /* stockage indisponible */ } }, [prepKey]);
  const togglePrep = (id: string) => setPrep((cur) => {
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    try { localStorage.setItem(prepKey, JSON.stringify(next)); } catch { /* stockage indisponible */ }
    return next;
  });

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#040d0b] text-fg">
      {/* Fond animé (aurore verte) */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-[20%] -top-[30%] h-[80vh] w-[70vw] rounded-full bg-[radial-gradient(closest-side,rgb(16_176_127/0.28),transparent)] [animation:aurora_14s_ease-in-out_infinite]" />
        <div className="absolute -bottom-[30%] right-[-10%] h-[70vh] w-[60vw] rounded-full bg-[radial-gradient(closest-side,rgb(104_230_176/0.16),transparent)] [animation:aurora_18s_ease-in-out_infinite_reverse]" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(rgb(255_255_255/.8)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      </div>

      <header className="relative flex items-center justify-between gap-3 px-5 py-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <LogoMark />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{store.name}</p>
            <p className="flex items-center gap-1.5 text-xs text-fg-muted">
              <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" /><span className="relative h-1.5 w-1.5 rounded-full bg-accent" /></span>
              En cours · <span className="tabular-nums">{elapsed}</span>
            </p>
          </div>
        </div>
        <Link href="/app" className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-fg-muted transition-colors hover:bg-white/[0.08] hover:text-fg">
          <ArrowLeft className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Continuer en arrière-plan</span><span className="sm:hidden">Quitter</span>
        </Link>
      </header>

      <main className="relative mx-auto grid max-w-[1400px] gap-8 px-5 pb-10 pt-2 sm:px-8 lg:grid-cols-[380px_1fr] lg:gap-12">
        <section className="flex flex-col">
          <h1 className="text-[clamp(1.9rem,1.2rem+2vw,2.8rem)] font-semibold leading-[1.05] tracking-[-0.035em]">
            {publishing ? <>Publication sur <span className="serif-accent">Shopify</span></> : <>On construit ta <span className="serif-accent">boutique</span></>}
          </h1>

          <div className="mt-6 flex items-center gap-5">
            <ProgressRing value={progress} label={running?.label ?? "Finitions"} />
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.14em] text-fg-faint">Étape {Math.min(doneCount + 1, Math.max(steps.length, 1))} / {Math.max(steps.length, 1)}</p>
              <p className="mt-2 flex min-h-[3.5rem] items-start gap-2 text-[15px] leading-snug" aria-live="polite">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 animate-pulse text-accent" />
                <span>{typed}<span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-accent [animation:caret_1s_steps(1)_infinite]" /></span>
              </p>
            </div>
          </div>

          <ol className="mt-6 space-y-1">
            {steps.map((s) => (
              <li key={s.key} className={cn("flex items-center gap-3 rounded-ctl px-3 py-2 text-[14.5px] transition-all duration-500", s.status === "running" ? "bg-accent/10 text-fg" : s.status === "done" ? "text-fg" : "text-fg-faint")}>
                <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors duration-500", s.status === "done" ? "border-accent/50 bg-accent text-[#04110d]" : s.status === "running" ? "border-accent/50" : "border-white/10")}>
                  {s.status === "done" ? <Check className="h-3.5 w-3.5 animate-[pop-in_.3s_ease-out]" strokeWidth={3} /> : s.status === "running" ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-accent border-r-transparent" /> : null}
                </span>
                {s.label}
              </li>
            ))}
          </ol>

          {!publishing && (
            <div className="mt-6 rounded-card border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur">
              <p className="text-sm font-medium">Pendant ce temps, prépare ton lancement</p>
              <p className="mt-0.5 text-xs text-fg-faint">{prep.length}/{PREP.length} fait · coche au fur et à mesure</p>
              <ul className="mt-3 space-y-1.5">
                {PREP.map((p) => {
                  const on = prep.includes(p.id);
                  return (
                    <li key={p.id} className="flex items-start gap-3 rounded-ctl px-1 py-1.5">
                      <button type="button" onClick={() => togglePrep(p.id)} aria-pressed={on} aria-label={p.label} className={cn("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-all", on ? "scale-105 border-accent bg-accent text-[#04110d]" : "border-white/20 hover:border-accent/60")}>
                        {on && <Check className="h-3.5 w-3.5 animate-[pop-in_.25s_ease-out]" strokeWidth={3} />}
                      </button>
                      <div className="min-w-0">
                        <p className={cn("text-sm transition-colors", on && "text-fg-faint line-through")}>
                          {p.href ? <a href={p.href} target="_blank" rel="noreferrer" className="underline-offset-2 hover:text-accent hover:underline">{p.label} ↗</a> : p.label}
                        </p>
                        <p className="text-xs text-fg-faint">{p.hint}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="mt-4 rounded-card border border-white/[0.07] bg-white/[0.02] p-4">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-xs text-fg-muted"><Lightbulb className="h-3.5 w-3.5 text-leaf" /> Astuce</p>
              <div className="flex items-center gap-1">
                <button type="button" aria-label="Astuce précédente" onClick={() => setTip((x) => (x + TIPS.length - 1) % TIPS.length)} className="grid h-6 w-6 place-items-center rounded-full text-fg-faint hover:bg-white/5 hover:text-fg"><ChevronLeft className="h-3.5 w-3.5" /></button>
                <span className="text-[11px] tabular-nums text-fg-faint">{tip + 1}/{TIPS.length}</span>
                <button type="button" aria-label="Astuce suivante" onClick={() => setTip((x) => (x + 1) % TIPS.length)} className="grid h-6 w-6 place-items-center rounded-full text-fg-faint hover:bg-white/5 hover:text-fg"><ChevronRight className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <p key={tip} className="mt-2 animate-[fade-in_.3s_ease-out] text-sm leading-relaxed text-fg-muted">{TIPS[tip]}</p>
          </div>
        </section>

        <section className="min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm text-fg-muted"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /> Ta boutique se construit en direct</p>
            <div className="flex rounded-full border border-white/10 bg-white/[0.03] p-0.5 text-xs" role="radiogroup" aria-label="Format d'aperçu">
              {[{ v: false, l: "Ordinateur", I: Monitor }, { v: true, l: "Mobile", I: Smartphone }].map(({ v, l, I }) => (
                <button key={l} type="button" role="radio" aria-checked={mobile === v} onClick={() => setMobile(v)} className={cn("flex items-center gap-1.5 rounded-full px-3 py-1 transition-colors", mobile === v ? "bg-white/10 text-fg" : "text-fg-muted hover:text-fg")}>
                  <I className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{l}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <div aria-hidden className="absolute -inset-6 rounded-[36px] bg-[radial-gradient(closest-side,rgb(16_176_127/0.22),transparent)] blur-2xl" />
            <div className="relative"><BuildStage store={store} job={job} mobile={mobile} /></div>
          </div>
          <p className="mt-4 text-center text-xs text-fg-faint">Tu peux quitter cette page : la création continue et ta boutique t'attendra dans « Mes boutiques ».</p>
        </section>
      </main>
    </div>
  );
}
