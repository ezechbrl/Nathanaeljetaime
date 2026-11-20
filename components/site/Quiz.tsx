"use client";

// Quiz partagé : page publique /quiz (avant le compte) et /app/quiz (dans l'espace client).
// Profil (où il en est, objectif, temps), puis son idée ou une grande catégorie → un univers → un produit,
// ses clients, et enfin les boutiques qu'il aime (cœur / croix) pour choisir le style.
// Toujours un nombre pair de réponses, pour des grilles bien alignées sur téléphone.
import { ArrowLeft, ArrowRight, Baby, Bike, Check, Clock, Compass, Flame, Gem, GraduationCap, Home, Hourglass, Lightbulb, Palette, PawPrint, PenLine, Rocket, Shuffle, Sparkles, Sprout, Store, Target, Timer, TrendingUp, User, UserRound, Users, Zap } from "lucide-react";
import { useState } from "react";
import { Spinner } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { BIG_NICHES, NICHES } from "@/lib/niches";
import { STYLE_TEXT, StyleSwipe } from "./StyleSwipe";

type Icon = React.ComponentType<{ className?: string }>;
type Option = { id: string; label: string; hint?: string; icon: Icon };

const LEVELS: Option[] = [
  { id: "debut", label: "Je débute complètement", hint: "Jamais vendu en ligne", icon: Sprout },
  { id: "apprendre", label: "J'apprends le e-commerce", hint: "Vidéos, formations…", icon: GraduationCap },
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
  { id: "maison", label: "Travailler de chez moi", hint: "À mon rythme", icon: Home },
];
const TIMES: Option[] = [
  { id: "1", label: "Moins de 2 h", hint: "par semaine", icon: Clock },
  { id: "2", label: "2 à 5 h", hint: "par semaine", icon: Timer },
  { id: "3", label: "5 à 10 h", hint: "par semaine", icon: Hourglass },
  { id: "4", label: "Plus de 10 h", hint: "par semaine", icon: Flame },
];
const AUDIENCES: Option[] = [
  { id: "femmes", label: "Les femmes", icon: UserRound },
  { id: "hommes", label: "Les hommes", icon: User },
  { id: "jeunes", label: "Les 18-25 ans", icon: Zap },
  { id: "parents", label: "Les parents", icon: Baby },
  { id: "sportifs", label: "Les sportifs", icon: Bike },
  { id: "animaux", label: "Ceux qui ont un animal", icon: PawPrint },
  { id: "seniors", label: "Les plus de 50 ans", icon: UserRound },
  { id: "tous", label: "Tout le monde", icon: Users },
];
const AUDIENCE_TEXT: Record<string, string> = { femmes: "les femmes", hommes: "les hommes", jeunes: "les jeunes de 18 à 25 ans", parents: "les parents", sportifs: "les sportifs", animaux: "les propriétaires d'animaux", seniors: "les plus de 50 ans", tous: "tout le monde" };
const LEVEL_TEXT: Record<string, string> = {
  debut: "Le vendeur débute : textes simples, rassurants et très clairs.",
  apprendre: "Le vendeur apprend le e-commerce : boutique claire et bien structurée.",
  essai: "Le vendeur a déjà essayé sans vendre : boutique très orientée conversion.",
  ailleurs: "Le vendeur vend déjà sur les réseaux : ton proche et authentique.",
  boutique: "Le vendeur a déjà une boutique : rendu premium et professionnel.",
  createur: "Le vendeur crée ses propres produits : mettre en avant le savoir-faire et l'histoire.",
};

type Step = "level" | "goal" | "time" | "idea" | "big" | "sub" | "product" | "audience" | "style";

export function Quiz({ onFinish, skipHref }: { onFinish: (brief: string) => Promise<void>; skipHref?: string }) {
  const [history, setHistory] = useState<Step[]>(["level"]);
  const step = history[history.length - 1];
  const [level, setLevel] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [hasIdea, setHasIdea] = useState<boolean | null>(null);
  const [idea, setIdea] = useState("");
  const [big, setBig] = useState<string | null>(null);
  const [niche, setNiche] = useState<string | null>(null);
  const [product, setProduct] = useState<string | null>(null);
  const [audience, setAudience] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const b = BIG_NICHES.find((x) => x.id === big);
  const n = NICHES.find((x) => x.id === niche);

  // 9 questions sans idée de produit ; 6 s'il a déjà la sienne.
  const plan: Step[] = hasIdea ? ["level", "goal", "time", "idea", "audience", "style"] : ["level", "goal", "time", "idea", "big", "sub", "product", "audience", "style"];
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
    time: <>Combien de <span className="serif-accent">temps</span> peux-tu y consacrer ?</>,
    idea: <>Tu as déjà une <span className="serif-accent">idée</span> de produit ?</>,
    big: <>Qu'est-ce qui t'<span className="mark-green">attire</span> ?</>,
    sub: <>Plutôt <span className="serif-accent">lequel</span> ?</>,
    product: <>Lequel te <span className="serif-accent">plaît</span> le plus ?</>,
    audience: <>À qui veux-tu <span className="mark-green">vendre</span> ?</>,
    style: <>Ces boutiques, tu <span className="serif-accent">aimes</span> ?</>,
  };

  return (
    <div className="mx-auto max-w-3xl px-5 pb-28 pt-8 sm:px-8 sm:pt-12">
      <div className="flex items-center gap-1.5">
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
        {step === "level" && <Grid options={LEVELS} value={level} onPick={(id) => { setLevel(id); go("goal"); }} />}
        {step === "goal" && <Grid options={GOALS} value={goal} onPick={(id) => { setGoal(id); go("time"); }} />}
        {step === "time" && <Grid options={TIMES} value={time} cols={4} onPick={(id) => { setTime(id); go("idea"); }} />}
        {step === "idea" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Card tint={0} icon={Lightbulb} label="Oui, j'ai mon idée" hint="Je l'écris juste en dessous" on={hasIdea === true} onClick={() => setHasIdea(true)} />
              <Card tint={3} icon={Sparkles} label="Pas encore" hint="Propose-moi des produits" on={hasIdea === false} onClick={() => { setHasIdea(false); go("big"); }} />
            </div>
            {hasIdea && (
              <div className="rounded-[18px] border border-[#34f0b0]/40 bg-[#34f0b0]/[0.07] p-4 [animation:fade-in_.3s_ease-out_both]">
                <label htmlFor="quiz-idea" className="flex items-center gap-2 text-sm font-semibold text-white"><PenLine className="h-4 w-4 text-[#86efc9]" /> Ton produit</label>
                <input id="quiz-idea" autoFocus value={idea} onChange={(e) => setIdea(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && idea.trim().length >= 3) go("audience"); }} placeholder="Ex. : coussin chauffant pour le dos" className="field mt-2" />
              </div>
            )}
          </div>
        )}
        {step === "big" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {BIG_NICHES.map((x, i) => <BigCard key={x.id} tint={i} icon={x.icon} label={x.label} hint={x.hint} on={big === x.id} onClick={() => { if (x.id !== big) { setNiche(null); setProduct(null); } setBig(x.id); go("sub"); }} />)}
            </div>
            {/* « Surprends-moi » en grand, sous toutes les catégories. */}
            <button type="button" onClick={() => { const r = NICHES[Math.floor(Math.random() * NICHES.length)]; setBig(BIG_NICHES.find((x) => (x.subs as readonly string[]).includes(r.id))?.id ?? null); setNiche(r.id); setProduct(null); setHistory((h) => [...h, "sub", "product"]); }}
              className="flex w-full items-center justify-center gap-3 rounded-[18px] border border-dashed border-[#34f0b0]/45 bg-[linear-gradient(110deg,rgb(52_240_176/0.1),rgb(45_212_191/0.06))] p-5 text-white transition-all hover:-translate-y-0.5 hover:border-[#34f0b0]/80">
              <span className="grid h-11 w-11 place-items-center rounded-[13px] bg-[linear-gradient(150deg,#34f0b0,#0fae7c)] text-[#03140d]"><Shuffle className="h-5 w-5" /></span>
              <span className="text-left"><span className="block text-[16px] font-semibold">Surprends-moi</span><span className="block text-xs text-fg-muted">On choisit un univers pour toi</span></span>
            </button>
          </div>
        )}
        {step === "sub" && b && (
          <div className="grid grid-cols-2 gap-3">
            {b.subs.map((id, i) => { const x = NICHES.find((y) => y.id === id)!; return <BigCard key={id} tint={i + 2} icon={x.icon} label={x.label} hint={x.products.slice(0, 2).map((p) => p[0]).join(", ") + "…"} on={niche === id} onClick={() => { if (id !== niche) setProduct(null); setNiche(id); go("product"); }} />; })}
          </div>
        )}
        {step === "product" && n && (
          <div className="grid gap-3 sm:grid-cols-2">
            {n.products.map(([name, brief], i) => <Card key={name} tint={i} row icon={n.icon} label={name} hint={brief} on={product === brief} onClick={() => setProduct(brief)} />)}
          </div>
        )}
        {step === "audience" && <Grid options={AUDIENCES} value={audience} cols={4} onPick={(id) => { setAudience(id); go("style"); }} />}
        {step === "style" && !busy && (
          <>
            <p className="-mt-4 mb-4 text-center text-sm text-fg-muted">Un cœur si tu aimes, une croix sinon : ta boutique prendra le style que tu préfères.</p>
            <StyleSwipe onDone={finish} />
          </>
        )}
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

function Grid({ options, value, onPick, cols = 3 }: { options: Option[]; value: string | null; onPick: (id: string) => void; cols?: 3 | 4 }) {
  return (
    <div className={cn("grid grid-cols-2 gap-3", cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-4")}>
      {options.map((o, i) => <Card key={o.id} tint={i} icon={o.icon} label={o.label} hint={o.hint} on={value === o.id} onClick={() => onPick(o.id)} />)}
    </div>
  );
}

// Gamme harmonieuse autour du vert Vigenia : menthe, turquoise, vert d'eau, jade, citron vert doux.
const HUES = ["#34d399", "#2dd4bf", "#86efac", "#5eead4", "#a3e635", "#6ee7b7", "#22d3ee", "#4ade80", "#99f6e4", "#bef264", "#10b981", "#67e8f9"];
const hue = (i: number) => HUES[i % HUES.length];

function Card({ icon: I, label, hint, on, row, tint = 0, onClick }: { icon: Icon; label: string; hint?: string; on: boolean; row?: boolean; tint?: number; onClick: () => void }) {
  const c = hue(tint);
  return (
    <button type="button" onClick={onClick} aria-pressed={on}
      style={{ borderColor: on ? c : `${c}33`, background: on ? `linear-gradient(160deg, ${c}2b, ${c}10)` : `linear-gradient(160deg, ${c}12, rgb(255 255 255 / 0.02))`, boxShadow: on ? `0 0 30px -8px ${c}` : undefined }}
      className={cn("group relative flex h-full rounded-[18px] border p-4 text-left backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110", row ? "items-center gap-3.5" : "flex-col items-center gap-3 py-6 text-center")}>
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

// Grande carte (catégories) : icône plus grande, titre en belle typographie.
function BigCard({ icon: I, label, hint, on, tint = 0, onClick }: { icon: Icon; label: string; hint: string; on: boolean; tint?: number; onClick: () => void }) {
  const c = hue(tint);
  return (
    <button type="button" onClick={onClick} aria-pressed={on}
      style={{ borderColor: on ? c : `${c}40`, background: `radial-gradient(120% 90% at 50% 0%, ${c}26, transparent 70%), linear-gradient(160deg, rgb(255 255 255 / 0.05), rgb(255 255 255 / 0.01))`, boxShadow: on ? `0 0 34px -8px ${c}` : undefined }}
      className="group relative flex h-full flex-col items-center gap-3 rounded-[22px] border px-3 py-7 text-center backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:brightness-110">
      <span style={{ background: `linear-gradient(150deg, ${c}, color-mix(in srgb, ${c} 50%, #052e22))`, boxShadow: `0 12px 28px -10px ${c}, inset 0 1px 0 rgb(255 255 255 / 0.5)` }} className="grid h-16 w-16 place-items-center rounded-[18px] text-[#03140d] transition-transform group-hover:scale-105">
        <I className="h-8 w-8" />
      </span>
      <span className="font-display text-[17px] font-semibold leading-tight tracking-[-0.01em] text-white sm:text-[19px]">{label}</span>
      <span className="text-xs leading-snug text-fg-muted">{hint}</span>
    </button>
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
