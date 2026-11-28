import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Section";
import { PageHero } from "@/components/site/PageHero";
import { KeyGuides } from "@/components/site/KeyGuides";
import { GLOSSARY, termSlug } from "@/lib/content/glossary";

const find = (slug: string) => GLOSSARY.find((t) => termSlug(t.term) === slug);

export function generateStaticParams() {
  return GLOSSARY.map((t) => ({ slug: termSlug(t.term) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = find(slug);
  if (!t) return {};
  return { title: `${t.term} : définition simple (e-commerce)`, description: `${t.def} Exemple concret et conseil pour ta boutique en ligne.`, alternates: { canonical: `/lexique/${slug}` } };
}

// Une page par mot du lexique : définition, exemple, conseil, mots liés.
export default async function TermPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = find(slug);
  if (!t) notFound();
  const related = (t.related ?? []).map((r) => GLOSSARY.find((x) => x.term === r)).filter(Boolean) as typeof GLOSSARY;
  const ld = { "@context": "https://schema.org", "@type": "DefinedTerm", name: t.term, description: t.def, inDefinedTermSet: "https://vigenia.com/lexique" };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageHero eyebrow="Lexique de l'e-commerce" title={<>{t.term} : définition</>} subtitle={t.def} />
      <Container className="max-w-[760px]">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="surface rounded-card p-5"><p className="font-semibold">Exemple</p><p className="mt-2 text-[15px] text-fg-muted">{t.example}</p></div>
          <div className="surface rounded-card p-5"><p className="font-semibold">Le conseil</p><p className="mt-2 text-[15px] text-fg-muted">{t.tip}</p></div>
        </div>
        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold">Mots liés</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {related.map((r) => <Link key={r.term} href={`/lexique/${termSlug(r.term)}`} className="rounded-full border border-white/15 px-4 py-2 text-sm hover:border-white/40 hover:text-accent">{r.term}</Link>)}
            </div>
          </section>
        )}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-[20px] border border-white/15 bg-white/[0.03] p-6 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-lg font-semibold">Lance ta boutique en ligne</p>
            <p className="mt-1 text-sm text-fg-muted">Vigenia crée l&apos;aperçu de ta boutique Shopify gratuitement : nom, design, textes et photos.</p>
          </div>
          <Link href="/quiz" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[linear-gradient(180deg,#14b886,#00876a)] glow-hover px-5 py-3 text-sm font-semibold text-white">Voir l&apos;aperçu gratuit <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <p className="mt-8 text-sm"><Link href="/lexique" className="text-accent hover:underline">← Tout le lexique</Link></p>
        <KeyGuides />
      </Container>
    </>
  );
}
