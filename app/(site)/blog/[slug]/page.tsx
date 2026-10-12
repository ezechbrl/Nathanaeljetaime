import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { LightRays } from "@/components/ui/LightRays";
import { FinalCta } from "@/components/site/FinalCta";
import { POSTS } from "@/lib/content/blog";
import { formatDate } from "@/lib/format";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = POSTS.find((x) => x.slug === slug);
  return p ? { title: p.title, description: p.excerpt, openGraph: { type: "article", title: p.title, description: p.excerpt } } : {};
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = POSTS.find((x) => x.slug === slug);
  if (!post) notFound();
  const others = POSTS.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <>
      <article>
        <header className="relative pb-12 pt-36 sm:pt-44">
          <LightRays />
          <Container className="relative max-w-[760px]">
            <Reveal><Link href="/blog" className="inline-flex items-center gap-2 text-sm text-fg-muted hover:text-fg"><ArrowLeft className="h-4 w-4" /> Blog</Link></Reveal>
            <Reveal delay={60} as="p" className="mt-8 text-sm text-accent">{post.category} · {post.readingMinutes} min de lecture</Reveal>
            <Reveal delay={100} as="h1" className="mt-3 text-h1">{post.title}</Reveal>
            <Reveal delay={160} as="p" className="mt-6 text-sm text-fg-faint">{formatDate(post.date)}</Reveal>
          </Container>
        </header>
        <Container className="max-w-[760px]">
          <div className="space-y-10 text-[17px] leading-[1.75] text-fg-muted">
            {post.sections.map((s, i) => (
              <section key={i}>
                {s.heading && <h2 className="mb-4 text-2xl tracking-tight text-fg">{s.heading}</h2>}
                {s.paragraphs.map((p, j) => <p key={j} className="mb-4">{p}</p>)}
                {s.list && <ul className="mt-2 space-y-2 border-l border-accent/30 pl-5">{s.list.map((l) => <li key={l}>{l}</li>)}</ul>}
              </section>
            ))}
          </div>
        </Container>
      </article>
      <Container className="mt-24 max-w-[760px]">
        <p className="text-sm text-fg-faint">À lire ensuite</p>
        <div className="mt-4 divide-y divide-black/[0.07] border-y border-black/[0.07]">
          {others.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="block py-6 text-xl tracking-tight transition-colors hover:text-accent">{p.title}</Link>
          ))}
        </div>
      </Container>
      <FinalCta />
    </>
  );
}
