"use client";

// Quiz partagé : page publique /quiz (avant le compte) et /app/quiz (dans l'espace client).
// Profil (où il en est, objectif, temps), puis son idée ou une grande catégorie → un univers → un produit,
// ses clients, et enfin les boutiques qu'il aime (cœur / croix) pour choisir le style.
// Toujours un nombre pair de réponses, pour des grilles bien alignées sur téléphone.
import { Banknote, BadgeCheck, BookOpen, Glasses, HandCoins, Languages, Map as MapIcon, Scissors, UserPlus, ArrowLeft, ArrowRight, Baby, BadgeEuro, Camera, CircleHelp, Coins, Crown, Factory, Globe, Hammer, Landmark, MapPin, Megaphone, MessageCircle, Package, PiggyBank, Search, ShoppingBag, Truck, Video, Wallet, Bike, Check, Clock, Compass, Flame, Gem, GraduationCap, Home, Hourglass, Lightbulb, Palette, PawPrint, PenLine, Rocket, Shuffle, Sparkles, Sprout, Store, Target, Timer, TrendingUp, User, UserRound, Users, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import * as api from "@/lib/api/client";
import { QuizAccount } from "./QuizAccount";
import { BIG_NICHES, NICHES } from "@/lib/niches";
import { STYLE_TEXT, StyleSwipe } from "./StyleSwipe";

type Icon = React.ComponentType<{ className?: string }>;
type Option = { id: string; label: string; hint?: string; icon: Icon };

const LEVELS: Option[] = [
  { id: "debut", label: "Je débute complètement", hint: "Jamais vendu en ligne", icon: Sprout },
  { id: "apprendre", label: "J'apprends l'e-commerce ou le dropshipping", hint: "Vidéos, formations…", icon: GraduationCap },
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
  { id: "creations", label: "Vendre mes créations", hint: "Ce que je fabrique", icon: Scissors },
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
  { id: "seniors", label: "Les plus de 50 ans", icon: Glasses },
  { id: "tous", label: "Tout le monde", icon: Users },
];
const PRICES: Option[] = [
  { id: "p1", label: "Moins de 20 €", hint: "Achat coup de cœur", icon: Coins },
  { id: "p2", label: "20 à 40 €", hint: "Le plus courant", icon: Wallet },
  { id: "p3", label: "40 à 80 €", hint: "Produit plus travaillé", icon: BadgeEuro },
  { id: "p4", label: "Plus de 80 €", hint: "Haut de gamme", icon: Crown },
];
const BUDGETS: Option[] = [
  { id: "b1", label: "Moins de 100 €", hint: "Je teste avec peu", icon: HandCoins },
  { id: "b2", label: "100 à 300 €", hint: "Pour la pub et un premier stock", icon: PiggyBank },
  { id: "b3", label: "300 à 1 000 €", hint: "Je peux investir un peu", icon: Banknote },
  { id: "b4", label: "Plus de 1 000 €", hint: "Je veux aller vite", icon: Landmark },
];
const BUDGET_TEXT: Record<string, string> = { b1: "Budget de départ : moins de 100 €.", b2: "Budget de départ : 100 à 300 €.", b3: "Budget de départ : 300 à 1 000 €.", b4: "Budget de départ : plus de 1 000 €." };
const SHOPIFY: Option[] = [
  { id: "s1", label: "Oui, j'ai une boutique", hint: "Déjà en ligne sur Shopify", icon: BadgeCheck },
  { id: "s2", label: "J'ai un compte", hint: "Mais pas encore de boutique", icon: ShoppingBag },
  { id: "s3", label: "Non, pas encore", hint: "Je n'ai pas de compte", icon: UserPlus },
  { id: "s4", label: "C'est quoi Shopify ?", hint: "Je ne connais pas", icon: BookOpen },
];
const SHOPIFY_TEXT: Record<string, string> = { s1: "Le vendeur a déjà une boutique Shopify.", s2: "Le vendeur a un compte Shopify sans boutique.", s3: "Le vendeur n'a pas encore de compte Shopify.", s4: "Le vendeur ne connaît pas Shopify : tout expliquer très simplement." };
const MARKETS: Option[] = [
  { id: "fr", label: "En France", hint: "Seulement la France", icon: MapPin },
  { id: "be", label: "France, Belgique, Suisse", hint: "Pays francophones", icon: Languages },
  { id: "eu", label: "Toute l'Europe", hint: "Plusieurs langues", icon: MapIcon },
  { id: "world", label: "Le monde entier", hint: "Partout", icon: Globe },
];
const MARKET_TEXT: Record<string, string> = { fr: "Pays de vente : France.", be: "Pays de vente : France, Belgique et Suisse.", eu: "Pays de vente : toute l'Europe.", world: "Pays de vente : le monde entier." };
const SUPPLY: Option[] = [
  { id: "drop", label: "Dropshipping", hint: "AliExpress, CJ… le fournisseur envoie", icon: Truck },
  { id: "stock", label: "J'ai mon stock", hint: "J'envoie les colis moi-même", icon: Package },
  { id: "make", label: "Je fabrique", hint: "Fait main ou atelier", icon: Hammer },
  { id: "brand", label: "Ma marque", hint: "Je fais fabriquer à mon nom", icon: Factory },
];
const SUPPLY_TEXT: Record<string, string> = { drop: "Approvisionnement : dropshipping (délais de livraison à annoncer honnêtement).", stock: "Approvisionnement : stock du vendeur, expédition rapide.", make: "Approvisionnement : fabrication par le vendeur.", brand: "Approvisionnement : produit fabriqué sous la marque du vendeur." };
const CHANNELS: Option[] = [
  { id: "tiktok", label: "TikTok", hint: "Vidéos courtes", icon: Video },
  { id: "insta", label: "Instagram", hint: "Posts et réels", icon: Camera },
  { id: "ads", label: "Pubs Facebook / Meta", hint: "Payantes", icon: Megaphone },
  { id: "google", label: "Google", hint: "Recherche et pubs", icon: Search },
  { id: "word", label: "Bouche-à-oreille", hint: "Amis, groupes, avis", icon: MessageCircle },
  { id: "unknown", label: "Je ne sais pas encore", hint: "On t'aidera", icon: CircleHelp },
];
const CHANNEL_TEXT: Record<string, string> = { tiktok: "Clients trouvés surtout via TikTok : accroches courtes et visuelles.", insta: "Clients trouvés surtout via Instagram : rendu très visuel.", ads: "Clients trouvés surtout via des pubs Meta : page produit très orientée achat.", google: "Clients trouvés surtout via Google : textes précis et bien référencés.", word: "Clients trouvés surtout par bouche-à-oreille : ton proche et rassurant.", unknown: "" };
const PRICE_TEXT: Record<string, string> = { p1: "Prix de vente visé : moins de 20 €.", p2: "Prix de vente visé : entre 20 et 40 €.", p3: "Prix de vente visé : entre 40 et 80 €.", p4: "Prix de vente visé : plus de 80 €, positionnement haut de gamme." };
const AUDIENCE_TEXT: Record<string, string> = { femmes: "les femmes", hommes: "les hommes", jeunes: "les jeunes de 18 à 25 ans", parents: "les parents", sportifs: "les sportifs", animaux: "les propriétaires d'animaux", seniors: "les plus de 50 ans", tous: "tout le monde" };
const LEVEL_TEXT: Record<string, string> = {
  debut: "Le vendeur débute : textes simples, rassurants et très clairs.",
  apprendre: "Le vendeur apprend le e-commerce : boutique claire et bien structurée.",
  essai: "Le vendeur a déjà essayé sans vendre : boutique très orientée conversion.",
  ailleurs: "Le vendeur vend déjà sur les réseaux : ton proche et authentique.",
  boutique: "Le vendeur a déjà une boutique : rendu premium et professionnel.",
  createur: "Le vendeur crée ses propres produits : mettre en avant le savoir-faire et l'histoire.",
};

type Step = "level" | "goal" | "time" | "budget" | "shopify" | "idea" | "big" | "sub" | "product" | "account" | "audience" | "market" | "supply" | "channel" | "price" | "style";
const STATE_KEY = "vg-quiz-state";

// `preset` : la description ou le lien déjà donnés sur l'accueil. Le quiz ne redemande pas le produit.
export function Quiz({ onFinish, skipHref, preset }: { onFinish: (brief: string) => Promise<void>; skipHref?: string; preset?: { text: string; isLink: boolean } }) {
  const [history, setHistory] = useState<Step[]>(["level"]);
  const step = history[history.length - 1];
  const [level, setLevel] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [hasIdea, setHasIdea] = useState<boolean | null>(preset ? true : null);
  const [idea, setIdea] = useState(preset && !preset.isLink ? preset.text : "");
  const [big, setBig] = useState<string | null>(null);
  const [niche, setNiche] = useState<string | null>(null);
  const [product, setProduct] = useState<string | null>(null);
  const [audience, setAudience] = useState<string | null>(null);
  const [price, setPrice] = useState<string | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  const [shopify, setShopify] = useState<string | null>(null);
  const [market, setMarket] = useState<string | null>(null);
  const [supply, setSupply] = useState<string | null>(null);
  const [channel, setChannel] = useState<string | null>(null);
  // Compte : déjà connecté (pas d'étape compte) ou pas. null tant qu'on ne sait pas.
  const [logged, setLogged] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const b = BIG_NICHES.find((x) => x.id === big);
  const n = NICHES.find((x) => x.id === niche);

  // 15 questions sans idée de produit (12 avec son idée, 11 avec un lien ou une description de l'accueil).
  // Au milieu, une fois le produit choisi : création du compte (sautée si déjà connecté).
  const head: Step[] = ["level", "goal", "time", "budget", "shopify"];
  // Le compte arrive tôt (7ᵉ étape), juste après « As-tu une idée ? », pour ne perdre personne avant.
  const ideaStep: Step[] = preset ? [] : ["idea"];
  const productSteps: Step[] = preset || hasIdea ? [] : ["big", "sub", "product"];
  const tail: Step[] = ["audience", "market", "supply", "channel", "price", "style"];
  const plan: Step[] = [...head, ...ideaStep, ...(logged ? [] : ["account" as Step]), ...productSteps, ...tail];
  const questions: Step[] = plan.filter((x) => x !== "account");
  const index = plan.indexOf(step);
  const qIndex = questions.indexOf(step);
  const go = (s: Step) => setHistory((h) => [...h, s]);
  const goNext = () => { const nx = plan[plan.indexOf(step) + 1]; if (nx) go(nx); };

  // Déjà connecté ? (pas d'étape compte)
  useEffect(() => { api.getMe().then(() => setLogged(true), () => setLogged(false)); }, []);
  // Réponses gardées dans le navigateur : si la page est rechargée (ou rouverte depuis le lien de l'e-mail), on reprend.
  const restored = useRef(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      const st = raw ? JSON.parse(raw) : null;
      if (st && Date.now() - st.t < 3 * 3600_000 && (st.preset ?? "") === (preset?.text ?? "") && Array.isArray(st.history) && st.history.length > 1) {
        setLevel(st.level); setGoal(st.goal); setTime(st.time); setBudget(st.budget); setShopify(st.shopify);
        setHasIdea(st.hasIdea); setIdea(st.idea ?? ""); setBig(st.big); setNiche(st.niche); setProduct(st.product);
        setAudience(st.audience); setMarket(st.market); setSupply(st.supply); setChannel(st.channel); setPrice(st.price);
        setHistory(st.history);
      }
    } catch { /* stockage indisponible */ }
    restored.current = true;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!restored.current) return;
    try { localStorage.setItem(STATE_KEY, JSON.stringify({ t: Date.now(), preset: preset?.text ?? "", history, level, goal, time, budget, shopify, hasIdea, idea, big, niche, product, audience, market, supply, channel, price })); } catch { /* stockage indisponible */ }
  }, [history, level, goal, time, budget, shopify, hasIdea, idea, big, niche, product, audience, market, supply, channel, price, preset?.text]);
  // Connecté pendant l'étape compte (ou déjà connecté en y arrivant) : on passe à la suite.
  const afterAccount: Step = preset || hasIdea ? "audience" : "big";
  useEffect(() => { if (step === "account" && logged) setHistory((h) => [...h.slice(0, -1), afterAccount]); }, [step, logged, afterAccount]);
  const back = () => setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
  const chosen = preset?.isLink ? "Produit du lien fourni" : hasIdea ? idea.trim() : product;

  // Suivi anonyme (Ventes) : jusqu'à quelle question le visiteur va, et s'il finit le quiz.
  const run = useRef("");
  const track = (s: Step | "fin", i: number, done = false) => {
    try {
      if (!run.current) run.current = Array.from(crypto.getRandomValues(new Uint8Array(10)), (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 20);
      if (localStorage.getItem("vg-owner") || navigator.webdriver) return;
      const vid = localStorage.getItem("vg-vid") ?? undefined;
      fetch("/api/track/quiz", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: run.current, vid, step: s, index: i, total: plan.length, hasIdea, done }), keepalive: true }).catch(() => {});
    } catch { /* suivi facultatif */ }
  };
  useEffect(() => { track(step, Math.max(0, index)); }, [step]); // eslint-disable-line react-hooks/exhaustive-deps
  // Nouvelle question : on remonte en haut, pour voir la question et toutes les réponses.
  const firstStep = useRef(true);
  useEffect(() => {
    if (firstStep.current) { firstStep.current = false; return; }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  async function finish(style: string | null) {
    if (!chosen || !audience) return;
    const brief = [`${chosen.replace(/[.\s]+$/, "")}.`, `Pour ${AUDIENCE_TEXT[audience]}.`, price ? PRICE_TEXT[price] : "", market ? MARKET_TEXT[market] : "", supply ? SUPPLY_TEXT[supply] : "", channel ? CHANNEL_TEXT[channel] : "", level ? LEVEL_TEXT[level] : "", shopify ? SHOPIFY_TEXT[shopify] : "", budget ? BUDGET_TEXT[budget] : "", style ? STYLE_TEXT[style] : ""].filter(Boolean).join(" ");
    setBusy(true);
    setError("");
    track("fin", plan.length, true);
    try {
      try { localStorage.removeItem(STATE_KEY); } catch { /* stockage indisponible */ }
      await onFinish(brief);
    } catch (e) {
      setBusy(false);
      setError((e as Error).message || "Une erreur est survenue. Réessaie.");
    }
  }

  // Question suivante pour chaque étape, une fois la réponse choisie.
  const ready: Record<Exclude<Step, "style" | "account">, boolean> = {
    level: !!level, goal: !!goal, time: !!time, budget: !!budget, shopify: !!shopify,
    idea: hasIdea === false || (hasIdea === true && idea.trim().length >= 3),
    big: !!big, sub: !!niche, product: !!product,
    audience: !!audience, market: !!market, supply: !!supply, channel: !!channel, price: !!price,
  };

  const titles: Record<Step, React.ReactNode> = {
    level: <>Où en es-tu en <span className="serif-accent">e-commerce</span> ou en <span className="serif-accent">dropshipping</span> ?</>,
    goal: <>Quel est ton <span className="mark-green">objectif</span> ?</>,
    time: <>Combien de <span className="serif-accent">temps</span> peux-tu y consacrer ?</>,
    budget: <>Quel <span className="mark-green">budget</span> pour te lancer ?</>,
    shopify: <>Tu as déjà un compte <span className="serif-accent">Shopify</span> ?</>,
    account: <>Crée ton <span className="serif-accent">compte</span> pour garder tes réponses</>,
    market: <>Dans quels <span className="serif-accent">pays</span> veux-tu vendre ?</>,
    supply: <>Comment tes clients vont <span className="mark-green">recevoir</span> le produit ?</>,
    channel: <>Comment vas-tu trouver tes <span className="serif-accent">clients</span> ?</>,
    idea: <>Tu as déjà une <span className="serif-accent">idée</span> de produit ?</>,
    big: <>Qu'est-ce qui t'<span className="mark-green">attire</span> ?</>,
    sub: <>Plutôt <span className="serif-accent">lequel</span> ?</>,
    product: <>Lequel te <span className="serif-accent">plaît</span> le plus ?</>,
    audience: <>À qui veux-tu <span className="mark-green">vendre</span> ?</>,
    price: <>À quel <span className="serif-accent">prix</span> veux-tu vendre ?</>,
    style: <>Quelle boutique tu aimerais <span className="serif-accent">avoir</span> ?</>,
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
        <span>{step === "account" ? "Ton compte" : `Question ${qIndex + 1} sur ${questions.length}`}</span>
      </div>

      {preset && step === "level" && (
        <p className="mx-auto mt-5 w-fit max-w-full truncate rounded-full border border-[#3dff9a]/30 bg-[#3dff9a]/10 px-3.5 py-1.5 text-center text-[13px] text-[#c8ffe2]">
          ✓ {preset.isLink ? "Ton lien produit est gardé" : `Ton idée est gardée : « ${preset.text.slice(0, 60)}${preset.text.length > 60 ? "…" : ""} »`}. Quelques questions pour faire ta boutique sur mesure.
        </p>
      )}
      <h1 key={step} className="mt-6 text-center text-[clamp(1.7rem,1.2rem+1.8vw,2.5rem)] font-semibold leading-tight tracking-[-0.03em] [animation:rise_.45s_cubic-bezier(.2,.8,.2,1)_both]">{titles[step]}</h1>

      <div className="mt-8 [animation:fade-in_.35s_ease-out_both]" key={`${step}-body`}>
        {step === "level" && <Grid options={LEVELS} value={level} onPick={setLevel} />}
        {step === "goal" && <Grid options={GOALS} value={goal} onPick={setGoal} />}
        {step === "time" && <Grid options={TIMES} value={time} cols={4} onPick={setTime} />}
        {step === "budget" && <Grid options={BUDGETS} value={budget} cols={4} onPick={setBudget} />}
        {step === "shopify" && <Grid options={SHOPIFY} value={shopify} cols={4} onPick={setShopify} />}
        {step === "account" && <QuizAccount onDone={(ok) => (ok ? setLogged(true) : go(afterAccount))} />}
        {step === "market" && <Grid options={MARKETS} value={market} cols={4} onPick={setMarket} />}
        {step === "supply" && <Grid options={SUPPLY} value={supply} cols={4} onPick={setSupply} />}
        {step === "channel" && <Grid options={CHANNELS} value={channel} onPick={setChannel} />}
        {step === "idea" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Card tint={0} icon={Lightbulb} label="Oui, j'ai mon idée" hint="Je l'écris juste en dessous" on={hasIdea === true} onClick={() => setHasIdea(true)} />
              <Card tint={3} icon={Sparkles} label="Pas encore" hint="Propose-moi des produits" on={hasIdea === false} onClick={() => setHasIdea(false)} />
            </div>
            {hasIdea && (
              <div className="rounded-[18px] border border-[#34f0b0]/40 bg-[#34f0b0]/[0.07] p-4 [animation:fade-in_.3s_ease-out_both]">
                <label htmlFor="quiz-idea" className="flex items-center gap-2 text-sm font-semibold text-white"><PenLine className="h-4 w-4 text-[#86efc9]" /> Ton produit</label>
                <input id="quiz-idea" autoFocus value={idea} onChange={(e) => setIdea(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && idea.trim().length >= 3) goNext(); }} placeholder="Ex. : coussin chauffant pour le dos" className="field mt-2" />
              </div>
            )}
          </div>
        )}
        {step === "big" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {BIG_NICHES.map((x, i) => <BigCard key={x.id} tint={i} icon={x.icon} label={x.label} hint={x.hint} on={big === x.id} onClick={() => { if (x.id !== big) { setNiche(null); setProduct(null); } setBig(x.id); }} />)}
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
            {b.subs.map((id, i) => { const x = NICHES.find((y) => y.id === id)!; return <BigCard key={id} tint={i + 2} icon={x.icon} label={x.label} hint={x.products.slice(0, 2).map((p) => p[0]).join(", ") + "…"} on={niche === id} onClick={() => { if (id !== niche) setProduct(null); setNiche(id); }} />; })}
          </div>
        )}
        {step === "product" && n && (
          <div className="grid gap-3 sm:grid-cols-2">
            {n.products.map(([name, brief], i) => <Card key={name} tint={i} row icon={n.icon} label={name} hint={brief} on={product === brief} onClick={() => setProduct(brief)} />)}
          </div>
        )}
        {step === "audience" && <Grid options={AUDIENCES} value={audience} cols={4} onPick={setAudience} />}
        {step === "price" && <Grid options={PRICES} value={price} cols={4} onPick={setPrice} />}
        {step === "style" && !busy && (
          <>
            <p className="-mt-4 mb-4 text-center text-sm text-fg-muted">Un cœur si tu aimes, une croix sinon : ta boutique prendra le style que tu préfères. Ensuite, ton aperçu est gratuit.</p>
            <StyleSwipe big compact onDone={finish} />
          </>
        )}
      </div>

      {error && <p role="alert" className="mt-6 text-center text-sm text-bad">{error}</p>}
      {/* On choisit (la carte s'éclaire en vert), puis « Continuer » : rien ne passe tout seul. */}
      {step !== "style" && step !== "account" && ready[step] && <NextButton onClick={goNext} />}
      {busy && <p className="mt-8 flex items-center justify-center gap-3 text-fg-muted"><Spinner /> Ta boutique se prépare…</p>}
    </div>
  );
}

// Collé en bas de l'écran : sur téléphone, plus besoin de descendre pour continuer.
function NextButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="sticky bottom-3 z-20 mt-8">
    <button type="button" onClick={onClick} className="[animation:rise_.35s_cubic-bezier(.2,.8,.2,1)_both] flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,#34f0b0,#0fae7c)] text-[16px] font-semibold text-[#03140d] shadow-[0_12px_40px_-10px_rgb(46_230_166/0.8),inset_0_1px_0_rgb(255_255_255/0.45)] transition-all hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-40">
      Continuer <ArrowRight className="h-5 w-5" />
    </button>
    </div>
  );
}

function Grid({ options, value, onPick, cols = 3 }: { options: Option[]; value: string | null; onPick: (id: string) => void; cols?: 3 | 4 }) {
  return (
    <div className={cn("grid grid-cols-2 gap-3", cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-4")}>
      {options.map((o, i) => <Card key={o.id} tint={i} icon={o.icon} label={o.label} hint={o.hint} on={value === o.id} onClick={() => onPick(o.id)} />)}
    </div>
  );
}

// Même style pour toutes les cartes : icône noire dans un carré vert LED lumineux.
// Carte choisie : elle s'éclaire en vert (bordure, fond et halo).
const LED = "#3dff9a";
const ON = { borderColor: LED, background: "linear-gradient(160deg, rgb(61 255 154 / .2), rgb(61 255 154 / .07))", boxShadow: "0 0 0 1px rgb(61 255 154 / .9), 0 0 34px -6px rgb(61 255 154 / .75), inset 0 0 24px rgb(61 255 154 / .1)" };
const OFF = { borderColor: "rgb(255 255 255 / .12)", background: "rgb(255 255 255 / .04)" };
const IconBox = ({ icon: I, size }: { icon: Icon; size: "s" | "m" | "l" }) => (
  <span style={{ background: `linear-gradient(160deg, #7dffbd, ${LED} 55%, #19e07c)`, boxShadow: "0 0 18px -2px rgb(61 255 154 / .6), inset 0 1px 0 rgb(255 255 255 / .6)" }}
    className={cn("grid shrink-0 place-items-center text-[#04120b] transition-transform group-hover:scale-105", size === "s" ? "h-11 w-11 rounded-[13px]" : size === "m" ? "h-14 w-14 rounded-[14px]" : "h-16 w-16 rounded-[18px]")}>
    <I className={size === "s" ? "h-5 w-5" : size === "m" ? "h-7 w-7" : "h-8 w-8"} />
  </span>
);
const Tick = () => <span className="absolute right-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-full text-[#04120b] [animation:fade-in_.2s_ease-out_both]" style={{ background: LED }}><Check className="h-3 w-3" /></span>;

// `tint` est gardé pour compatibilité, il n'a plus d'effet : toutes les cartes ont les mêmes couleurs.
function Card({ icon, label, hint, on, row, onClick }: { icon: Icon; label: string; hint?: string; on: boolean; row?: boolean; tint?: number; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} style={on ? ON : OFF}
      className={cn("group relative flex h-full rounded-[18px] border p-4 text-left backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25", row ? "items-center gap-3.5" : "flex-col items-center gap-3 py-6 text-center")}>
      <IconBox icon={icon} size={row ? "s" : "m"} />
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold leading-tight text-white">{label}</span>
        {hint && <span className="mt-1 block text-xs leading-snug text-fg-muted">{hint}</span>}
      </span>
      {on && <Tick />}
    </button>
  );
}

// Grande carte (catégories) : icône plus grande, titre en belle typographie.
function BigCard({ icon, label, hint, on, onClick }: { icon: Icon; label: string; hint: string; on: boolean; tint?: number; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} style={on ? ON : OFF}
      className="group relative flex h-full flex-col items-center gap-3 rounded-[22px] border px-3 py-7 text-center backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-white/25">
      <IconBox icon={icon} size="l" />
      <span className="font-display text-[17px] font-semibold leading-tight tracking-[-0.01em] text-white sm:text-[19px]">{label}</span>
      <span className="text-xs leading-snug text-fg-muted">{hint}</span>
      {on && <Tick />}
    </button>
  );
}

const QUIZ_KEY = "vg-quiz-brief";
export type QuizDraft = { brief: string; mode: "start" | "link"; url?: string };
export function saveQuizBrief(brief: string, extra: { mode?: "start" | "link"; url?: string } = {}) {
  try { localStorage.setItem(QUIZ_KEY, JSON.stringify({ brief, mode: extra.mode ?? "start", url: extra.url } satisfies QuizDraft)); } catch { /* stockage indisponible */ }
}
export function takeQuizDraft(): QuizDraft | null {
  try {
    const b = localStorage.getItem(QUIZ_KEY);
    localStorage.removeItem(QUIZ_KEY);
    if (!b) return null;
    try { const d = JSON.parse(b) as QuizDraft; if (d && typeof d.brief === "string") return d; } catch { /* ancien format : texte seul */ }
    return { brief: b, mode: "start" };
  } catch { return null; }
}
export const takeQuizBrief = () => takeQuizDraft()?.brief ?? null;
