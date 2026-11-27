import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Section";
import { PageHero } from "@/components/site/PageHero";
import { GLOSSARY, termSlug } from "@/lib/content/glossary";

export const metadata: Metadata = {
  title: "Lexique de l'e-commerce : les mots à connaître pour vendre en ligne",
  description: "Dropshipping, taux de conversion, panier moyen, SEO, CGV… Tous les mots de l'e-commerce expliqués simplement, avec un exemple et un conseil.",
  alternates: { canonical: "/lexique" },
};

// Sommaire du lexique, par ordre alphabétique.
export default function GlossaryIndex() {
  const sorted = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term, "fr"));
  return (
    <>
      <PageHero eyebrow="Lexique" title="Les mots de l'e-commerce, expliqués simplement" subtitle={`${GLOSSARY.length} mots à connaître pour lancer et faire vendre ta boutique en ligne, avec un exemple et un conseil pour chacun.`} />
      <Container className="max-w-[1000px]">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((t) => <Link key={t.term} href={`/lexique/${termSlug(t.term)}`} className="surface rounded-card p-4 text-[15px] transition-colors hover:text-accent">{t.term}</Link>)}
        </div>
      </Container>
    </>
  );
}
