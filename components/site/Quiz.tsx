"use client";

// Quiz partagé : page publique /quiz (avant le compte) et /app/quiz (dans l'espace client).
// Profil (où il en est, objectif, temps), puis son idée ou une grande catégorie → un univers → un produit,
// ses clients, et enfin les boutiques qu'il aime (cœur / croix) pour choisir le style.
// Toujours un nombre pair de réponses, pour des grilles bien alignées sur téléphone.
import { Banknote, BadgeCheck, BookOpen, Glasses, HandCoins, Languages, Map as MapIcon, Scissors, UserPlus, ArrowLeft, ArrowRight, Baby, BadgeEuro, Camera, CircleHelp, Coins, Crown, Factory, Globe, Hammer, Landmark, MapPin, Megaphone, MessageCircle, Package, PiggyBank, Search, ShoppingBag, Truck, Video, Wallet, Bike, Check, Clock, Compass, Flame, Gem, GraduationCap, Home, Hourglass, Lightbulb, Palette, PawPrint, PenLine, Rocket, Shuffle, Sparkles, Sprout, Store, Target, Timer, TrendingUp, User, UserRound, Users, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { normalizeProductUrl } from "@/lib/product-url";
import * as api from "@/lib/api/client";
import { QuizAccount } from "./QuizAccount";
import { BIG_NICHES, NICHES } from "@/lib/niches";
import { STYLE_TEXT } from "./StyleSwipe";

type Icon = React.ComponentType<{ className?: string }>;
type Option = { id: string; label: string; hint?: string; icon: Icon };

// Emoji en couleur dans chaque case (plus vivant et plus rapide à lire que des pictos au trait).
const EMOJI: Record<string, string> = {
  debut: "🌱", apprendre: "🎓", essai: "🧭", ailleurs: "🛍️", boutique: "📈", createur: "🎨",
  complement: "💶", activite: "🚀", tester: "💡", marque: "💎", creations: "✂️", maison: "🏠",
  b1: "🪙", b2: "🐷", b3: "💵", b4: "🏦", s1: "✅", s2: "🛒", s3: "🆕", s4: "🤔",
  fr: "🇫🇷", be: "🇧🇪", eu: "🇪🇺", world: "🌍", drop: "🚚", stock: "📦", make: "🔨", brand: "🏭",
  tiktok: "🎵", insta: "📸", ads: "📣", google: "🔎", word: "💬", unknown: "🤷",
  p1: "🎁", p2: "👛", p3: "💳", p4: "👑",
  femmes: "👩", hommes: "👨", jeunes: "⚡", parents: "👶", sportifs: "🚴", animaux: "🐶", seniors: "👓", tous: "👥",
  beaute: "✨", cuisine: "🍳", tech: "🎧", auto: "🚗", mode: "💍", jardin: "🌳", gaming: "🎮", voyage: "🧳", bebe: "🍼", sport: "🏋️",
  famille: "🐾", evasion: "🗺️", "1": "⏱️", "2": "⏳", "3": "🔥", "4": "💪",
};

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

type Step = "level" | "goal" | "income" | "time" | "budget" | "shopify" | "idea" | "big" | "sub" | "product" | "account" | "audience" | "market" | "supply" | "channel" | "price" | "style";
const STATE_KEY = "vg-quiz-state2";

// `preset` : la description ou le lien déjà donnés sur l'accueil. Le quiz ne redemande pas le produit.
// `demo` : version courte pour les vidéos (quelques questions, rien n'est gardé ni compté dans les stats).
export function Quiz({ onFinish, skipHref, preset, demo = false }: { onFinish: (brief: string, draft?: QuizDraft) => Promise<void>; skipHref?: string; preset?: { text: string; isLink: boolean }; demo?: boolean }) {
  const [history, setHistory] = useState<Step[]>([demo ? "goal" : "income"]);
  const step = history[history.length - 1];
  const [level, setLevel] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [hasIdea, setHasIdea] = useState<boolean | null>(preset ? true : demo ? false : null);
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
  // Objectif de revenu (curseur) et lien du fournisseur trouvé pendant le quiz (facultatif).
  const [income, setIncome] = useState(2000);
  const [supplierUrl, setSupplierUrl] = useState("");
  // Compte : déjà connecté (pas d'étape compte) ou pas. null tant qu'on ne sait pas.
  const [logged, setLogged] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const b = BIG_NICHES.find((x) => x.id === big);
  const n = NICHES.find((x) => x.id === niche);

  // Ordre revu le 26 nov. 2026 d'après les abandons : d'abord le plus excitant (combien gagner, quoi vendre),
  // puis le compte une fois le produit choisi, et seulement ensuite les questions de profil.
  // 13 questions sans idée (10 avec son idée, 9 avec un lien ou une description de l'accueil).
  const head: Step[] = demo ? ["income", "goal"] : ["income"];
  const ideaStep: Step[] = preset || demo ? [] : ["idea"];
  const productSteps: Step[] = preset || hasIdea ? [] : ["big", "sub", "product"];
  const profile: Step[] = demo ? [] : ["level", "budget", "shopify"];
  const tail: Step[] = demo ? ["channel"] : ["audience", "market", "supply", "channel", "price"];
  const plan: Step[] = [...head, ...ideaStep, ...productSteps, ...(logged ? [] : ["account" as Step]), ...profile, ...tail];
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
      const raw = demo ? null : localStorage.getItem(STATE_KEY);
      const st = raw ? JSON.parse(raw) : null;
      if (st && Date.now() - st.t < 3 * 3600_000 && (st.preset ?? "") === (preset?.text ?? "") && Array.isArray(st.history) && st.history.length > 1) {
        setLevel(st.level); setGoal(st.goal); setTime(st.time); setBudget(st.budget); setShopify(st.shopify);
        setHasIdea(st.hasIdea); setIdea(st.idea ?? ""); setBig(st.big); setNiche(st.niche); setProduct(st.product);
        if (typeof st.income === "number") setIncome(st.income); if (typeof st.supplierUrl === "string") setSupplierUrl(st.supplierUrl); setAudience(st.audience); setMarket(st.market); setSupply(st.supply); setChannel(st.channel); setPrice(st.price);
        setHistory(st.history);
      }
    } catch { /* stockage indisponible */ }
    restored.current = true;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!restored.current || demo) return;
    try { localStorage.setItem(STATE_KEY, JSON.stringify({ t: Date.now(), preset: preset?.text ?? "", history, level, goal, time, budget, shopify, hasIdea, idea, big, niche, product, audience, market, supply, channel, price, income, supplierUrl })); } catch { /* stockage indisponible */ }
  }, [history, level, goal, time, budget, shopify, hasIdea, idea, big, niche, product, audience, market, supply, channel, price, income, supplierUrl, preset?.text]);
  // Connecté pendant l'étape compte (ou déjà connecté en y arrivant) : on passe à la suite.
  const afterAccount: Step = plan[plan.indexOf("account") + 1] ?? "level";
  useEffect(() => { if (step === "account" && logged) setHistory((h) => [...h.slice(0, -1), afterAccount]); }, [step, logged, afterAccount]);
  const back = () => setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
  const productName = (hasIdea ? idea.trim() : n?.products.find((p) => p[1] === product)?.[0] ?? "").slice(0, 60);
  const supplierOk = /^https?:\/\/\S+\.\S+/.test(supplierUrl.trim());
  const chosen = preset?.isLink ? "Produit du lien fourni" : hasIdea ? idea.trim() : product;

  // Suivi anonyme (Ventes) : jusqu'à quelle question le visiteur va, et s'il finit le quiz.
  const run = useRef("");
  const track = (s: Step | "fin", i: number, done = false) => {
    if (demo) return;
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
    if (!chosen || (!audience && !demo)) return;
    const brief = [`${chosen.replace(/[.\s]+$/, "")}.`, audience ? `Pour ${AUDIENCE_TEXT[audience]}.` : "", price ? PRICE_TEXT[price] : "", market ? MARKET_TEXT[market] : "", supply ? SUPPLY_TEXT[supply] : "", channel ? CHANNEL_TEXT[channel] : "", level ? LEVEL_TEXT[level] : "", shopify ? SHOPIFY_TEXT[shopify] : "", budget ? BUDGET_TEXT[budget] : "", `Objectif du vendeur : environ ${income.toLocaleString("fr-FR")} € par mois.`, style ? STYLE_TEXT[style] : ""].filter(Boolean).join(" ");
    setBusy(true);
    setError("");
    track("fin", plan.length, true);
    try {
      try { localStorage.removeItem(STATE_KEY); } catch { /* stockage indisponible */ }
      const link = supplierOk ? normalizeProductUrl(supplierUrl.trim()) : "";
      await onFinish(brief, link ? { brief, mode: "link", url: link } : undefined);
    } catch (e) {
      setBusy(false);
      setError((e as Error).message || "Une erreur est survenue. Réessaie.");
    }
  }

  // Question suivante pour chaque étape, une fois la réponse choisie.
  const ready: Record<Exclude<Step, "style" | "account">, boolean> = {
    level: !!level, goal: !!goal, income: true, time: !!time, budget: !!budget, shopify: !!shopify,
    idea: hasIdea === false || (hasIdea === true && idea.trim().length >= 3),
    big: !!big, sub: !!niche, product: !!product,
    audience: !!audience, market: !!market, supply: !!supply, channel: !!channel, price: !!price,
  };

  const titles: Record<Step, React.ReactNode> = {
    level: <>Où en es-tu en <span className="serif-accent">e-commerce</span> ou en <span className="serif-accent">dropshipping</span> ?</>,
    goal: <>Quel est ton <span className="mark-green">objectif</span> ?</>,
    income: <>Combien tu veux <span className="serif-accent">gagner</span> par mois ?</>,
    time: <>Combien de <span className="serif-accent">temps</span> peux-tu y consacrer ?</>,
    budget: <>Quel <span className="mark-green">budget</span> pour te lancer ?</>,
    shopify: <>Tu as déjà un compte <span className="serif-accent">Shopify</span> ?</>,
    account: <>Super choix ! Crée ton <span className="serif-accent">compte</span> pour voir ta boutique</>,
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
        {plan.map((s, i) => <span key={s} className={cn("h-1.5 flex-1 rounded-full transition-colors duration-500", i <= index ? "bg-[#3dff9a]" : "bg-white/10")} />)}
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-fg-muted">
        {history.length > 1
          ? <button type="button" onClick={back} className="inline-flex items-center gap-1.5 hover:text-white"><ArrowLeft className="h-4 w-4" /> Retour</button>
          : skipHref ? <a href={skipHref} className="underline underline-offset-4 hover:text-white">J'ai déjà mon produit</a> : <span />}
        <span>{step === "account" ? "Ton compte" : questions.length - qIndex <= 3 ? (questions.length - qIndex === 1 ? "Dernière question 🎉" : `Plus que ${questions.length - qIndex} questions 🔥`) : `Question ${qIndex + 1} sur ${questions.length}`}</span>
      </div>

      {step === plan[0] && !demo && (
        <p className="mx-auto mt-5 flex w-fit flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13px] text-white/70">
          <span>⏱ 2 minutes</span><span>🎁 100 % gratuit</span><span className="text-[#3dff9a]">✨ Ton aperçu de boutique à la fin</span>
        </p>
      )}
      {preset && step === plan[0] && (
        <p className="mx-auto mt-5 w-fit max-w-full truncate rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-center text-[13px] text-white/80">
          ✓ {preset.isLink ? "Ton lien produit est gardé" : `Ton idée est gardée : « ${preset.text.slice(0, 60)}${preset.text.length > 60 ? "…" : ""} »`}. Quelques questions pour faire ta boutique sur mesure.
        </p>
      )}
      <h1 key={step} className="mt-6 text-center text-[clamp(1.7rem,1.2rem+1.8vw,2.5rem)] font-semibold leading-tight tracking-[-0.03em] [animation:rise_.45s_cubic-bezier(.2,.8,.2,1)_both]">{titles[step]}</h1>

      <div className="mt-8 [animation:fade-in_.35s_ease-out_both]" key={`${step}-body`}>
        {step === "level" && <Grid options={LEVELS} value={level} onPick={setLevel} />}
        {step === "goal" && <Grid options={GOALS} value={goal} onPick={setGoal} />}
        {step === "income" && <IncomeSlider value={income} onChange={setIncome} />}
        {step === "time" && <Grid options={TIMES} value={time} cols={4} onPick={setTime} />}
        {step === "budget" && <Grid options={BUDGETS} value={budget} cols={4} onPick={setBudget} />}
        {step === "shopify" && <Grid options={SHOPIFY} value={shopify} cols={4} onPick={setShopify} />}
        {step === "account" && <QuizAccount onDone={(ok) => (ok ? setLogged(true) : go(afterAccount))} />}
        {step === "market" && <Grid options={MARKETS} value={market} cols={4} onPick={setMarket} />}
        {step === "supply" && (
          <div className="space-y-4">
            <Grid options={SUPPLY} value={supply} cols={4} onPick={setSupply} />
            {(supply === "drop" || supply === "brand") && !preset?.isLink && (
              <SupplierFinder keyword={productName} brand={supply === "brand"} url={supplierUrl} onUrl={setSupplierUrl} ok={supplierOk} />
            )}
          </div>
        )}
        {step === "channel" && <Grid options={CHANNELS} value={channel} onPick={setChannel} />}
        {step === "idea" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Card tint={0} icon={Lightbulb} emoji="💡" label="Oui, j'ai mon idée" hint="Je l'écris juste en dessous" on={hasIdea === true} onClick={() => setHasIdea(true)} />
              <Card tint={3} icon={Sparkles} emoji="✨" label="Pas encore" hint="Propose-moi des produits" on={hasIdea === false} onClick={() => setHasIdea(false)} />
            </div>
            {hasIdea && (
              <div className="rounded-[18px] border border-white/15 bg-white/[0.05] p-4 [animation:fade-in_.3s_ease-out_both]">
                <label htmlFor="quiz-idea" className="flex items-center gap-2 text-sm font-semibold text-white"><PenLine className="h-4 w-4 text-white/70" /> Ton produit</label>
                <input id="quiz-idea" autoFocus value={idea} onChange={(e) => setIdea(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && idea.trim().length >= 3) goNext(); }} placeholder="Ex. : coussin chauffant pour le dos" className="field mt-2" />
              </div>
            )}
          </div>
        )}
        {step === "big" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {BIG_NICHES.map((x, i) => <BigCard key={x.id} tint={i} icon={x.icon} emoji={EMOJI[x.id]} label={x.label} hint={x.hint} on={big === x.id} onClick={() => { if (x.id !== big) { setNiche(null); setProduct(null); } setBig(x.id); }} />)}
            </div>
            {/* « Surprends-moi » en grand, sous toutes les catégories. */}
            <button type="button" onClick={() => { const r = NICHES[Math.floor(Math.random() * NICHES.length)]; setBig(BIG_NICHES.find((x) => (x.subs as readonly string[]).includes(r.id))?.id ?? null); setNiche(r.id); setProduct(null); setHistory((h) => [...h, "sub", "product"]); }}
              className="flex w-full items-center justify-center gap-3 rounded-[18px] border border-dashed border-white/15 bg-[linear-gradient(110deg,rgb(255_255_255/0.1),rgb(45_212_191/0.06))] p-5 text-white transition-all hover:-translate-y-0.5 hover:border-white/15">
              <span className="grid h-11 w-11 place-items-center rounded-[13px] bg-white glow-hover text-[#03140d]"><Shuffle className="h-5 w-5" /></span>
              <span className="text-left"><span className="block text-[16px] font-semibold">Surprends-moi</span><span className="block text-xs text-fg-muted">On choisit un univers pour toi</span></span>
            </button>
          </div>
        )}
        {step === "sub" && b && (
          <div className="grid grid-cols-2 gap-3">
            {b.subs.map((id, i) => { const x = NICHES.find((y) => y.id === id)!; return <BigCard key={id} tint={i + 2} icon={x.icon} emoji={EMOJI[id]} label={x.label} hint={x.products.slice(0, 2).map((p) => p[0]).join(", ") + "…"} on={niche === id} onClick={() => { if (id !== niche) setProduct(null); setNiche(id); }} />; })}
          </div>
        )}
        {step === "product" && n && (
          <div className="grid gap-3 sm:grid-cols-2">
            {n.products.map(([name, brief], i) => <Card key={name} tint={i} row icon={n.icon} emoji={EMOJI[n.id]} label={name} hint={brief} on={product === brief} onClick={() => setProduct(brief)} />)}
          </div>
        )}
        {step === "audience" && <Grid options={AUDIENCES} value={audience} cols={4} onPick={setAudience} />}
        {step === "price" && <Grid options={PRICES} value={price} cols={4} onPick={setPrice} />}
      </div>

      {error && <p role="alert" className="mt-6 text-center text-sm text-bad">{error}</p>}
      {/* On choisit (la carte s'éclaire en vert), puis « Continuer » : rien ne passe tout seul. */}
      {step !== "style" && step !== "account" && ready[step] && !busy && (step === plan[plan.length - 1]
        ? <NextButton label="Créer ma boutique" onClick={() => finish(null)} />
        : <NextButton onClick={goNext} />)}
      {busy && <p className="mt-8 flex items-center justify-center gap-3 text-fg-muted"><Spinner /> Ta boutique se prépare…</p>}
    </div>
  );
}

// Objectif de revenu : un curseur de 500 € à 30 000 € par mois, et le nombre de ventes que ça représente.
// Calcul indicatif (bénéfice moyen supposé par vente), jamais présenté comme une promesse.
const PROFIT_PER_SALE = 100;
function IncomeSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const sales = Math.ceil(value / PROFIT_PER_SALE);
  const perDay = Math.round((sales / 30) * 10) / 10;
  return (
    <div className="mx-auto max-w-[560px] rounded-[22px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
      <p className="text-[clamp(2.8rem,2rem+3vw,4rem)] font-semibold leading-none tracking-[-0.04em] tabular-nums">{value.toLocaleString("fr-FR")} €</p>
      <p className="mt-1 text-fg-muted">par mois</p>
      <input type="range" min={500} max={30000} step={500} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-label="Revenu visé par mois"
        className="mt-7 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-[#3dff9a] [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#3dff9a] [&::-webkit-slider-thumb]:shadow-[0_0_18px_rgb(61_255_154/0.7)] [&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#3dff9a]" />
      <div className="mt-2 flex justify-between text-sm text-fg-faint"><span>500 €</span><span>30 000 €</span></div>
      <div className="my-6 h-px bg-white/10" />
      <p className="text-[17px] leading-snug">Avec environ {PROFIT_PER_SALE} € de bénéfice par vente, il te faut <span className="font-semibold text-[#3dff9a]">{sales.toLocaleString("fr-FR")} ventes</span> par mois, soit à peu près <span className="font-semibold text-white">{perDay < 1 ? "moins d'une" : perDay.toLocaleString("fr-FR")} par jour</span>.</p>
      <p className="mt-2 text-xs text-fg-faint">C'est ton objectif, pas une promesse : tout dépend de ton produit, de ton prix et de ta pub.</p>
    </div>
  );
}

// Trouver un fournisseur pendant le quiz : recherche du produit chez les fournisseurs, puis le lien collé
// relie la boutique à ce produit (photos, avis et prix importés depuis ce lien).
function SupplierFinder({ keyword, brand, url, onUrl, ok }: { keyword: string; brand: boolean; url: string; onUrl: (v: string) => void; ok: boolean }) {
  const q = encodeURIComponent(keyword || "produit tendance");
  const links = brand
    ? [{ name: "Alibaba (fabricants)", href: `https://www.alibaba.com/trade/search?SearchText=${q}` }, { name: "AliExpress", href: `https://www.aliexpress.com/wholesale?SearchText=${q}` }]
    : [{ name: "AliExpress", href: `https://www.aliexpress.com/wholesale?SearchText=${q}` }, { name: "Alibaba", href: `https://www.alibaba.com/trade/search?SearchText=${q}` }];
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5 [animation:fade-in_.3s_ease-out_both]">
      <p className="flex items-center gap-2 text-[16px] font-semibold"><Search className="h-4 w-4 text-[#3dff9a]" /> {brand ? "Trouve un fabricant pour ta marque" : "Trouve ton fournisseur"}</p>
      <p className="mt-1 text-sm text-fg-muted">{keyword ? <>On cherche « {keyword} » pour toi. </> : null}Ouvre une recherche, choisis un produit bien noté, puis colle son lien ici : ta boutique sera reliée à ce produit (photos, avis et prix).</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {links.map((l) => <a key={l.name} href={l.href} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-1.5 rounded-full border border-white/20 px-4 text-sm font-medium hover:border-[#3dff9a] hover:text-[#3dff9a]">Chercher sur {l.name} <ArrowRight className="h-3.5 w-3.5 -rotate-45" /></a>)}
      </div>
      <label htmlFor="quiz-supplier" className="mt-4 block text-sm font-semibold">Lien du produit chez ton fournisseur <span className="font-normal text-fg-faint">(facultatif)</span></label>
      <input id="quiz-supplier" type="url" inputMode="url" value={url} onChange={(e) => onUrl(e.target.value)} placeholder="https://fr.aliexpress.com/item/…" className="field mt-2" />
      {ok && <p className="mt-2 flex items-center gap-1.5 text-sm text-[#3dff9a]"><Check className="h-4 w-4" /> Fournisseur relié : ta boutique partira de ce produit.</p>}
    </div>
  );
}

// Collé en bas de l'écran : sur téléphone, plus besoin de descendre pour continuer.
function NextButton({ onClick, label = "Continuer" }: { onClick: () => void; label?: string }) {
  return (
    <div className="sticky bottom-3 z-20 mt-8">
    <button type="button" onClick={onClick} className="[animation:rise_.35s_cubic-bezier(.2,.8,.2,1)_both] flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,#14b886,#00876a)] glow-hover text-[16px] font-semibold text-white transition-all hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-40">
      {label} <ArrowRight className="h-5 w-5" />
    </button>
    </div>
  );
}

function Grid({ options, value, onPick, cols = 3 }: { options: Option[]; value: string | null; onPick: (id: string) => void; cols?: 3 | 4 }) {
  return (
    <div className={cn("grid grid-cols-2 gap-3", cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-4")}>
      {options.map((o, i) => <Card key={o.id} tint={i} icon={o.icon} emoji={EMOJI[o.id]} label={o.label} hint={o.hint} on={value === o.id} onClick={() => onPick(o.id)} />)}
    </div>
  );
}

// Même style pour toutes les cartes : icône noire dans un carré vert LED lumineux.
// Carte choisie : elle s'éclaire en vert (bordure, fond et halo).
const LED = "#3dff9a";
const ON = { borderColor: LED, background: "rgb(61 255 154 / .06)", boxShadow: "0 0 0 1px rgb(61 255 154 / .9), 0 0 30px -8px rgb(61 255 154 / .6)" };
const OFF = { borderColor: "rgb(255 255 255 / .12)", background: "rgb(255 255 255 / .025)" };
// Icône noire (trait blanc) ; une fois la réponse choisie, la case devient vert électrique.
const IconBox = ({ icon: I, emoji, size, on = false }: { icon: Icon; emoji?: string; size: "s" | "m" | "l"; on?: boolean }) => (
  <span style={on ? { background: emoji ? "rgb(61 255 154 / .22)" : LED, boxShadow: "0 0 0 2px #3dff9a, 0 0 22px -2px rgb(61 255 154 / .7)" } : { background: emoji ? "rgb(255 255 255 / .07)" : "#0a0a0a", boxShadow: "inset 0 0 0 1px rgb(255 255 255 / .14)" }}
    className={cn("grid shrink-0 place-items-center transition-all duration-200 group-hover:scale-105", on ? "text-black" : "text-white", size === "s" ? "h-11 w-11 rounded-[13px]" : size === "m" ? "h-14 w-14 rounded-[14px]" : "h-16 w-16 rounded-[18px]")}>
    {emoji
      ? <span aria-hidden className={cn("leading-none transition-transform duration-200", on && "scale-110", size === "s" ? "text-[22px]" : size === "m" ? "text-[30px]" : "text-[36px]")}>{emoji}</span>
      : <I className={size === "s" ? "h-5 w-5" : size === "m" ? "h-7 w-7" : "h-8 w-8"} />}
  </span>
);
const Tick = () => <span className="absolute right-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-full text-[#04120b] [animation:fade-in_.2s_ease-out_both]" style={{ background: LED }}><Check className="h-3 w-3" /></span>;

// `tint` est gardé pour compatibilité, il n'a plus d'effet : toutes les cartes ont les mêmes couleurs.
function Card({ icon, emoji, label, hint, on, row, onClick }: { icon: Icon; emoji?: string; label: string; hint?: string; on: boolean; row?: boolean; tint?: number; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} style={on ? ON : OFF}
      className={cn("group relative flex h-full rounded-[18px] border p-4 text-left backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25", row ? "items-center gap-3.5" : "flex-col items-center gap-3 py-6 text-center")}>
      <IconBox icon={icon} emoji={emoji} size={row ? "s" : "m"} on={on} />
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold leading-tight text-white">{label}</span>
        {hint && <span className="mt-1 block text-xs leading-snug text-fg-muted">{hint}</span>}
      </span>
      {on && <Tick />}
    </button>
  );
}

// Grande carte (catégories) : icône plus grande, titre en belle typographie.
function BigCard({ icon, emoji, label, hint, on, onClick }: { icon: Icon; emoji?: string; label: string; hint: string; on: boolean; tint?: number; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} style={on ? ON : OFF}
      className="group relative flex h-full flex-col items-center gap-3 rounded-[22px] border px-3 py-7 text-center backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-white/25">
      <IconBox icon={icon} emoji={emoji} size="l" on={on} />
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
