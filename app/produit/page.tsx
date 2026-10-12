import Link from "next/link";
import { FinalCta } from "@/components/landing/FinalCta";
import { MarketingShell, PageHero } from "@/components/MarketingShell";
import { site } from "@/lib/site";

export const metadata = { title: `Produit — ${site.name}` };

const BLOCKS = [
  {
    eyebrow: "Création",
    title: "Une boutique complète à partir d'un brief",
    text: "Décris ton produit en quelques phrases. L'IA pose ta stratégie (marché, promesse, offres, objections), puis génère la marque, la page d'accueil, les fiches produits, la FAQ et les pages légales de base.",
    points: ["Stratégie marketing avant le design", "Copywriting orienté conversion", "Palette et ton de marque cohérents"],
  },
  {
    eyebrow: "Depuis un lien",
    title: "Colle le lien d'un produit, on s'occupe du reste",
    text: "Fournisseur, marketplace ou concurrent : l'IA lit la page, en extrait les caractéristiques et réécrit une fiche produit unique, adaptée à ton marché.",
    points: ["Extraction des caractéristiques", "Réécriture originale (pas de copier-coller)", "Prix conseillé et prix barré"],
  },
  {
    eyebrow: "Refonte",
    title: "Tu as déjà une boutique ? On la remet à niveau",
    text: "Connecte ta boutique Shopify existante : l'IA analyse tes pages, détecte ce qui freine la vente et propose une refonte des textes et de la structure.",
    points: ["Audit de conversion", "Réécriture des fiches existantes", "Aucune perte de données"],
  },
  {
    eyebrow: "Pilotage",
    title: "Un expert e-commerce qui travaille chaque jour",
    text: "L'IA suit tes performances et te propose des optimisations concrètes : titres, offres, réassurance, FAQ. Tu valides en un clic.",
    points: ["Recommandations quotidiennes", "Tests d'offres et de bundles", "Explications claires, sans jargon"],
  },
];

export default function ProductPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Produit"
        title="Tout ce qu'il faut pour lancer une boutique qui vend"
        subtitle="De l'idée à la boutique Shopify publiée, puis optimisée chaque jour."
      />
      <div className="mx-auto max-w-6xl space-y-6 px-4 pb-10">
        {BLOCKS.map((b, i) => (
          <section key={b.title} className={`grid items-center gap-8 rounded-3xl border border-black/5 p-8 md:grid-cols-2 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
            <div>
              <p className="text-sm font-semibold text-brand">{b.eyebrow}</p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{b.title}</h2>
              <p className="mt-4 text-black/60">{b.text}</p>
              <ul className="mt-6 space-y-2 text-sm">
                {b.points.map((p) => <li key={p} className="flex gap-2"><span className="text-brand">✓</span>{p}</li>)}
              </ul>
            </div>
            <div className="grid h-64 place-items-center rounded-2xl bg-gradient-to-br from-brand-soft to-white text-6xl">
              {["🚀", "🔗", "🛠️", "📈"][i]}
            </div>
          </section>
        ))}
        <p className="pt-4 text-center">
          <Link href="/demo" className="font-semibold text-brand hover:underline">Voir la démo →</Link>
        </p>
      </div>
      <FinalCta />
    </MarketingShell>
  );
}
