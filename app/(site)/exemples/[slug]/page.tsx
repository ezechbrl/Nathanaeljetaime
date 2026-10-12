import type { Metadata } from "next";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { LightRays } from "@/components/ui/LightRays";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Section";
import { StoreFrame } from "@/components/site/StoreFrame";
import { SHOWCASE } from "@/lib/content/showcase";

export function generateStaticParams() {
  return SHOWCASE.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = SHOWCASE.find((x) => x.slug === slug);
  return s ? { title: `${s.name} · Exemple`, description: s.brief } : {};
}

export default async function ExamplePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const idx = SHOWCASE.findIndex((x) => x.slug === slug);
  if (idx < 0) notFound();
  const s = SHOWCASE[idx];
  const next = SHOWCASE[(idx + 1) % SHOWCASE.length];

  return (
    <>
      <section className="relative pb-10 pt-32 sm:pt-40">
        <LightRays />
        <Container className="relative">
          <Reveal><Link href="/exemples" className="inline-flex items-center gap-2 text-sm text-fg-muted hover:text-fg"><ArrowLeft className="h-4 w-4" /> Tous les exemples</Link></Reveal>
          <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:items-center">
            <div>
              <Reveal as="p" className="text-sm text-accent">{s.category} · boutique en {s.language}</Reveal>
              <Reveal delay={60} as="h1" className="mt-3 text-h1">{s.name}</Reveal>
              <Reveal delay={120} className="mt-8 rounded-card border border-black/[0.08] bg-black/[0.02] p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-fg-faint">Le brief</p>
                <p className="mt-2 text-lg leading-snug">« {s.brief} »</p>
              </Reveal>
              <Reveal delay={180} className="mt-8">
                <p className="text-xs uppercase tracking-[0.14em] text-fg-faint">Ce que l'IA a fait</p>
                <ul className="mt-3 space-y-2.5">
                  {s.highlights.map((h) => <li key={h} className="flex gap-3 text-[15px]"><Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{h}</li>)}
                </ul>
              </Reveal>
              <Reveal delay={240} className="mt-10 flex flex-wrap gap-3">
                <ButtonLink href={`/inscription?brief=${encodeURIComponent(s.brief)}`} size="lg">Créer une boutique comme celle-ci</ButtonLink>
              </Reveal>
            </div>
            <Reveal delay={100}>
              <div className="rounded-card p-6 pb-10 sm:p-10 sm:pb-14" style={{ background: `linear-gradient(160deg, ${s.palette.accent}, ${s.palette.ink})` }}>
                <StoreFrame s={s} />
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <Container className="py-20">
        <Link href={`/exemples/${next.slug}`} className="group flex items-center justify-between border-y border-black/[0.07] py-8">
          <span className="text-sm text-fg-muted">Exemple suivant</span>
          <span className="text-h2 transition-colors group-hover:text-accent">{next.name} →</span>
        </Link>
      </Container>
    </>
  );
}
