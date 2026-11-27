import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Section";
import { PageHero } from "@/components/site/PageHero";
import { GIFT_GUIDES } from "@/lib/content/gift-guides";
import { PRODUCT_PAGES, productSlug } from "@/lib/content/product-pages";
import { EXTRA_PRODUCTS } from "@/lib/content/product-pages-extra";

const ALL = [...PRODUCT_PAGES, ...EXTRA_PRODUCTS];

export function generateStaticParams() {
  return GIFT_GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = GIFT_GUIDES.find((x) => x.slug === slug);
  if (!g) return {};
  return { title: `Idée cadeau pour ${g.who} : ${g.picks.length} idées`, description: `${g.intro} Notre sélection de ${g.picks.length} idées cadeaux pour ${g.who}.`, alternates: { canonical: `/idees-cadeaux/${slug}` } };
}

// Une sélection d'idées cadeaux par personne, avec un lien vers la page de chaque produit.
export default async function GiftPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = GIFT_GUIDES.find((x) => x.slug === slug);
  if (!g) notFound();
  const others = GIFT_GUIDES.filter((x) => x.slug !== g.slug);
  return (
    <>
      <PageHero eyebrow="Idées cadeaux" title={<>Idée cadeau pour {g.who}</>} subtitle={g.intro} />
      <Container className="max-w-[900px]">
        <ol className="grid gap-3 sm:grid-cols-2">
          {g.picks.map((name, i) => {
            const p = ALL.find((x) => x.name === name);
            return (
              <li key={name} className="surface flex flex-col rounded-card p-5">
                <p className="text-xs font-semibold text-accent">Idée {i + 1}</p>
                <h2 className="mt-1 text-lg font-semibold">{name}</h2>
                {p && <p className="mt-1 flex-1 text-[15px] text-fg-muted">{p.why}</p>}
                <Link href={`/vendre/${productSlug(name)}`} className="mt-3 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-accent hover:underline">Voir l&apos;idée en détail <ArrowRight className="h-4 w-4" /></Link>
              </li>
            );
          })}
        </ol>
        <p className="mt-6 rounded-[16px] border border-white/10 bg-white/[0.03] p-4 text-[15px]"><b>Le conseil :</b> <span className="text-fg-muted">{g.tip}</span></p>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-[20px] border border-white/15 bg-white/[0.03] p-6 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-lg font-semibold">Et si tu vendais ces cadeaux ?</p>
            <p className="mt-1 text-sm text-fg-muted">Vigenia crée l&apos;aperçu de ta boutique Shopify gratuitement, autour du produit de ton choix.</p>
          </div>
          <Link href="/quiz" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[linear-gradient(180deg,#14b886,#00876a)] glow-hover px-5 py-3 text-sm font-semibold text-white">Créer ma boutique <ArrowRight className="h-4 w-4" /></Link>
        </div>

        <section className="mt-14">
          <h2 className="text-h2">D&apos;autres idées cadeaux</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((o) => <Link key={o.slug} href={`/idees-cadeaux/${o.slug}`} className="surface rounded-card p-4 text-[15px] transition-colors hover:text-accent">Pour {o.who} →</Link>)}
          </div>
        </section>
      </Container>
    </>
  );
}
