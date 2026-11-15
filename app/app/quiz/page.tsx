"use client";

import { ArrowLeft, ArrowRight, Baby, Crown, Flame, Gem, HeartHandshake, Leaf, PenLine, Shuffle, Sparkles, Tag, User, UserRound, Users, Wand2, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/components/app/AppContext";
import { Spinner } from "@/components/ui/Button";
import * as api from "@/lib/api/client";
import { cn } from "@/lib/cn";
import { NICHES } from "@/lib/niches";

type Option = { id: string; label: string; hint?: string; icon: React.ComponentType<{ className?: string }> };

const AUDIENCES: Option[] = [
  { id: "femmes", label: "Femmes", icon: UserRound },
  { id: "hommes", label: "Hommes", icon: User },
  { id: "jeunes", label: "Jeunes (18-25 ans)", icon: Zap },
  { id: "parents", label: "Parents", icon: Baby },
  { id: "tous", label: "Tout le monde", icon: Users },
];
const STYLES: Option[] = [
  { id: "premium", label: "Premium et épuré", hint: "Beaucoup de blanc, élégant", icon: Gem },
  { id: "direct", label: "Vente directe", hint: "Problème → solution, promos", icon: Flame },
  { id: "lifestyle", label: "Lifestyle chaleureux", hint: "Photos de vie, couleurs douces", icon: Leaf },
  { id: "tech", label: "Sport et tech", hint: "Sombre, couleurs vives", icon: Zap },
  { id: "ia", label: "Laisse l'IA choisir", hint: "Selon ta niche", icon: Wand2 },
];
const PRICES: Option[] = [
  { id: "petit", label: "Petit prix", hint: "Moins de 20 €", icon: Tag },
  { id: "moyen", label: "Prix moyen", hint: "De 20 à 50 €", icon: HeartHandshake },
  { id: "premium", label: "Haut de gamme", hint: "Plus de 50 €", icon: Crown },
];
const STYLE_TEXT: Record<string, string> = {
  premium: "style premium minimal, élégant et épuré",
  direct: "style vente directe, orienté problème → solution",
  lifestyle: "style lifestyle chaleureux, avec des photos de vie",
  tech: "style sport/tech, fond sombre et couleurs vives",
};
const AUDIENCE_TEXT: Record<string, string> = { femmes: "les femmes", hommes: "les hommes", jeunes: "les jeunes de 18 à 25 ans", parents: "les parents", tous: "tout le monde" };
const PRICE_TEXT: Record<string, string> = { petit: "petit prix, moins de 20 €", moyen: "prix moyen, entre 20 et 50 €", premium: "haut de gamme, plus de 50 €" };
const STEPS = ["Ta niche", "Ton produit", "Tes clients", "Ton style", "Ton prix"];

// Quiz en 5 questions pour ceux qui n'ont pas d'idée précise : il construit la description
// de la boutique, puis la crée (comme « Générer »).
export default function QuizPage() {
  const router = useRouter();
  const { setStores, refresh } = useApp();
  const [step, setStep] = useState(0);
  const [niche, setNiche] = useState<string | null>(null);
  const [product, setProduct] = useState<string | null>(null);
  const [custom, setCustom] = useState("");
  const [audience, setAudience] = useState<string | null>(null);
  const [style, setStyle] = useState<string | null>(null);
  const [price, setPrice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const n = NICHES.find((x) => x.id === niche);

  const chosenProduct = product === "custom" ? custom.trim() : product;
  const canNext = [!!niche, !!chosenProduct && chosenProduct.length >= 3, !!audience, !!style, !!price][step];

  function pickNiche(id: string) {
    const real = id === "random" ? NICHES[Math.floor(Math.random() * NICHES.length)].id : id;
    if (real !== niche) setProduct(null);
    setNiche(real);
    setStep(1);
  }

  async function finish() {
    if (!chosenProduct || !audience || !style || !price) return;
    const brief = [
      `${chosenProduct}.`,
      `Pour ${AUDIENCE_TEXT[audience]}.`,
      `Gamme de prix : ${PRICE_TEXT[price]}.`,
      style !== "ia" ? `Boutique au ${STYLE_TEXT[style]}.` : "",
    ].filter(Boolean).join(" ");
    setBusy(true);
    setError("");
    try {
      const { store } = await api.createStore({ mode: "start", brief, language: "français" });
      setStores((s) => [store, ...s]);
      refresh();
      router.push(`/app/boutiques/${store.id}`);
    } catch (e) {
      // Aperçu déjà utilisé ou autre souci : on garde tout dans le formulaire habituel.
      if (e instanceof api.ApiClientError && e.code === "subscription_required") return router.push(`/app?${new URLSearchParams({ mode: "start", brief })}`);
      setBusy(false);
      setError((e as Error).message);
    }
  }

  const next = () => (step < 4 ? setStep(step + 1) : finish());

  return (
    <div className="mx-auto max-w-3xl px-5 pb-28 pt-8 sm:px-8 sm:pt-12">
      {/* Avancement */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => <span key={s} className={cn("h-1.5 flex-1 rounded-full transition-colors", i <= step ? "bg-[linear-gradient(90deg,#34f0b0,#0fae7c)]" : "bg-white/10")} />)}
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-fg-muted">
        {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className="inline-flex items-center gap-1.5 hover:text-fg"><ArrowLeft className="h-4 w-4" /> Retour</button> : <span />}
        <span>Question {step + 1} sur 5</span>
      </div>

      <h1 className="mt-6 text-center text-[clamp(1.7rem,1.2rem+1.8vw,2.5rem)] font-semibold leading-tight tracking-[-0.03em]">
        {[
          <>Choisis ta <span className="serif-accent">niche</span></>,
          <>Quel <span className="serif-accent">produit</span> veux-tu vendre ?</>,
          <>À qui veux-tu <span className="serif-accent">vendre</span> ?</>,
          <>Quel <span className="serif-accent">style</span> pour ta boutique ?</>,
          <>À quel <span className="serif-accent">prix</span> ?</>,
        ][step]}
      </h1>

      <div className="mt-8 [animation:fade-in_.35s_ease-out_both]" key={step}>
        {step === 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {NICHES.map((x) => <Card key={x.id} icon={x.icon} label={x.label} on={niche === x.id} onClick={() => pickNiche(x.id)} />)}
            <Card icon={Shuffle} label="Pas d'idée" hint="On choisit pour toi" on={false} onClick={() => pickNiche("random")} />
          </div>
        )}
        {step === 1 && n && (
          <div className="grid gap-3 sm:grid-cols-2">
            {n.products.map(([name, brief]) => <Card key={name} row icon={n.icon} label={name} hint={brief} on={product === brief} onClick={() => setProduct(brief)} />)}
            <div className={cn("rounded-[18px] border p-4 sm:col-span-2", product === "custom" ? "border-[#34f0b0]/70 bg-[#34f0b0]/10" : "border-white/10 bg-white/[0.04]")}>
              <label htmlFor="quiz-custom" className="flex items-center gap-2 text-sm font-semibold"><PenLine className="h-4 w-4 text-[#86efc9]" /> J'ai mon idée</label>
              <input id="quiz-custom" value={custom} onFocus={() => setProduct("custom")} onChange={(e) => { setCustom(e.target.value); setProduct("custom"); }} placeholder="Ex. : coussin chauffant pour le dos" className="field mt-2" />
            </div>
          </div>
        )}
        {step === 2 && <Grid options={AUDIENCES} value={audience} onPick={(id) => { setAudience(id); setStep(3); }} />}
        {step === 3 && <Grid options={STYLES} value={style} onPick={(id) => { setStyle(id); setStep(4); }} />}
        {step === 4 && <Grid options={PRICES} value={price} onPick={setPrice} />}
      </div>

      {error && <p role="alert" className="mt-6 text-center text-sm text-bad">{error}</p>}

      {(step === 1 || step === 4 || (step > 0 && canNext)) && (
        <button type="button" disabled={!canNext || busy} onClick={next} className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,#34f0b0,#0fae7c)] text-[16px] font-semibold text-[#03140d] shadow-[0_12px_40px_-10px_rgb(46_230_166/0.8),inset_0_1px_0_rgb(255_255_255/0.45)] transition-all hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-40">
          {busy ? <><Spinner /> Création…</> : step === 4 ? <><Sparkles className="h-5 w-5" /> Créer ma boutique</> : <>Étape suivante <ArrowRight className="h-5 w-5" /></>}
        </button>
      )}
    </div>
  );
}

function Grid({ options, value, onPick }: { options: Option[]; value: string | null; onPick: (id: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {options.map((o) => <Card key={o.id} icon={o.icon} label={o.label} hint={o.hint} on={value === o.id} onClick={() => onPick(o.id)} />)}
    </div>
  );
}

function Card({ icon: I, label, hint, on, row, onClick }: { icon: React.ComponentType<{ className?: string }>; label: string; hint?: string; on: boolean; row?: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} className={cn(
      "group flex rounded-[18px] border p-4 text-left transition-all hover:-translate-y-0.5",
      row ? "items-center gap-3" : "flex-col items-center gap-2.5 py-6 text-center",
      on ? "border-[#34f0b0]/70 bg-[#34f0b0]/10 shadow-[0_0_24px_-6px_rgb(46_230_166/0.6)]" : "border-white/10 bg-white/[0.04] hover:border-[#34f0b0]/40 hover:bg-white/[0.07]",
    )}>
      <span className={cn("grid shrink-0 place-items-center rounded-[14px] transition-colors", row ? "h-10 w-10" : "h-14 w-14", on ? "bg-[linear-gradient(160deg,#34f0b0,#0fae7c)] text-[#03140d]" : "bg-[#34f0b0]/10 text-[#86efc9] group-hover:bg-[#34f0b0]/20")}>
        <I className={row ? "h-5 w-5" : "h-7 w-7"} />
      </span>
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold leading-tight">{label}</span>
        {hint && <span className="mt-1 block text-xs text-fg-muted">{hint}</span>}
      </span>
    </button>
  );
}
