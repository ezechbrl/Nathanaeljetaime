"use client";

import { ArrowRight, Check, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Section";
import { cn } from "@/lib/cn";
import type { ShowcaseStore } from "@/lib/content/showcase";
import { StoreFrame } from "./StoreFrame";

type Lang = "fr" | "en" | "es";
type Tone = "premium" | "fun" | "minimal";
type T3 = Record<Lang, string>;

// Aperçu instantané (sans IA) pour montrer le principe ; la vraie génération se fait après l'inscription.
const PRODUCTS = [
  {
    id: "bougies", label: "Bougies", accent: "#c26a3d", name: "Braise", product: { fr: "Bougie Feu de bois", en: "Woodfire Candle", es: "Vela Leña" }, price: { fr: "29 €", en: "$32", es: "29 €" },
    brief: "Bougies parfumées en cire de soja, coulées à la main",
    sub: { fr: "Cire de soja, 50 h de combustion, coulée à la main.", en: "Soy wax, 50-hour burn, hand-poured.", es: "Cera de soja, 50 h de combustión, hecha a mano." },
    head: {
      premium: { fr: "L'odeur d'un soir d'hiver.", en: "The scent of a winter evening.", es: "El aroma de una noche de invierno." },
      fun: { fr: "Allume. Respire. Souris.", en: "Light it. Breathe. Smile.", es: "Enciende. Respira. Sonríe." },
      minimal: { fr: "Une flamme. Cinquante heures.", en: "One flame. Fifty hours.", es: "Una llama. Cincuenta horas." },
    },
    wins: ["Notes olfactives détaillées", "Coffret de 3 senteurs", "Conseils pour une combustion parfaite"],
  },
  {
    id: "sneakers", label: "Sneakers", accent: "#ff4d2e", name: "Kicko", product: { fr: "Kicko Run 2", en: "Kicko Run 2", es: "Kicko Run 2" }, price: { fr: "119 €", en: "$129", es: "119 €" },
    brief: "Sneakers légères en matériaux recyclés pour la ville",
    sub: { fr: "240 g, semelle recyclée, faites pour marcher toute la journée.", en: "240 g, recycled sole, built for all-day walking.", es: "240 g, suela reciclada, para caminar todo el día." },
    head: {
      premium: { fr: "Le confort a enfin du style.", en: "Comfort finally has style.", es: "La comodidad por fin tiene estilo." },
      fun: { fr: "Tes pieds vont t'adorer.", en: "Your feet will thank you.", es: "Tus pies te lo agradecerán." },
      minimal: { fr: "Légères. Recyclées. Partout.", en: "Light. Recycled. Everywhere.", es: "Ligeras. Recicladas. Siempre." },
    },
    wins: ["Guide des tailles avec équivalences", "Échange gratuit de pointure", "Section matériaux recyclés"],
  },
  {
    id: "the", label: "Thé", accent: "#4f7d3a", name: "Feuille", product: { fr: "Coffret Découverte", en: "Discovery Box", es: "Caja Descubrimiento" }, price: { fr: "34 €", en: "$36", es: "34 €" },
    brief: "Thés bio de petits producteurs, en coffret découverte",
    sub: { fr: "6 thés bio de petits jardins, à infuser en 3 minutes.", en: "6 organic teas from small gardens, ready in 3 minutes.", es: "6 tés ecológicos de pequeños jardines, listos en 3 minutos." },
    head: {
      premium: { fr: "Six jardins dans une tasse.", en: "Six gardens in one cup.", es: "Seis jardines en una taza." },
      fun: { fr: "Ta pause préférée commence ici.", en: "Your favourite break starts here.", es: "Tu pausa favorita empieza aquí." },
      minimal: { fr: "Bio. Direct. Infusé.", en: "Organic. Direct. Steeped.", es: "Ecológico. Directo. Infusionado." },
    },
    wins: ["Guide d'infusion par thé", "Abonnement mensuel", "Histoire de chaque producteur"],
  },
  {
    id: "bijoux", label: "Bijoux", accent: "#b08d57", name: "Lueur", product: { fr: "Collier Aube", en: "Dawn Necklace", es: "Collar Alba" }, price: { fr: "59 €", en: "$64", es: "59 €" },
    brief: "Bijoux fins en plaqué or, résistants à l'eau",
    sub: { fr: "Plaqué or 18 carats, résistant à l'eau, garanti 2 ans.", en: "18k gold plated, waterproof, 2-year warranty.", es: "Chapado en oro de 18 k, resistente al agua, 2 años de garantía." },
    head: {
      premium: { fr: "L'éclat qui ne vous quitte plus.", en: "The shine that stays with you.", es: "El brillo que no te deja." },
      fun: { fr: "Brille même sous la douche.", en: "Shine, even in the shower.", es: "Brilla hasta en la ducha." },
      minimal: { fr: "Fin. Doré. Pour toujours.", en: "Fine. Golden. For good.", es: "Fino. Dorado. Para siempre." },
    },
    wins: ["Emballage cadeau en option", "FAQ « ça noircit ? »", "Gravure personnalisée"],
  },
  {
    id: "chiens", label: "Croquettes", accent: "#e3a21a", name: "Gamelle", product: { fr: "Croquettes Saumon", en: "Salmon Kibble", es: "Pienso de Salmón" }, price: { fr: "39 €", en: "$42", es: "39 €" },
    brief: "Croquettes sans céréales pour chiens, livrées chaque mois",
    sub: { fr: "Sans céréales, 70 % de saumon, livrées avant d'en manquer.", en: "Grain-free, 70% salmon, delivered before you run out.", es: "Sin cereales, 70 % salmón, antes de que se acabe." },
    head: {
      premium: { fr: "Ce qu'il mangerait s'il savait lire.", en: "What he'd eat if he could read.", es: "Lo que comería si supiera leer." },
      fun: { fr: "La gamelle la plus vite vidée.", en: "The bowl that empties fastest.", es: "El cuenco que se vacía más rápido." },
      minimal: { fr: "Saumon. Sans céréales. Chaque mois.", en: "Salmon. Grain-free. Monthly.", es: "Salmón. Sin cereales. Cada mes." },
    },
    wins: ["Calcul de la ration selon le poids", "Abonnement sans engagement", "Transition alimentaire expliquée"],
  },
];

const TONES: { id: Tone; label: string }[] = [
  { id: "premium", label: "Haut de gamme" },
  { id: "fun", label: "Joyeux" },
  { id: "minimal", label: "Minimaliste" },
];
const LANGS: { id: Lang; label: string; fr: string }[] = [
  { id: "fr", label: "Français", fr: "français" },
  { id: "en", label: "English", fr: "anglais" },
  { id: "es", label: "Español", fr: "espagnol" },
];

function mix(hex: string, to: string, k: number) {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [a, b] = [p(hex), p(to)];
  return `#${a.map((v, i) => Math.round(v + (b[i] - v) * k).toString(16).padStart(2, "0")).join("")}`;
}

function buildStore(pi: number, tone: Tone, lang: Lang): ShowcaseStore {
  const P = PRODUCTS[pi];
  const a = P.accent;
  const palette =
    tone === "premium" ? { bg: mix(a, "#000000", 0.82), ink: mix(a, "#ffffff", 0.9), accent: mix(a, "#ffffff", 0.15), soft: mix(a, "#000000", 0.6) }
    : tone === "fun" ? { bg: mix(a, "#ffffff", 0.82), ink: mix(a, "#000000", 0.75), accent: a, soft: mix(a, "#ffffff", 0.55) }
    : { bg: "#f6f6f4", ink: "#161616", accent: mix(a, "#000000", 0.2), soft: "#e6e5e1" };
  return {
    slug: P.name.toLowerCase(), name: P.name, category: P.label, language: LANGS.find((l) => l.id === lang)!.fr, brief: P.brief,
    headline: P.head[tone][lang], sub: P.sub[lang], product: P.product[lang], price: P.price[lang], palette,
    font: tone === "premium" ? "serif" : "sans", layout: tone === "premium" ? "center" : tone === "fun" ? "split" : "grid", highlights: P.wins,
  };
}

function Chips<T extends string>({ label, items, value, onChange }: { label: string; items: { id: T; label: string; color?: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <fieldset>
      <legend className="text-sm text-fg-faint">{label}</legend>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            aria-pressed={value === it.id}
            onClick={() => onChange(it.id)}
            className={cn("flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-all duration-200", value === it.id ? "border-accent/50 bg-accent-deep/50 text-fg" : "border-white/10 text-fg-muted hover:border-white/25 hover:text-fg")}
          >
            {it.color && <span className="h-2.5 w-2.5 rounded-full" style={{ background: it.color }} />}
            {it.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function Playground() {
  const [product, setProduct] = useState(PRODUCTS[0].id);
  const [tone, setTone] = useState<Tone>("premium");
  const [lang, setLang] = useState<Lang>("fr");
  const [busy, setBusy] = useState(false);
  const pi = PRODUCTS.findIndex((p) => p.id === product);
  const store = useMemo(() => buildStore(pi, tone, lang), [pi, tone, lang]);

  useEffect(() => {
    setBusy(true);
    const t = setTimeout(() => setBusy(false), 450);
    return () => clearTimeout(t);
  }, [pi, tone, lang]);

  const brief = `${PRODUCTS[pi].brief}, ton ${TONES.find((t) => t.id === tone)!.label.toLowerCase()}, boutique en ${LANGS.find((l) => l.id === lang)!.fr}`;

  return (
    <section className="py-24">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <Reveal as="h2" className="text-h2">Essaie, <span className="serif-accent">sans t'inscrire</span>.</Reveal>
            <Reveal delay={60} as="p" className="mt-4 max-w-md text-[17px] leading-relaxed text-fg-muted">Choisis un produit, un ton et une langue : regarde la vitrine changer. L'IA fait la même chose avec ton vrai produit, en beaucoup plus complet.</Reveal>
            <Reveal delay={120} className="mt-8 space-y-6">
              <Chips label="1. Ton produit" items={PRODUCTS.map((p) => ({ id: p.id, label: p.label, color: p.accent }))} value={product} onChange={setProduct} />
              <Chips label="2. Le ton" items={TONES} value={tone} onChange={setTone} />
              <Chips label="3. La langue du marché" items={LANGS} value={lang} onChange={setLang} />
            </Reveal>
            <Reveal delay={180} className="mt-9">
              <ButtonLink href={`/inscription?mode=start&brief=${encodeURIComponent(brief)}`} size="lg">Générer la vraie boutique <ArrowRight className="h-4 w-4" /></ButtonLink>
            </Reveal>
          </div>

          <Reveal delay={100} className="relative">
            <div aria-hidden className="absolute -inset-10 rounded-[40px] opacity-50 blur-3xl transition-[background] duration-700" style={{ background: `radial-gradient(closest-side, ${store.palette.accent}88, transparent)` }} />
            <div className={cn("relative transition-[opacity,filter,transform] duration-300", busy ? "scale-[0.99] opacity-60 blur-[2px]" : "opacity-100")}>
              <StoreFrame s={store} />
            </div>
            <div className="relative mt-10 flex flex-wrap items-center gap-2 text-sm">
              <span className="flex items-center gap-1.5 text-fg-faint">
                {busy ? <Sparkles className="h-4 w-4 animate-pulse text-accent" /> : <Check className="h-4 w-4 text-accent" />}
                {busy ? "L'IA réécrit…" : "Prêt :"}
              </span>
              {store.highlights.map((h) => <span key={h} className="rounded-full border border-white/[0.08] px-3 py-1 text-fg-muted">{h}</span>)}
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
