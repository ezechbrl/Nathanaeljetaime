import Link from "next/link";
import { HeroPrompt } from "@/components/HeroPrompt";
import { Faq } from "@/components/landing/Faq";
import { FinalCta } from "@/components/landing/FinalCta";
import { Showcase } from "@/components/landing/Showcase";
import { Steps } from "@/components/landing/Steps";
import { MarketingShell } from "@/components/MarketingShell";

const HIGHLIGHTS = [
  { value: "5 min", label: "pour une boutique complète" },
  { value: "30+", label: "langues disponibles" },
  { value: "0", label: "ligne de code à écrire" },
];

const FEATURES = [
  { icon: "✍️", title: "Copywriting qui convertit", text: "Titres, bénéfices, réponses aux objections : écrits pour vendre, pas pour remplir." },
  { icon: "🎨", title: "Identité de marque", text: "Nom, slogan, ton et palette de couleurs cohérents avec ton positionnement." },
  { icon: "🔎", title: "SEO inclus", text: "Titre et méta-description optimisés pour chaque fiche produit." },
  { icon: "💬", title: "Édition par chat", text: "« Rends le ton plus premium », « ajoute un bundle » : l'IA applique." },
  { icon: "📈", title: "Optimisation continue", text: "Des recommandations chaque jour pour faire monter ton taux de conversion." },
  { icon: "🌍", title: "Toutes les langues", text: "Génère ta boutique directement dans la langue de ton marché." },
];

export default function Home() {
  return (
    <MarketingShell>
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-soft/70 via-white to-white px-4 pb-20 pt-16 text-center sm:pt-24">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl" />
        <div className="relative animate-rise">
          <p className="mx-auto w-fit rounded-full border border-brand/20 bg-white px-3 py-1 text-xs font-medium text-brand">
            ✨ Bêta ouverte : ta première boutique est offerte
          </p>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            Crée des boutiques Shopify qui <span className="text-brand">vendent</span>, en 5 min avec l'IA
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-black/60">
            Les meilleurs textes, structures et offres, inspirés des boutiques qui vendent le plus. L'IA fait tout à ta place.
          </p>
          <HeroPrompt />
          <ul className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-4">
            {HIGHLIGHTS.map((h) => (
              <li key={h.label}>
                <p className="text-2xl font-bold sm:text-3xl">{h.value}</p>
                <p className="mt-1 text-xs text-black/50 sm:text-sm">{h.label}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Showcase />

      <section className="px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">Une révolution</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Plus besoin de toucher aux paramètres compliqués de Shopify pendant des heures.</h2>
          <p className="mt-4 text-black/60">
            Décris ton produit : l'IA crée une boutique complète à l'image de ta marque, dans toutes les langues.
          </p>
        </div>
      </section>

      <Steps />

      <section className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold sm:text-4xl">Tout ce qu'il faut pour vendre.</h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-3xl border border-black/5 p-6 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/5">
                <span className="text-2xl">{f.icon}</span>
                <h3 className="mt-3 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-black/60">{f.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/produit" className="text-sm font-semibold text-brand hover:underline">Découvrir toutes les fonctionnalités →</Link>
          </div>
        </div>
      </section>

      <Faq />
      <FinalCta />
    </MarketingShell>
  );
}
