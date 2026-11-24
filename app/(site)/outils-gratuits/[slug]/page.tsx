import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Section";
import { PageHero } from "@/components/site/PageHero";
import { FreeTools } from "@/components/site/FreeTools";
import { FREE_TOOL_PAGES } from "@/lib/content/free-tools";

export function generateStaticParams() {
  return FREE_TOOL_PAGES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = FREE_TOOL_PAGES.find((x) => x.slug === slug);
  if (!t) return {};
  return { title: t.title, description: t.description, alternates: { canonical: `/outils-gratuits/${t.slug}` } };
}

// Page d'un outil gratuit : l'outil, comment s'en servir, une FAQ, puis l'invitation à créer toute la boutique.
export default async function FreeToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = FREE_TOOL_PAGES.find((x) => x.slug === slug);
  if (!t) notFound();
  const others = FREE_TOOL_PAGES.filter((x) => x.slug !== t.slug);
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: t.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <PageHero eyebrow="Outil gratuit · sans inscription" title={t.h1} subtitle={t.intro} />
      <Container className="max-w-[1050px]">
        <FreeTools only={t.tool} />

        <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-[20px] border border-white/15 bg-white/[0.03] p-6 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-lg font-semibold">Et si l&apos;IA créait toute ta boutique ?</p>
            <p className="mt-1 text-sm text-fg-muted">Nom, design, textes, photos et fiche produit : un aperçu gratuit de ta boutique Shopify en quelques minutes.</p>
          </div>
          <Link href="/" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[linear-gradient(180deg,#34f0b0,#0fae7c)] glow-hover px-5 py-3 text-sm font-semibold text-[#03140d]">Voir l&apos;aperçu gratuit <ArrowRight className="h-4 w-4" /></Link>
        </div>

        <section className="mt-14">
          <h2 className="text-h2">Comment ça marche</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            {t.steps.map((s, i) => (
              <li key={s} className="surface rounded-card p-5"><p className="text-sm font-bold text-accent">0{i + 1}</p><p className="mt-2 text-[15px]">{s}</p></li>
            ))}
          </ol>
        </section>

        <section className="mt-14">
          <h2 className="text-h2">Questions fréquentes</h2>
          <div className="mt-6 divide-y divide-white/[0.07] border-y border-white/[0.07]">
            {t.faq.map((f) => <div key={f.q} className="py-5"><h3 className="text-lg font-medium">{f.q}</h3><p className="mt-1.5 text-[15px] text-fg-muted">{f.a}</p></div>)}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-h2">Les autres outils gratuits</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((o) => <Link key={o.slug} href={`/outils-gratuits/${o.slug}`} className="surface rounded-card p-4 text-[15px] transition-colors hover:text-accent">{o.h1} →</Link>)}
          </div>
        </section>
      </Container>
    </>
  );
}
