import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Section";
import { PageHero } from "@/components/site/PageHero";
import { RANKINGS, type Tier } from "@/lib/content/rankings";
import { productSlug } from "@/lib/content/product-pages";

const TIER: Record<Tier, { label: string; color: string }> = {
  S: { label: "S", color: "#ff5c7a" },
  A: { label: "A", color: "#ffa94d" },
  B: { label: "B", color: "#ffe066" },
  C: { label: "C", color: "#8ce99a" },
};

export function generateStaticParams() {
  return RANKINGS.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = RANKINGS.find((x) => x.slug === slug);
  return r ? { title: r.title, description: r.description, alternates: { canonical: `/classements/${slug}` } } : {};
}

// Tier list : une rangée par niveau (S, A, B, C), puis le détail de chaque élément avec sa raison.
export default async function RankingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = RANKINGS.find((x) => x.slug === slug);
  if (!r) notFound();
  const tiers = (["S", "A", "B", "C"] as Tier[]).map((t) => ({ t, items: r.items.filter((i) => i.tier === t) })).filter((x) => x.items.length);
  const ld = { "@context": "https://schema.org", "@type": "ItemList", name: r.h1, itemListElement: r.items.map((i, n) => ({ "@type": "ListItem", position: n + 1, name: i.name })) };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageHero eyebrow="Classement" title={r.h1} subtitle={r.intro} />
      <Container className="max-w-[980px]">
        {/* La tier list en un coup d'œil. */}
        <div className="overflow-hidden rounded-[18px] border border-white/10">
          {tiers.map(({ t, items }) => (
            <div key={t} className="flex border-b border-white/10 last:border-b-0">
              <div className="grid w-14 shrink-0 place-items-center text-2xl font-black text-black sm:w-20" style={{ background: TIER[t].color }}>{TIER[t].label}</div>
              <div className="flex flex-1 flex-wrap gap-2 bg-white/[0.03] p-3">
                {items.map((i) => <a key={i.name} href={`#${productSlug(i.name)}`} className="rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-[13px] hover:border-white/40">{i.name}</a>)}
              </div>
            </div>
          ))}
        </div>

        <section className="mt-8 rounded-[18px] border border-white/10 bg-white/[0.03] p-5">
          <h2 className="font-semibold">Nos critères</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] text-fg-muted">{r.criteria.map((c) => <li key={c}>{c}</li>)}</ul>
          <p className="mt-3 text-sm text-fg-faint">Ce classement est notre avis selon ces critères, pas un classement des ventes : aucun produit n&apos;est sûr de se vendre. Teste avant d&apos;investir.</p>
        </section>

        <section className="mt-10 space-y-3">
          {r.items.map((i) => (
            <div key={i.name} id={productSlug(i.name)} className="surface scroll-mt-24 rounded-card p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] text-lg font-black text-black" style={{ background: TIER[i.tier].color }}>{i.tier}</span>
                <h3 className="text-lg font-semibold">{i.name}</h3>
              </div>
              <p className="mt-2 text-[15px] text-fg-muted">{i.why}</p>
              {i.examples && <p className="mt-2 flex flex-wrap gap-1.5">{i.examples.map((e) => <Link key={e} href={`/vendre/${productSlug(e)}`} className="rounded-full border border-white/15 px-3 py-1 text-xs hover:text-accent">{e}</Link>)}</p>}
              {i.product && <Link href={`/vendre/${productSlug(i.product)}`} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline">Voir comment le vendre <ArrowRight className="h-4 w-4" /></Link>}
            </div>
          ))}
        </section>

        {r.note && <p className="mt-6 rounded-[16px] border border-[#ffa94d]/40 bg-[#ffa94d]/10 p-4 text-[15px]"><b>Important :</b> {r.note}</p>}

        <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-[20px] border border-white/15 bg-white/[0.03] p-6 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-lg font-semibold">Lance ta boutique avant les fêtes</p>
            <p className="mt-1 text-sm text-fg-muted">Choisis ton produit : Vigenia crée l&apos;aperçu de ta boutique Shopify gratuitement, en quelques minutes.</p>
          </div>
          <Link href="/quiz" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[linear-gradient(180deg,#14b886,#00876a)] glow-hover px-5 py-3 text-sm font-semibold text-white">Créer ma boutique <ArrowRight className="h-4 w-4" /></Link>
        </div>

        <section className="mt-12">
          <h2 className="text-h2">Les autres classements</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {RANKINGS.filter((x) => x.slug !== r.slug).map((x) => <Link key={x.slug} href={`/classements/${x.slug}`} className="surface rounded-card p-4 text-[15px] hover:text-accent">{x.h1} →</Link>)}
            <Link href="/idees-cadeaux/cadeau-noel-original" className="surface rounded-card p-4 text-[15px] hover:text-accent">Idées cadeaux de Noël originales →</Link>
          </div>
        </section>
      </Container>
    </>
  );
}
