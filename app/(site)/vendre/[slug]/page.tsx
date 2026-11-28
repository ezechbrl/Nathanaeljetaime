import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Section";
import { PageHero } from "@/components/site/PageHero";
import { IDEA_PAGES } from "@/lib/content/product-ideas";
import { PRODUCT_PAGES, productSlug } from "@/lib/content/product-pages";
import { EXTRA_PRODUCTS } from "@/lib/content/product-pages-extra";
import { KeyGuides } from "@/components/site/KeyGuides";
import { NICHES } from "@/lib/niches";

// Une page par produit du quiz : pourquoi il plaît, l'idée de vidéo, le point de vigilance (propres au produit),
// puis à qui le vendre, à quel prix et où trouver ses clients (conseils de son univers).
function find(slug: string) {
  const extra = EXTRA_PRODUCTS.find((x) => productSlug(x.name) === slug);
  const p = PRODUCT_PAGES.find((x) => productSlug(x.name) === slug) ?? extra;
  if (!p) return null;
  const niche = extra ? NICHES.find((n) => n.id === extra.niche) : NICHES.find((n) => n.products.some(([name]) => name === p.name));
  const brief = extra ? extra.brief : niche?.products.find(([name]) => name === p.name)?.[1];
  const idea = niche && IDEA_PAGES.find((i) => i.niche === niche.id);
  return niche && brief && idea ? { p, niche, brief, idea } : null;
}

export function generateStaticParams() {
  return [...PRODUCT_PAGES, ...EXTRA_PRODUCTS].map((p) => ({ slug: productSlug(p.name) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const f = find(slug);
  if (!f) return {};
  return {
    title: `${f.p.name} : le vendre en ligne (guide et idées)`,
    description: `${f.brief}. Pourquoi ce produit plaît, à qui le vendre, à quel prix, une idée de vidéo et le point à vérifier avant de te lancer.`,
    alternates: { canonical: `/vendre/${slug}` },
  };
}

export default async function SellProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const f = find(slug);
  if (!f) notFound();
  const { p, niche, brief, idea } = f;
  const others = [...niche.products.map(([name]) => name), ...EXTRA_PRODUCTS.filter((x) => x.niche === niche.id).map((x) => x.name)].filter((name) => name !== p.name);
  const quiz = `/quiz?${new URLSearchParams({ mode: "describe", brief })}`;
  const faq = [
    { q: `Pourquoi vendre ce produit ?`, a: p.why },
    { q: "Quelle vidéo faire pour le montrer ?", a: p.video },
    { q: "Qu'est-ce qu'il faut vérifier avant de le vendre ?", a: p.watch },
    { q: "À qui le vendre ?", a: idea.buyers },
    { q: "À quel prix le vendre ?", a: idea.price },
  ];
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })) };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageHero eyebrow={`Idée de produit · ${niche.label}`} title={<>{p.name} : le vendre en ligne</>} subtitle={`${brief}.`}>
        <Link href={quiz} className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(180deg,#14b886,#00876a)] glow-hover px-6 py-3.5 text-[15px] font-semibold text-white">Créer ma boutique avec ce produit <ArrowRight className="h-4 w-4" /></Link>
        <p className="mt-2 text-xs text-fg-faint">Aperçu gratuit · 2 minutes · sans carte bancaire</p>
      </PageHero>
      <Container className="max-w-[860px]">
        <div className="grid gap-3 sm:grid-cols-3">
          {[["💡 Pourquoi il plaît", p.why], ["🎬 L'idée de vidéo", p.video], ["⚠️ À vérifier", p.watch]].map(([t, d]) => (
            <div key={t} className="surface rounded-card p-5"><p className="font-semibold">{t}</p><p className="mt-2 text-[15px] text-fg-muted">{d}</p></div>
          ))}
        </div>

        <section className="mt-12">
          <h2 className="text-h2">Bien le vendre</h2>
          <div className="mt-6 divide-y divide-white/[0.07] border-y border-white/[0.07]">
            {[["À qui le vendre", idea.buyers], ["À quel prix", idea.price], ["Où trouver tes clients", idea.channels], ["L'erreur à éviter dans cet univers", idea.avoid]].map(([q, a]) => (
              <div key={q} className="py-5"><h3 className="text-lg font-medium">{q}</h3><p className="mt-1.5 text-[15px] text-fg-muted">{a}</p></div>
            ))}
          </div>
          <p className="mt-4 text-sm text-fg-faint">Ce sont des pistes, pas une garantie : aucun produit n&apos;est sûr de se vendre. Commande un échantillon et teste avant d&apos;investir plus.</p>
        </section>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-[20px] border border-white/15 bg-white/[0.03] p-6 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-lg font-semibold">Ta boutique pour ce produit, en 3 minutes</p>
            <p className="mt-1 text-sm text-fg-muted">Nom, design, textes et photos : Vigenia crée l&apos;aperçu de ta boutique Shopify gratuitement.</p>
          </div>
          <Link href={quiz} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[linear-gradient(180deg,#14b886,#00876a)] glow-hover px-5 py-3 text-sm font-semibold text-white">Voir l&apos;aperçu gratuit <ArrowRight className="h-4 w-4" /></Link>
        </div>

        <section className="mt-14">
          <h2 className="text-h2">D&apos;autres idées : {niche.label.toLowerCase()}</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((name) => <Link key={name} href={`/vendre/${productSlug(name)}`} className="surface rounded-card p-4 text-[15px] transition-colors hover:text-accent">{name} →</Link>)}
          </div>
          <p className="mt-4 text-sm"><Link href={`/idees-produits/${idea.slug}`} className="text-accent hover:underline">Toutes les idées {niche.label.toLowerCase()} →</Link> · <Link href="/idees-produits" className="text-accent hover:underline">Les 72 idées de produits →</Link></p>
        </section>
        <KeyGuides />
      </Container>
    </>
  );
}
