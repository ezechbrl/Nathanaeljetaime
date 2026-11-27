import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Section";
import { PageHero } from "@/components/site/PageHero";
import { GIFT_GUIDES } from "@/lib/content/gift-guides";

export const metadata: Metadata = {
  title: "Idées cadeaux : trouve le bon cadeau pour chaque personne",
  description: "Idées cadeaux pour maman, papa, ado, gamer, sportif, amoureux des animaux, naissance, Noël et petits budgets.",
  alternates: { canonical: "/idees-cadeaux" },
};

export default function GiftsIndex() {
  return (
    <>
      <PageHero eyebrow="Idées cadeaux" title="Trouve le bon cadeau" subtitle="Des sélections d'idées pour chaque personne et chaque budget." />
      <Container className="max-w-[1000px]">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {GIFT_GUIDES.map((g) => <Link key={g.slug} href={`/idees-cadeaux/${g.slug}`} className="surface rounded-card p-5 transition-colors hover:text-accent"><p className="font-semibold">Pour {g.who}</p><p className="mt-1 text-sm text-fg-muted">{g.picks.slice(0, 3).join(", ")}…</p></Link>)}
        </div>
      </Container>
    </>
  );
}
