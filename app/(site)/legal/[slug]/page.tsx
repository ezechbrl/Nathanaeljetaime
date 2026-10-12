import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Section";
import { PageHero } from "@/components/site/PageHero";
import { LEGAL } from "@/lib/content/legal";
import { formatDate } from "@/lib/format";

export function generateStaticParams() {
  return LEGAL.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const d = LEGAL.find((x) => x.slug === slug);
  return d ? { title: d.title, robots: { index: true } } : {};
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = LEGAL.find((d) => d.slug === slug);
  if (!doc) notFound();
  return (
    <>
      <PageHero eyebrow="Légal" title={doc.title} subtitle={`Dernière mise à jour : ${formatDate(doc.updated)}`} />
      <Container className="max-w-[760px]">
        <div className="space-y-10 text-[16px] leading-[1.75] text-fg-muted">
          {doc.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="mb-3 text-xl tracking-tight text-fg">{s.heading}</h2>
              {s.body.map((p) => <p key={p} className="mb-3">{p}</p>)}
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}
