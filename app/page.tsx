import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroPrompt } from "@/components/HeroPrompt";
import { site } from "@/lib/site";

const STEPS = [
  {
    n: "01",
    title: "Décris ton produit",
    text: "Un brief en quelques phrases ou le lien d'une page produit. Pas besoin de toucher aux réglages de Shopify.",
    visual: "« Crée une boutique premium pour ma marque de baumes à lèvres. »",
  },
  {
    n: "02",
    title: "L'IA pose la stratégie et construit",
    text: "Marché, promesse, offres et objections d'achat d'abord. Puis la marque, la page d'accueil, la fiche produit et la FAQ, dans la langue de ton marché.",
    visual: "Stratégie → Marque → Fiche produit → FAQ",
  },
  {
    n: "03",
    title: "Tu vérifies, puis tu publies",
    text: "Relis et ajuste le contenu, puis envoie-le sur ta boutique Shopify en un clic : produit, prix, SEO et page « À propos ».",
    visual: "Boutique Shopify connectée ✓",
  },
];

const FEATURES = [
  { title: "Copywriting qui convertit", text: "Titres, bénéfices, réponses aux objections : écrits pour vendre, pas pour remplir." },
  { title: "Identité de marque", text: "Nom, slogan, ton et palette de couleurs cohérents avec ton positionnement." },
  { title: "SEO inclus", text: "Titre et méta-description optimisés pour chaque fiche produit." },
  { title: "Toutes les langues", text: "Génère ta boutique directement dans la langue de ton marché." },
];

const FAQ = [
  {
    q: "C'est quoi, un créateur de boutique IA ?",
    a: `Un outil qui construit ta boutique en ligne à partir de ce que tu lui dis. Avec ${site.name}, tu décris ton projet ou tu colles le lien d'un produit. L'IA pose d'abord ton marché, ta promesse et tes offres, puis génère le contenu de ta boutique Shopify à partir de ça.`,
  },
  { q: "Ça marche avec Shopify ?", a: "Oui. Le contenu généré est envoyé directement sur ta boutique Shopify via l'API officielle. Tu gardes la propriété de ta boutique et de tes données." },
  { q: "Que génère l'IA exactement ?", a: "La stratégie (marché, promesse, offres, objections), l'identité de marque, les textes de la page d'accueil, la fiche produit complète avec prix conseillé et SEO, une FAQ et une page « À propos »." },
  { q: "Peut-on modifier la boutique après ?", a: "Oui. Le produit est créé en brouillon : tu relis et modifies tout dans Shopify avant de le mettre en ligne." },
  { q: "Dans quelles langues ?", a: "Toutes les langues principales : français, anglais, espagnol, allemand, italien, néerlandais, portugais, etc." },
];

export default function Home() {
  return (
    <>
      <Header />
      <main id="main-content">
        <section className="relative overflow-hidden bg-gradient-to-b from-brand-soft/60 to-white px-4 pb-24 pt-20 text-center">
          <p className="mx-auto w-fit rounded-full border border-brand/20 bg-white px-3 py-1 text-xs font-medium text-brand">
            Bêta ouverte
          </p>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            Crée des boutiques Shopify qui <span className="text-brand">vendent</span>, en 5 min avec l'IA
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-black/60">
            Stratégie, textes, fiche produit, SEO. Décris ton produit : l'IA fait le reste à ta place.
          </p>
          <HeroPrompt />
        </section>

        <section className="px-4 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand">Une révolution</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Plus besoin de passer des heures dans les réglages de Shopify.</h2>
            <p className="mt-4 text-black/60">
              Décris ton produit : l'IA crée une boutique complète à l'image de ta marque, dans la langue de ton marché.
            </p>
          </div>
        </section>

        <section id="comment-ca-marche" className="bg-black/[0.02] px-4 py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-bold sm:text-4xl">Crée ta boutique Shopify en 3 étapes.</h2>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {STEPS.map((s) => (
                <div key={s.n} className="rounded-3xl border border-black/5 bg-white p-6">
                  <div className="rounded-2xl bg-brand-soft/60 p-5 text-sm italic text-brand">{s.visual}</div>
                  <p className="mt-6 text-xs font-semibold text-black/40">Étape {s.n}</p>
                  <h3 className="mt-1 text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-black/60">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-bold sm:text-4xl">Des boutiques pensées pour vendre.</h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f) => (
                <div key={f.title} className="rounded-3xl border border-black/5 p-6">
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-black/60">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="bg-black/[0.02] px-4 py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-3xl font-bold sm:text-4xl">Le créateur de boutique Shopify IA, en questions</h2>
            <div className="mt-10 divide-y divide-black/5 rounded-3xl border border-black/5 bg-white">
              {FAQ.map((item) => (
                <details key={item.q} className="group p-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                    {item.q}
                    <span className="text-black/40 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-black/60">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-24 text-center">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold sm:text-4xl">Crée une boutique Shopify à fort potentiel avec l'IA</h2>
          <p className="mx-auto mt-4 max-w-xl text-black/60">
            Décris ton projet, relis le résultat, publie sur Shopify.
          </p>
          <Link href="/generer" className="mt-8 inline-block rounded-full bg-brand px-8 py-4 font-semibold text-white hover:bg-brand/90">
            Créer ma boutique
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
