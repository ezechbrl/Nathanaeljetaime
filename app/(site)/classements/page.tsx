import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Section";
import { PageHero } from "@/components/site/PageHero";
import { ALL_RANKINGS as RANKINGS } from "@/lib/content/rankings";

export const metadata: Metadata = { title: "Classements : les meilleurs produits et boutiques à lancer", description: "Nos tier lists des meilleurs produits à vendre (Noël, débutant) et des meilleures boutiques à lancer, avec nos critères.", alternates: { canonical: "/classements" } };

export default function RankingsIndex() {
  return (
    <>
      <PageHero eyebrow="Classements" title="Les tier lists de Vigenia" subtitle="Les meilleurs produits à vendre et les meilleures boutiques à lancer, classés selon des critères clairs." />
      <Container className="max-w-[900px]">
        <div className="grid gap-3 sm:grid-cols-2">
          {RANKINGS.map((r) => <Link key={r.slug} href={`/classements/${r.slug}`} className="surface rounded-card p-5 hover:text-accent"><p className="font-semibold">{r.h1}</p><p className="mt-1 text-sm text-fg-muted">{r.items.length} éléments classés S, A, B, C</p></Link>)}
        </div>
      </Container>
    </>
  );
}
