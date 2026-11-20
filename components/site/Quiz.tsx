"use client";

// Quiz partagé : page publique /quiz (avant le compte) et /app/quiz (dans l'espace client).
// D'abord le profil (où il en est, son objectif), puis son idée ou un univers, puis il choisit
// un produit parmi des propositions. Les réponses forment la description de la boutique.
import { ArrowLeft, ArrowRight, Baby, Bike, Check, Compass, Gem, Heart, Lightbulb, Palette, PawPrint, PenLine, Rocket, Shuffle, Sparkles, Sprout, Store, Target, TrendingUp, User, UserRound, Users, X, Zap } from "lucide-react";
import { useRef, useState } from "react";
import { Spinner } from "@/components/ui/Button";
import { SHOWCASE } from "@/lib/content/showcase";
import { cn } from "@/lib/cn";
import { NICHES } from "@/lib/niches";
import { StoreLongFrame } from "./StoreFrame";

type Icon = React.ComponentType<{ className?: string }>;
type Option = { id: string; label: string; hint?: string; icon: Icon };

const LEVELS: Option[] = [
  { id: "debut", label: "Je débute complètement", hint: "Jamais vendu en ligne", icon: Sprout },
  { id: "essai", label: "J'ai déjà essayé", hint: "Pas encore de vente", icon: Compass },
  { id: "ailleurs", label: "Je vends déjà ailleurs", hint: "Vinted, Instagram, marché…", icon: Store },
  { id: "boutique", label: "J'ai déjà une boutique", hint: "Je veux en lancer une autre", icon: TrendingUp },
  { id: "createur", label: "Je crée mes produits", hint: "Fait main, art, mode…", icon: Palette },
];
const GOALS: Option[] = [
  { id: "complement", label: "Un complément de revenu", hint: "À côté des cours ou du travail", icon: Target },
  { id: "activite", label: "En faire mon activité", hint: "Je veux en vivre", icon: Rocket },
  { id: "tester", label: "Tester une idée", hint: "Voir si ça marche", icon: Lightbulb },
  { id: "marque", label: "Lancer ma marque", hint: "Un nom qu'on retient", icon: Gem },
  { id: "creations", label: "Vendre mes créations", hint: "Ce que je fabrique", icon: Palette },
];
const AUDIENCES: Option[] = [
  { id: "femmes", label: "Les femmes", icon: UserRound },
  { id: "hommes", label: "Les hommes", icon: User },
  { id: "jeunes", label: "Les 18-25 ans", icon: Zap },
  { id: "parents", label: "Les parents", icon: Baby },
  { id: "sportifs", label: "Les sportifs", icon: Bike },
  { id: "animaux", label: "Ceux qui ont un animal", icon: PawPrint },
  { id: "tous", label: "Tout le monde", icon: Users },
];
const AUDIENCE_TEXT: Record<string, string> = { femmes: "les femmes", hommes: "les hommes", jeunes: "les jeunes de 18 à 25 ans", parents: "les parents", sportifs: "les sportifs", animaux: "les propriétaires d'animaux", tous: "tout le monde" };
const LEVEL_TEXT: Record<string, string> = {
  debut: "Le vendeur débute : textes simples, rassurants et très clairs.",
  essai: "Le vendeur a déjà essayé sans vendre : boutique très orientée conversion.",
  ailleurs: "Le vendeur vend déjà sur les réseaux : ton proche et authentique.",
  boutique: "Le vendeur a déjà une boutique : rendu premium et professionnel.",
  createur: "Le vendeur crée ses propres produits : mettre en avant le savoir-faire et l'histoire.",
};

// Boutiques à aimer ou non (cœur / croix) : elles servent à choisir le style de la boutique.
const STYLE_OF: Record<string, string> = { "pas-sur": "premium", "maison-ouate": "premium", kordo: "direct", delie: "direct", nido: "lifestyle", macho: "lifestyle", velaro: "tech", silencio: "tech" };
const STYLE_TEXT: Record<string, string> = {
  premium: "Style de boutique souhaité : premium minimal, élégant et épuré.",
  direct: "Style de boutique souhaité : vente directe, orienté problème puis solution.",
  lifestyle: "Style de boutique souhaité : lifestyle chaleureux, avec des photos de vie.",
  tech: "Style de boutique souhaité : sport et tech, fond sombre et couleurs vives.",
};
const SWIPE = ["pas-sur", "kordo", "nido", "velaro", "macho", "silencio"].map((slug) => SHOWCASE.find((x) => x.slug === slug)).filter((x): x is (typeof SHOWCASE)[number] => !!x);

type Step = "level" | "goal" | "idea" | "niche" | "product" | "audience" | "style";

export function Quiz({ onFinish, skipHref }: { onFinish: (brief: string) => Promise<void>; skipHref?: string }) {
  const [history, setHistory] = useState<Step[]>(["level"]);
  const step = history[history.length - 1];
  const [level, setLevel] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [hasIdea, setHasIdea] = useState<boolean | null>(null);
  const [idea, setIdea] = useState("");
  const [niche, setNiche] = useState<string | null>(null);
  const [product, setProduct] = useState<string | null>(null);
  const [audience, setAudience] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const n = NICHES.find((x) => x.id === niche);

  // 6 questions au plus ; 4 seulement s'il a déjà son idée.
  const plan: Step[] = hasIdea ? ["level", "goal", "idea", "audience", "style"] : ["level", "goal", "idea", "niche", "product", "audience", "style"];
  const index = plan.indexOf(step);
  const go = (s: Step) => setHistory((h) => [...h, s]);
  const back = () => setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));

  const chosen = hasIdea ? idea.trim() : product;

  async function finish(style: string | null) {
    if (!chosen || !audience) return;
    const brief = [`${chosen.replace(/[.\s]+$/, "")}.`, `Pour ${AUDIENCE_TEXT[audience]}.`, level ? LEVEL_TEXT[level] : "", style ? STYLE_TEXT[style] : ""].filter(Boolean).join(" ");
    setBusy(true);
    setError("");
    try {
      await onFinish(brief);
    } catch (e) {
      setBusy(false);
      setError((e as Error).message || "Une erreur est survenue. Réessaie.");
    }
  }

  const titles: Record<Step, React.ReactNode> = {
    level: <>Où en es-tu dans le <span className="serif-accent">e-commerce</span> ?</>,
    goal: <>Quel est ton <span className="mark-green">objectif</span> ?</>,
    idea: <>Tu as déjà une <span className="serif-accent">idée</span> de produit ?</>,
    niche: <>Quel univers t'<span className="mark-green">attire</span> ?</>,
    product: <>Lequel te <span className="serif-accent">plaît</span> le plus ?</>,
    audience: <>À qui veux-tu <span className="mark-green">vendre</span> ?</>,
    style: <>Ces boutiques, tu <span className="serif-accent">aimes</span> ?</>,
  };

  return (
    <div className="mx-auto max-w-3xl px-5 pb-28 pt-8 sm:px-8 sm:pt-12">
      {/* Avancement */}
      <div className="flex items-center gap-2">
        {plan.map((s, i) => <span key={s} className={cn("h-1.5 flex-1 rounded-full transition-colors duration-500", i <= index ? "bg-[linear-gradient(90deg,#34f0b0,#10b981)] shadow-[0_0_10px_rgb(46_230_166/0.5)]" : "bg-white/10")} />)}
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-fg-muted">
        {history.length > 1
          ? <button type="button" onClick={back} className="inline-flex items-center gap-1.5 hover:text-white"><ArrowLeft className="h-4 w-4" /> Retour</button>
          : skipHref ? <a href={skipHref} className="underline underline-offset-4 hover:text-white">J'ai déjà mon produit</a> : <span />}
        <span>Question {index + 1} sur {plan.length}</span>
      </div>

      <h1 key={step} className="mt-6 text-center text-[clamp(1.7rem,1.2rem+1.8vw,2.5rem)] font-semibold leading-tight tracking-[-0.03em] [animation:rise_.45s_cubic-bezier(.2,.8,.2,1)_both]">{titles[step]}</h1>

      <div className="mt-8 [animation:fade-in_.35s_ease-out_both]" key={`${step}-body`}>
        {step === "level" && <Grid options={LEVELS} value={level} cols={3} onPick={(id) => { setLevel(id); go("goal"); }} />}
        {step === "goal" && <Grid options={GOALS} value={goal} cols={3} onPick={(id) => { setGoal(id); go("idea"); }} />}
        {step === "idea" && (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Card tint={0} icon={Lightbulb} label="Oui, j'ai mon idée" hint="Je l'écris juste en dessous" on={hasIdea === true} onClick={() => setHasIdea(true)} />
              <Card tint={4} icon={Sparkles} label="Pas encore" hint="Propose-moi des produits" on={hasIdea === false} onClick={() => { setHasIdea(false); go("niche"); }} />
            </div>
            {hasIdea && (
              <div className="rounded-[18px] border border-[#34f0b0]/40 bg-[#34f0b0]/[0.07] p-4 [animation:fade-in_.3s_ease-out_both]">
                <label htmlFor="quiz-idea" className="flex items-center gap-2 text-sm font-semibold text-white"><PenLine className="h-4 w-4 text-[#86efc9]" /> Ton produit</label>
                <input id="quiz-idea" autoFocus value={idea} onChange={(e) => setIdea(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && idea.trim().length >= 3) go("audience"); }} placeholder="Ex. : coussin chauffant pour le dos" className="field mt-2" />
              </div>
            )}
          </div>
        )}
        {step === "niche" && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {NICHES.map((x, i) => <Card key={x.id} tint={i} icon={x.icon} label={x.label} on={niche === x.id} onClick={() => { if (x.id !== niche) setProduct(null); setNiche(x.id); go("product"); }} />)}
            <Card tint={NICHES.length} icon={Shuffle} label="Surprends-moi" hint="On choisit pour toi" on={false} onClick={() => { const r = NICHES[Math.floor(Math.random() * NICHES.length)]; setProduct(null); setNiche(r.id); go("product"); }} />
          </div>
        )}
        {step === "product" && n && (
          <div className="grid gap-3 sm:grid-cols-2">
            {n.products.map(([name, brief], i) => <Card key={name} tint={i} row icon={n.icon} label={name} hint={brief} on={product === brief} onClick={() => setProduct(brief)} />)}
          </div>
        )}
        {step === "audience" && <Grid options={AUDIENCES} value={audience} cols={3} onPick={(id) => { setAudience(id); go("style"); }} />}
        {step === "style" && !busy && <StyleSwipe onDone={finish} />}
      </div>

      {error && <p role="alert" className="mt-6 text-center text-sm text-bad">{error}</p>}

      {((step === "idea" && hasIdea) || step === "product") && (
        <NextButton disabled={step === "idea" ? idea.trim().length < 3 : !product} onClick={() => go("audience")} />
      )}
      {busy && <p className="mt-8 flex items-center justify-center gap-3 text-fg-muted"><Spinner /> Ta boutique se prépare…</p>}
    </div>
  );
}

function NextButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,#34f0b0,#0fae7c)] text-[16px] font-semibold text-[#03140d] shadow-[0_12px_40px_-10px_rgb(46_230_166/0.8),inset_0_1px_0_rgb(255_255_255/0.45)] transition-all hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-40">
      Étape suivante <ArrowRight className="h-5 w-5" />
    </button>
  );
}

function Grid({ options, value, onPick, cols = 3 }: { options: Option[]; value: string | null; onPick: (id: string) => void; cols?: 2 | 3 }) {
  return (
    <div className={cn("grid grid-cols-2 gap-3", cols === 3 && "sm:grid-cols-3")}>
      {options.map((o, i) => <Card key={o.id} tint={i} icon={o.icon} label={o.label} hint={o.hint} on={value === o.id} onClick={() => onPick(o.id)} />)}
    </div>
  );
}

// Couleurs des réponses : une teinte par carte, harmonieuses sur le fond vert de Vigenia.
const HUES = ["#34d399", "#22d3ee", "#a3e635", "#fbbf24", "#a78bfa", "#fb7185", "#38bdf8", "#f97316", "#2dd4bf", "#e879f9", "#4ade80", "#facc15", "#60a5fa"];

// Carte de réponse : verre sombre, icône dans une pastille colorée, halo de la même couleur quand elle est choisie.
function Card({ icon: I, label, hint, on, row, tint = 0, onClick }: { icon: Icon; label: string; hint?: string; on: boolean; row?: boolean; tint?: number; onClick: () => void }) {
  const c = HUES[tint % HUES.length];
  return (
    <button type="button" onClick={onClick} aria-pressed={on}
      style={{ borderColor: on ? c : `${c}33`, background: on ? `linear-gradient(160deg, ${c}2b, ${c}10)` : `linear-gradient(160deg, ${c}12, rgb(255 255 255 / 0.02))`, boxShadow: on ? `0 0 30px -8px ${c}` : undefined }}
      className={cn("group relative flex rounded-[18px] border p-4 text-left backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110", row ? "items-center gap-3.5" : "flex-col items-center gap-3 py-6 text-center")}>
      <span style={{ background: `linear-gradient(150deg, ${c}, color-mix(in srgb, ${c} 55%, #052e22))`, boxShadow: `0 8px 20px -8px ${c}, inset 0 1px 0 rgb(255 255 255 / 0.45)` }}
        className={cn("grid shrink-0 place-items-center rounded-[14px] text-[#03140d] transition-transform group-hover:scale-105", row ? "h-11 w-11" : "h-14 w-14")}>
        <I className={row ? "h-5 w-5" : "h-7 w-7"} />
      </span>
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold leading-tight text-white">{label}</span>
        {hint && <span className="mt-1 block text-xs leading-snug text-fg-muted">{hint}</span>}
      </span>
      {on && <span className="absolute right-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-full text-[#03140d]" style={{ background: c }}><Check className="h-3 w-3" /></span>}
    </button>
  );
}

// Boutiques à aimer (cœur) ou non (croix), comme sur une appli de rencontre : on peut aussi les faire glisser.
function StyleSwipe({ onDone }: { onDone: (style: string | null) => void }) {
  const [i, setI] = useState(0);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [fly, setFly] = useState<"left" | "right" | null>(null);
  const [dx, setDx] = useState(0);
  const start = useRef<number | null>(null);
  const s = SWIPE[i];

  function decide(like: boolean) {
    if (!s || fly) return;
    const next = { ...likes };
    if (like) next[STYLE_OF[s.slug]] = (next[STYLE_OF[s.slug]] ?? 0) + 1;
    setFly(like ? "right" : "left");
    window.setTimeout(() => {
      setFly(null); setDx(0); setLikes(next);
      if (i + 1 >= SWIPE.length) {
        const best = Object.entries(next).sort((a, b) => b[1] - a[1])[0];
        onDone(best ? best[0] : null);
      } else setI(i + 1);
    }, 280);
  }

  if (!s) return null;
  const tx = fly === "right" ? 520 : fly === "left" ? -520 : dx;
  return (
    <div className="flex flex-col items-center">
      <p className="-mt-3 mb-5 text-center text-sm text-fg-muted">Dis-nous ce que tu aimes : ta boutique prendra ce style. {i + 1} / {SWIPE.length}</p>
      <div className="relative h-[430px] w-full max-w-[320px]">
        {SWIPE[i + 1] && <div className="absolute inset-0 scale-[0.94] rounded-[22px] opacity-50" style={{ background: SWIPE[i + 1].palette.accent }} />}
        <div
          onPointerDown={(e) => { start.current = e.clientX; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); }}
          onPointerMove={(e) => { if (start.current !== null) setDx(e.clientX - start.current); }}
          onPointerUp={() => { const d = dx; start.current = null; if (d > 90) decide(true); else if (d < -90) decide(false); else setDx(0); }}
          className="absolute inset-0 cursor-grab touch-pan-y select-none overflow-hidden rounded-[22px] p-4 shadow-[0_30px_60px_-25px_rgb(0_0_0/0.8)] ring-1 ring-white/15 active:cursor-grabbing"
          style={{ transform: `translateX(${tx}px) rotate(${tx / 22}deg)`, transition: start.current !== null ? "none" : "transform .28s ease-out", background: `linear-gradient(165deg, color-mix(in oklab, ${s.palette.accent} 70%, white), ${s.palette.accent} 55%, color-mix(in oklab, ${s.palette.accent} 75%, black))` }}
        >
          <div className="pointer-events-none"><StoreLongFrame s={s} /></div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-5 pb-4 pt-10">
            <p className="text-xl font-semibold text-white">{s.name}</p>
            <p className="text-xs text-white/75">{s.category}</p>
          </div>
          {dx > 30 && <span className="pointer-events-none absolute left-4 top-4 rotate-[-12deg] rounded-lg border-2 border-[#34f0b0] px-2 py-0.5 text-sm font-bold text-[#34f0b0]">J'AIME</span>}
          {dx < -30 && <span className="pointer-events-none absolute right-4 top-4 rotate-[12deg] rounded-lg border-2 border-[#fb7185] px-2 py-0.5 text-sm font-bold text-[#fb7185]">BOF</span>}
        </div>
      </div>
      <div className="mt-6 flex items-center gap-6">
        <button type="button" aria-label="Je n'aime pas" onClick={() => decide(false)} className="grid h-16 w-16 place-items-center rounded-full border border-[#fb7185]/50 bg-[#fb7185]/10 text-[#fb7185] shadow-[0_10px_30px_-10px_rgb(251_113_133/0.7)] transition-transform hover:scale-110 active:scale-95"><X className="h-8 w-8" /></button>
        <button type="button" aria-label="J'aime" onClick={() => decide(true)} className="grid h-20 w-20 place-items-center rounded-full bg-[linear-gradient(160deg,#34f0b0,#0fae7c)] text-[#03140d] shadow-[0_12px_36px_-8px_rgb(46_230_166/0.8)] transition-transform hover:scale-110 active:scale-95"><Heart className="h-9 w-9 fill-current" /></button>
      </div>
      <button type="button" onClick={() => onDone(null)} className="mt-5 text-sm text-fg-muted underline underline-offset-4 hover:text-white">Passer : l'IA choisit le style</button>
    </div>
  );
}

const QUIZ_KEY = "vg-quiz-brief";
export function saveQuizBrief(brief: string) {
  try { localStorage.setItem(QUIZ_KEY, brief); } catch { /* stockage indisponible */ }
}
export function takeQuizBrief() {
  try {
    const b = localStorage.getItem(QUIZ_KEY);
    localStorage.removeItem(QUIZ_KEY);
    return b;
  } catch { return null; }
}
