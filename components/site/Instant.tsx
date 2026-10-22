"use client";

import { Camera, Check, Loader2, MessageSquareText, RefreshCw, Rocket } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

// « Nouvelle ère. » : ce que fait Vigenia, à essayer directement (textes, photos, publication).
const TABS = [
  { id: "text", icon: MessageSquareText, title: "Des textes qui vendent", text: "Accueil, fiche produit, FAQ, offres par lot." },
  { id: "photo", icon: Camera, title: "Des photos de pro", text: "Ton produit en studio et en situation." },
  { id: "publish", icon: Rocket, title: "Publié sur Shopify", text: "Thème, produit et pages en un clic." },
] as const;
type Tab = (typeof TABS)[number]["id"];

const HEADLINES = ["Entends tout. Avant les autres.", "Ton équipe. Ta voix. Zéro latence.", "40 h d'autonomie, 0 câble.", "Le son qui fait gagner tes parties."];

function TextDemo() {
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  const line = HEADLINES[i];
  useEffect(() => {
    if (n < line.length) { const t = window.setTimeout(() => setN(n + 1), 38); return () => window.clearTimeout(t); }
  }, [n, line]);
  return (
    <div className="flex h-full flex-col justify-center">
      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6ee7b7]">Titre de l'accueil · casque gaming</p>
      <p className="mt-3 min-h-[2.4em] text-[clamp(1.6rem,1.1rem+1.6vw,2.4rem)] font-semibold leading-tight tracking-[-0.02em]">{line.slice(0, n)}<span className="ml-0.5 inline-block h-[0.9em] w-[3px] translate-y-[0.1em] animate-pulse bg-[#2ee6a6]" /></p>
      <p className="mt-3 max-w-md text-[14px] text-fg-muted">Son spatial, micro antibruit et 40 h d'autonomie : pensé pour jouer en équipe, des heures, sans gêne.</p>
      <button type="button" onClick={() => { setI((i + 1) % HEADLINES.length); setN(0); }} className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-[#2ee6a6]/40 bg-[#2ee6a6]/10 px-4 py-2 text-[14px] font-medium text-[#d1fae5] transition-colors hover:bg-[#2ee6a6]/20">
        <RefreshCw className="h-4 w-4" /> Proposer un autre titre
      </button>
    </div>
  );
}

function PhotoDemo() {
  const [pos, setPos] = useState(55);
  return (
    <div className="flex h-full flex-col">
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[14px] bg-black select-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/showcase/norde-scene.jpg" alt="Le casque mis en situation par l'IA" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/showcase/norde-white.jpg" alt="Le casque sur fond blanc" className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_12px_rgb(46_230_166)]" style={{ left: `${pos}%` }}>
          <span className="absolute top-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-[13px] font-bold text-[#04110d] shadow-lg">⇆</span>
        </div>
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white">Fond blanc</span>
        <span className="absolute right-3 top-3 rounded-full bg-[#2ee6a6]/90 px-2.5 py-1 text-[11px] font-semibold text-[#03140d]">En situation</span>
        <input type="range" min={0} max={100} value={pos} onChange={(e) => setPos(Number(e.target.value))} aria-label="Comparer les deux photos" className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0" />
      </div>
      <p className="mt-3 text-center text-[13px] text-fg-muted">Fais glisser : deux photos du même casque, créées par l'IA de Vigenia.</p>
    </div>
  );
}

const STEPS = ["Thème à tes couleurs", "Produit, photos et variantes", "Pages Accueil, FAQ et À propos", "Boutique en ligne"];

function PublishDemo() {
  const [step, setStep] = useState(-1);
  useEffect(() => {
    if (step >= 0 && step < STEPS.length) { const t = window.setTimeout(() => setStep(step + 1), 700); return () => window.clearTimeout(t); }
  }, [step]);
  const done = step >= STEPS.length;
  return (
    <div className="flex h-full flex-col justify-center">
      <div className="space-y-2.5">
        {STEPS.map((s, i) => (
          <div key={s} className={cn("flex items-center gap-3 rounded-[12px] border px-4 py-3 text-[14.5px] transition-colors", i < step ? "border-[#2ee6a6]/40 bg-[#2ee6a6]/10" : "border-white/10 bg-white/[0.03] text-fg-muted")}>
            <span className={cn("grid h-6 w-6 place-items-center rounded-full", i < step ? "bg-[#2ee6a6] text-[#03140d]" : "border border-white/20")}>
              {i < step ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i === step ? <Loader2 className="h-3.5 w-3.5 animate-spin text-[#6ee7b7]" /> : null}
            </span>
            {s}
          </div>
        ))}
      </div>
      {done ? (
        <p className="mt-5 text-center text-[15px] font-semibold text-[#a7f3d0]">🎉 En ligne sur norde.myshopify.com</p>
      ) : (
        <button type="button" onClick={() => setStep(0)} disabled={step >= 0} className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-[linear-gradient(180deg,#34f0b0,#0fae7c)] px-6 py-3 text-[15px] font-semibold text-[#03140d] shadow-[0_0_24px_rgb(46_230_166/0.5)] transition-transform hover:-translate-y-px disabled:opacity-70">
          <Rocket className="h-4 w-4" /> {step >= 0 ? "Publication…" : "Publier sur Shopify"}
        </button>
      )}
      {done && <button type="button" onClick={() => setStep(-1)} className="mx-auto mt-2 text-[13px] text-fg-muted hover:text-fg">Rejouer</button>}
    </div>
  );
}

export function Instant() {
  const [tab, setTab] = useState<Tab>("text");
  const touched = useRef(false);
  // Fait défiler les démos tout seul tant que le visiteur n'a pas cliqué.
  useEffect(() => {
    const t = window.setInterval(() => {
      if (touched.current) return;
      setTab((cur) => TABS[(TABS.findIndex((x) => x.id === cur) + 1) % TABS.length].id);
    }, 7000);
    return () => window.clearInterval(t);
  }, []);
  const pick = (id: Tab) => { touched.current = true; setTab(id); };
  return (
    <section className="relative overflow-hidden py-14 sm:py-24">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-10 h-[26rem] w-[70rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(46_230_166/0.16),transparent)]" />
      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="text-center">
          {/* Très grand titre qui s'efface vers le bas, comme un horizon. */}
          <Reveal as="h2" className="bg-[linear-gradient(180deg,#ffffff_15%,#a7f3d0_55%,rgb(110_231_183/0.25))] bg-clip-text pb-2 font-display text-[clamp(4.2rem,1.6rem+11vw,12.5rem)] font-medium leading-[0.92] tracking-[-0.065em] text-transparent [-webkit-mask-image:linear-gradient(180deg,#000_45%,transparent_100%)] [mask-image:linear-gradient(180deg,#000_45%,transparent_100%)]">
            Nouvelle ère.
          </Reveal>
          <Reveal delay={100} as="p" className="mx-auto mt-4 max-w-2xl text-[clamp(1.05rem,0.9rem+0.5vw,1.3rem)] leading-relaxed text-fg-muted">
            Créer une boutique ne prend plus 3 semaines : ça se fait pendant que tu bois ton café. <span className="text-fg">Essaie, c'est en direct :</span>
          </Reveal>
        </div>
        <Reveal delay={150} className="mt-10 grid gap-4 lg:mt-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-1 lg:gap-3 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Ce que fait Vigenia">
            {TABS.map(({ id, icon: I, title, text }) => (
              <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => pick(id)} className={cn("flex shrink-0 items-center gap-3 rounded-full border px-4 py-2.5 text-left transition-all lg:gap-4 lg:rounded-[18px] lg:p-4", tab === id ? "border-[#2ee6a6]/60 bg-[#2ee6a6]/10 shadow-[0_0_30px_-10px_rgb(46_230_166/0.6)]" : "border-white/10 bg-black/20 hover:border-white/25")}>
                <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-xl border transition-colors lg:h-11 lg:w-11 lg:rounded-2xl", tab === id ? "border-[#2ee6a6]/50 bg-[#2ee6a6]/20 text-[#a7f3d0]" : "border-white/10 text-fg-muted")}><I className="h-4 w-4 lg:h-5 lg:w-5" /></span>
                <span><span className="block whitespace-nowrap text-[14px] font-semibold lg:whitespace-normal lg:text-[16px]">{title}</span><span className="hidden text-[13px] text-fg-muted lg:block">{text}</span></span>
              </button>
            ))}
          </div>
          <div className="rounded-[22px] bg-[linear-gradient(160deg,rgb(46_230_166/0.6),rgb(255_255_255/0.06)_45%,rgb(46_230_166/0.25))] p-px">
            <div key={tab} className="h-[360px] rounded-[21px] sm:h-[420px] bg-[linear-gradient(180deg,rgb(8_40_31/0.95),rgb(4_20_15/0.97))] p-5 [animation:fade-in_.3s_ease-out] sm:p-8">
              {tab === "text" ? <TextDemo /> : tab === "photo" ? <PhotoDemo /> : <PublishDemo />}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
