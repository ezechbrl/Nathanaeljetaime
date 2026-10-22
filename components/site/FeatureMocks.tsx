// Petites maquettes d'interface utilisées sur les pages Produit, Refonte et Clé en main.
import { ArrowRight, Check, Image as ImageIcon, RotateCcw, Sparkles, TrendingUp, Wand2 } from "lucide-react";
import { SHOWCASE } from "@/lib/content/showcase";
import { StoreFrame } from "./StoreFrame";

export function StrategyMock() {
  const rows = [
    ["Marché", "Femmes 28-45 ans, peaux sensibles, lassées des formules à rallonge"],
    ["Promesse", "Une peau apaisée en 10 gouttes, avec 92 % de sève de bouleau"],
    ["Offres", "Duo sérum + crème −15 % · Livraison offerte dès 39 € · 30 jours"],
    ["Objection", "« Ça va me faire réagir ? » → Testé sur peaux réactives"],
  ];
  return (
    <div className="surface rounded-card p-5">
      <p className="flex items-center gap-2 text-sm text-fg"><Sparkles className="h-4 w-4 text-accent" /> Stratégie · Sève</p>
      <dl className="mt-4 divide-y divide-white/[0.06]">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[90px_1fr] gap-3 py-3 text-sm">
            <dt className="text-fg-faint">{k}</dt>
            <dd className="text-fg-muted">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function ChatMock() {
  return (
    <div className="surface rounded-card p-4">
      <div className="space-y-3 text-sm">
        <p className="ml-auto w-fit max-w-[80%] rounded-[12px] rounded-br-[4px] bg-white/[0.08] px-3.5 py-2.5">Rends le ton plus premium et ajoute un lot de 3.</p>
        <div className="max-w-[90%] rounded-[12px] rounded-bl-[4px] border border-accent/20 bg-accent-deep/25 px-3.5 py-2.5 text-fg-muted">
          J'ai réécrit l'accroche avec des phrases plus courtes et ajouté le lot sous le prix.
          <div className="mt-3 space-y-1.5 text-xs">
            <p className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-accent" /> Titre d'accueil <span className="text-fg-faint line-through">Un sérum naturel pour vous</span> <ArrowRight className="h-3 w-3" /> <span className="text-fg">Dix gouttes. C'est tout.</span></p>
            <p className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-accent" /> Offres <ArrowRight className="h-3 w-3" /> <span className="text-fg">+ Lot de 3 à −20 %</span></p>
          </div>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-fg-faint"><RotateCcw className="h-3 w-3" /> Version 7 · annulable</p>
      </div>
    </div>
  );
}

export function StudioMock() {
  const tones = ["#e0e3cf", "#ead6bf", "#d8e4cf", "#f3f0e8", "#cfe7e6", "#e8e6dd"];
  return (
    <div className="surface rounded-card p-4">
      <div className="flex items-center gap-2 rounded-ctl border border-white/10 bg-bg-2 px-3 py-2 text-sm text-fg-muted">
        <Wand2 className="h-4 w-4 text-accent" /> Le flacon sur une pierre, lumière du matin
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {tones.map((c, i) => (
          <div key={c} className="relative aspect-square overflow-hidden rounded-[8px]" style={{ background: `linear-gradient(150deg, ${c}, ${i % 2 ? "#5c6b3c" : "#22261c"}55)` }}>
            <div className="absolute left-1/2 top-1/2 h-1/2 w-1/4 -translate-x-1/2 -translate-y-1/2 rounded-[30%] bg-[#5c6b3c] shadow-lg" />
            {i === 0 && <span className="absolute right-1.5 top-1.5 rounded bg-black/40 px-1.5 text-[10px] text-white">Choisie</span>}
          </div>
        ))}
      </div>
      <p className="mt-3 flex items-center gap-2 text-xs text-fg-faint"><ImageIcon className="h-3.5 w-3.5" /> 6 variantes · format 4:5</p>
    </div>
  );
}

export function PilotMock() {
  return (
    <div className="surface rounded-card p-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-fg-faint">Taux de conversion · 30 jours</p>
          <p className="mt-1 flex items-center gap-2 text-3xl tracking-tight">3,8 % <span className="flex items-center gap-1 text-sm text-good"><TrendingUp className="h-4 w-4" />+1,6 pt</span></p>
        </div>
        <span className="text-xs text-fg-faint">Exemple</span>
      </div>
      <svg viewBox="0 0 300 80" className="mt-4 h-20 w-full" aria-hidden>
        <path d="M0 70 C40 66 60 64 90 58 S150 50 180 38 S250 18 300 10" fill="none" stroke="rgb(94 211 140)" strokeWidth="2" />
        <path d="M0 70 C40 66 60 64 90 58 S150 50 180 38 S250 18 300 10 V80 H0Z" fill="rgb(94 211 140 / .1)" />
      </svg>
      <div className="mt-4 rounded-ctl border border-accent/20 bg-accent-deep/20 p-3 text-sm text-fg-muted">
        <span className="text-fg">L'avis de l'IA :</span> le bouton d'achat n'est visible qu'après deux écrans sur mobile. Le remonter est la priorité de la semaine.
      </div>
    </div>
  );
}

export function RecraftMock() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <p className="mb-2 text-xs text-fg-faint">Avant</p>
        <div className="aspect-[4/3] rounded-[10px] border border-white/10 bg-[#eceff1] p-3 text-[#555]">
          <p className="text-[10px]">MA BOUTIQUE</p>
          <p className="mt-2 text-[13px] font-semibold">Bienvenue sur notre boutique !!!</p>
          <p className="mt-1 text-[8px]">Nous vendons des produits de qualité au meilleur prix. Livraison partout dans le monde.</p>
          <div className="mt-2 grid grid-cols-3 gap-1">{[0, 1, 2].map((i) => <div key={i} className="aspect-square rounded bg-[#d5d9dc]" />)}</div>
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs text-accent">Après</p>
        <StoreFrame s={SHOWCASE.find((x) => x.slug === "pincee")!} phone={false} />
      </div>
    </div>
  );
}
