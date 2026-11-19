"use client";

// Quiz partagé : page publique /quiz (avant le compte) et /app/quiz (dans l'espace client).
// D'abord le profil (où il en est, son objectif), puis son idée ou un univers, puis il choisit
// un produit parmi des propositions. Les réponses forment la description de la boutique.
import { ArrowLeft, ArrowRight, Baby, Check, Compass, Lightbulb, PenLine, Rocket, Shuffle, Sparkles, Sprout, Store, Target, TrendingUp, User, UserRound, Users, Zap } from "lucide-react";
import { useState } from "react";
import { Spinner } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { NICHES } from "@/lib/niches";

type Icon = React.ComponentType<{ className?: string }>;
type Option = { id: string; label: string; hint?: string; icon: Icon };

const LEVELS: Option[] = [
  { id: "debut", label: "Je débute complètement", hint: "Jamais vendu en ligne", icon: Sprout },
  { id: "essai", label: "J'ai déjà essayé", hint: "Pas encore de vente", icon: Compass },
  { id: "ailleurs", label: "Je vends déjà ailleurs", hint: "Vinted, Instagram, marché…", icon: Store },
  { id: "boutique", label: "J'ai déjà une boutique", hint: "Je veux en lancer une autre", icon: TrendingUp },
];
const GOALS: Option[] = [
  { id: "complement", label: "Un complément de revenu", hint: "À côté des cours ou du travail", icon: Target },
  { id: "activite", label: "En faire mon activité", hint: "Je veux en vivre", icon: Rocket },
  { id: "tester", label: "Tester une idée", hint: "Voir si ça marche", icon: Lightbulb },
];
const AUDIENCES: Option[] = [
  { id: "femmes", label: "Les femmes", icon: UserRound },
  { id: "hommes", label: "Les hommes", icon: User },
  { id: "jeunes", label: "Les 18-25 ans", icon: Zap },
  { id: "parents", label: "Les parents", icon: Baby },
  { id: "tous", label: "Tout le monde", icon: Users },
];
const AUDIENCE_TEXT: Record<string, string> = { femmes: "les femmes", hommes: "les hommes", jeunes: "les jeunes de 18 à 25 ans", parents: "les parents", tous: "tout le monde" };
const LEVEL_TEXT: Record<string, string> = {
  debut: "Le vendeur débute : textes simples, rassurants et très clairs.",
  essai: "Le vendeur a déjà essayé sans vendre : boutique très orientée conversion.",
  ailleurs: "Le vendeur vend déjà sur les réseaux : ton proche et authentique.",
  boutique: "Le vendeur a déjà une boutique : rendu premium et professionnel.",
};

type Step = "level" | "goal" | "idea" | "niche" | "product" | "audience";

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
  const plan: Step[] = hasIdea ? ["level", "goal", "idea", "audience"] : ["level", "goal", "idea", "niche", "product", "audience"];
  const index = plan.indexOf(step);
  const go = (s: Step) => setHistory((h) => [...h, s]);
  const back = () => setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));

  const chosen = hasIdea ? idea.trim() : product;

  async function finish(aud: string) {
    if (!chosen) return;
    const brief = [`${chosen.replace(/[.\s]+$/, "")}.`, `Pour ${AUDIENCE_TEXT[aud]}.`, level ? LEVEL_TEXT[level] : ""].filter(Boolean).join(" ");
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
        {step === "level" && <Grid options={LEVELS} value={level} cols={2} onPick={(id) => { setLevel(id); go("goal"); }} />}
        {step === "goal" && <Grid options={GOALS} value={goal} cols={3} onPick={(id) => { setGoal(id); go("idea"); }} />}
        {step === "idea" && (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Card icon={Lightbulb} label="Oui, j'ai mon idée" hint="Je l'écris juste en dessous" on={hasIdea === true} onClick={() => setHasIdea(true)} />
              <Card icon={Sparkles} label="Pas encore" hint="Propose-moi des produits" on={hasIdea === false} onClick={() => { setHasIdea(false); go("niche"); }} />
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
            {NICHES.map((x) => <Card key={x.id} icon={x.icon} label={x.label} on={niche === x.id} onClick={() => { if (x.id !== niche) setProduct(null); setNiche(x.id); go("product"); }} />)}
            <Card icon={Shuffle} label="Surprends-moi" hint="On choisit pour toi" on={false} onClick={() => { const r = NICHES[Math.floor(Math.random() * NICHES.length)]; setProduct(null); setNiche(r.id); go("product"); }} />
          </div>
        )}
        {step === "product" && n && (
          <div className="grid gap-3 sm:grid-cols-2">
            {n.products.map(([name, brief]) => <Card key={name} row icon={n.icon} label={name} hint={brief} on={product === brief} onClick={() => setProduct(brief)} />)}
          </div>
        )}
        {step === "audience" && <Grid options={AUDIENCES} value={audience} cols={3} onPick={(id) => { setAudience(id); finish(id); }} />}
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
      {options.map((o) => <Card key={o.id} icon={o.icon} label={o.label} hint={o.hint} on={value === o.id} onClick={() => onPick(o.id)} />)}
    </div>
  );
}

// Carte de réponse : verre sombre, icône émeraude, halo vert quand elle est choisie.
function Card({ icon: I, label, hint, on, row, onClick }: { icon: Icon; label: string; hint?: string; on: boolean; row?: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} className={cn(
      "group relative flex rounded-[18px] border p-4 text-left backdrop-blur transition-all duration-200 hover:-translate-y-0.5",
      row ? "items-center gap-3.5" : "flex-col items-center gap-3 py-6 text-center",
      on ? "border-[#34f0b0]/80 bg-[linear-gradient(160deg,rgb(52_240_176/0.16),rgb(16_185_129/0.08))] shadow-[0_0_30px_-8px_rgb(46_230_166/0.7)]"
        : "border-white/10 bg-[linear-gradient(160deg,rgb(255_255_255/0.06),rgb(255_255_255/0.02))] hover:border-[#34f0b0]/45 hover:shadow-[0_0_24px_-10px_rgb(46_230_166/0.6)]",
    )}>
      <span className={cn("grid shrink-0 place-items-center rounded-[14px] ring-1 transition-all", row ? "h-11 w-11" : "h-14 w-14",
        on ? "bg-[linear-gradient(160deg,#34f0b0,#0fae7c)] text-[#03140d] ring-white/30" : "bg-[linear-gradient(160deg,rgb(52_240_176/0.18),rgb(16_185_129/0.08))] text-[#86efc9] ring-[#34f0b0]/25 group-hover:text-[#b7f7dc]")}>
        <I className={row ? "h-5 w-5" : "h-7 w-7"} />
      </span>
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold leading-tight text-white">{label}</span>
        {hint && <span className="mt-1 block text-xs leading-snug text-fg-muted">{hint}</span>}
      </span>
      {on && <span className="absolute right-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-full bg-[#34f0b0] text-[#03140d]"><Check className="h-3 w-3" /></span>}
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
