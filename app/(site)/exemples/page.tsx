import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { FinalCta } from "@/components/site/FinalCta";
import { PageHero } from "@/components/site/PageHero";
import { StoreFrame } from "@/components/site/StoreFrame";
import { SHOWCASE } from "@/lib/content/showcase";

export const metadata: Metadata = { title: "Exemples de boutiques", description: "Des boutiques Shopify générées par l'IA à partir d'un brief de deux lignes." };

export default function ExamplesPage() {
  return (
    <>
      <PageHero eyebrow="Exemples" title={<>De vraies <span className="serif-accent">boutiques</span></>} subtitle="Des boutiques réellement créées avec Vigenia, avec de vrais produits. Clique pour voir le brief et ce que l'IA a construit." />
      <Container>
        <div className="grid gap-x-6 gap-y-14 md:grid-cols-2">
          {SHOWCASE.map((s, i) => (
            <Reveal key={s.slug} delay={(i % 2) * 100}>
              <Link href={`/exemples/${s.slug}`} className="group block">
                <div className="rounded-card p-5 pb-8 transition-transform duration-500 ease-out group-hover:-translate-y-1 sm:p-8 sm:pb-10" style={{ background: `linear-gradient(160deg, ${s.palette.accent}, ${s.palette.ink})` }}>
                  <StoreFrame s={s} />
                </div>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xl tracking-tight">{s.name}</p>
                    <p className="mt-1 text-sm text-fg-muted">{s.category} · {s.language}</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-fg-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg" />
                </div>
                <p className="mt-3 border-l border-accent/40 pl-3 text-[15px] text-fg-muted">« {s.brief} »</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
      <FinalCta />
    </>
  );
}
