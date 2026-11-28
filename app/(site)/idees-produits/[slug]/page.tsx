import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Section";
import { PageHero } from "@/components/site/PageHero";
import { IDEA_PAGES } from "@/lib/content/product-ideas";
import { NICHES } from "@/lib/niches";
import { productSlug } from "@/lib/content/product-pages";
import { KeyGuides } from "@/components/site/KeyGuides";
import { EXTRA_PRODUCTS } from "@/lib/content/product-pages-extra";

export function generateStaticParams() {
  return IDEA_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = IDEA_PAGES.find((x) => x.slug === slug);
  if (!p) return {};
  return { title: p.title, description: p.description, alternates: { canonical: `/idees-produits/${p.slug}` } };
}

const quizLink = (brief: string) => `/quiz?${new URLSearchParams({ mode: "describe", brief })}`;

// Page SEO d'un univers : les produits du quiz, à qui les vendre, à quel prix, et un bouton pour créer
// la boutique avec le produit choisi (le quiz garde l'idée et ne la redemande pas).
export default async function IdeaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = IDEA_PAGES.find((x) => x.slug === slug);
  const n = p && NICHES.find((x) => x.id === p.niche);
  if (!p || !n) notFound();
  const others = IDEA_PAGES.filter((x) => x.slug !== p.slug);
  const faq = [
    { q: `À qui vendre des produits « ${n.label} » ?`, a: p.buyers },
    { q: "À quel prix les vendre ?", a: p.price },
    { q: "Comment trouver mes premiers clients ?", a: p.channels },
    { q: "Quelle erreur éviter ?", a: p.avoid },
  ];
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageHero eyebrow={`Idées de produits · ${n.label}`} title={p.h1} subtitle={p.intro} />
      <Container className="max-w-[1000px]">
        <section>
          <h2 className="text-h2">6 idées de produits {n.label.toLowerCase()}</h2>
          <p className="mt-2 text-fg-muted">Des produits génériques (sans marque), faciles à montrer en vidéo. Choisis-en un : Vigenia crée l&apos;aperçu de ta boutique Shopify gratuitement.</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {n.products.map(([name, brief]) => (
              <li key={name} className="surface flex flex-col rounded-card p-5">
                <h3 className="text-lg font-semibold"><Link href={`/vendre/${productSlug(name)}`} className="hover:text-accent">{name}</Link></h3>
                <p className="mt-1 flex-1 text-[15px] text-fg-muted">{brief}.</p>
                <Link href={quizLink(brief)} className="mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-accent hover:underline">Créer ma boutique avec ce produit <ArrowRight className="h-4 w-4" /></Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">Encore plus d&apos;idées</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {EXTRA_PRODUCTS.filter((x) => x.niche === n.id).map((x) => <Link key={x.name} href={`/vendre/${productSlug(x.name)}`} className="rounded-full border border-white/15 px-4 py-2 text-sm hover:border-white/40 hover:text-accent">{x.name}</Link>)}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-h2">Bien vendre dans cet univers</h2>
          <div className="mt-6 divide-y divide-white/[0.07] border-y border-white/[0.07]">
            {faq.map((f) => <div key={f.q} className="py-5"><h3 className="text-lg font-medium">{f.q}</h3><p className="mt-1.5 text-[15px] text-fg-muted">{f.a}</p></div>)}
          </div>
          <p className="mt-4 text-sm text-fg-faint">Ce sont des pistes, pas une garantie : aucune boutique n&apos;est sûre de vendre. Teste avec un petit budget avant d&apos;investir plus.</p>
        </section>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-[20px] border border-white/15 bg-white/[0.03] p-6 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-lg font-semibold">Pas sûr du produit ?</p>
            <p className="mt-1 text-sm text-fg-muted">Réponds à quelques questions (2 min) : on te propose des produits et on crée l&apos;aperçu de ta boutique, gratuitement.</p>
          </div>
          <Link href="/quiz" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[linear-gradient(180deg,#14b886,#00876a)] glow-hover px-5 py-3 text-sm font-semibold text-white">Faire le quiz <ArrowRight className="h-4 w-4" /></Link>
        </div>

        <section className="mt-14">
          <h2 className="text-h2">Les autres univers</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((o) => <Link key={o.slug} href={`/idees-produits/${o.slug}`} className="surface rounded-card p-4 text-[15px] transition-colors hover:text-accent">{o.h1} →</Link>)}
          </div>
        </section>
        <KeyGuides />
      </Container>
    </>
  );
}
