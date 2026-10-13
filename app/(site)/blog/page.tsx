import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { PageHero } from "@/components/site/PageHero";
import { POSTS } from "@/lib/content/blog";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Blog", description: "Guides concrets pour créer, lancer et faire vendre une boutique Shopify." };

export default function BlogPage() {
  const [first, ...rest] = POSTS;
  return (
    <>
      <PageHero eyebrow="Blog" title={<>Vendre sur Shopify, <span className="serif-accent">concrètement</span></>} subtitle="Des guides courts et actionnables, sans jargon." />
      <Container className="max-w-[1050px]">
        <Reveal>
          <Link href={`/blog/${first.slug}`} className="surface group grid gap-8 rounded-card p-7 sm:p-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="text-sm text-accent">{first.category} · {first.readingMinutes} min</p>
              <h2 className="mt-3 text-h2 transition-colors group-hover:text-accent">{first.title}</h2>
            </div>
            <div className="flex flex-col justify-between gap-6">
              <p className="text-[17px] leading-relaxed text-fg-muted">{first.excerpt}</p>
              <p className="text-sm text-fg-faint">{formatDate(first.date)}</p>
            </div>
          </Link>
        </Reveal>
        <div className="mt-6 divide-y divide-white/[0.07] border-y border-white/[0.07]">
          {rest.map((p, i) => (
            <Reveal key={p.slug} delay={i * 60}>
              <Link href={`/blog/${p.slug}`} className="group grid gap-3 py-8 sm:grid-cols-[160px_1fr_auto] sm:items-baseline sm:gap-8">
                <p className="text-sm text-fg-faint">{formatDate(p.date)}</p>
                <div>
                  <h2 className="text-xl tracking-tight transition-colors group-hover:text-accent sm:text-2xl">{p.title}</h2>
                  <p className="mt-2 text-[15px] text-fg-muted">{p.excerpt}</p>
                </div>
                <p className="text-sm text-fg-muted">{p.category}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </>
  );
}
