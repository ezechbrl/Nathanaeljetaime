import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Section";
import { PageHero } from "@/components/site/PageHero";
import { QUESTIONS, questionSlug } from "@/lib/content/questions";

const find = (slug: string) => QUESTIONS.find((x) => questionSlug(x.q) === slug);

export function generateStaticParams() {
  return QUESTIONS.map((x) => ({ slug: questionSlug(x.q) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const x = find(slug);
  return x ? { title: x.q, description: x.a.slice(0, 155), alternates: { canonical: `/questions/${slug}` } } : {};
}

// Une question, sa réponse courte, les étapes et les conseils ; puis d'autres questions du même thème.
export default async function QuestionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const x = find(slug);
  if (!x) notFound();
  const same = QUESTIONS.filter((o) => o.cat === x.cat && o.q !== x.q).slice(0, 8);
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: [x.a, ...(x.steps ?? []), ...(x.tips ?? [])].join(" ") } }] };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageHero eyebrow={`Questions · ${x.cat}`} title={x.q} />
      <Container className="max-w-[760px]">
        <div className="rounded-[18px] border border-[#3dff9a]/30 bg-[#3dff9a]/[0.05] p-5 text-[17px] leading-relaxed"><b>La réponse : </b>{x.a}</div>
        {x.steps && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold">Étape par étape</h2>
            <ol className="mt-3 space-y-2">{x.steps.map((s, i) => <li key={s} className="flex gap-3 text-[15px] text-fg-muted"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold text-white">{i + 1}</span>{s}</li>)}</ol>
          </section>
        )}
        {x.tips && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold">Nos conseils</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] text-fg-muted">{x.tips.map((t) => <li key={t}>{t}</li>)}</ul>
          </section>
        )}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-[20px] border border-white/15 bg-white/[0.03] p-6 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-lg font-semibold">Crée ta boutique Shopify en 3 minutes</p>
            <p className="mt-1 text-sm text-fg-muted">Décris ton produit ou colle un lien AliExpress : Vigenia crée l&apos;aperçu de ta boutique gratuitement.</p>
          </div>
          <Link href="/quiz" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[linear-gradient(180deg,#14b886,#00876a)] glow-hover px-5 py-3 text-sm font-semibold text-white">Voir l&apos;aperçu gratuit <ArrowRight className="h-4 w-4" /></Link>
        </div>
        {same.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold">D&apos;autres questions : {x.cat}</h2>
            <div className="mt-4 divide-y divide-white/[0.07] border-y border-white/[0.07]">{same.map((o) => <Link key={o.q} href={`/questions/${questionSlug(o.q)}`} className="block py-3 text-[15px] hover:text-accent">{o.q}</Link>)}</div>
            <p className="mt-4 text-sm"><Link href="/questions" className="text-accent hover:underline">Toutes les questions →</Link></p>
          </section>
        )}
      </Container>
    </>
  );
}
