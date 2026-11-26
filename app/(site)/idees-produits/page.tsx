import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Section";
import { PageHero } from "@/components/site/PageHero";
import { IDEA_PAGES } from "@/lib/content/product-ideas";
import { NICHES } from "@/lib/niches";

export const metadata: Metadata = {
  title: "Idées de produits à vendre en ligne : 72 idées en 12 univers",
  description: "Quoi vendre sur ta boutique en ligne ? 72 idées de produits classées en 12 univers, avec à qui les vendre, à quel prix et les erreurs à éviter.",
  alternates: { canonical: "/idees-produits" },
};

// Sommaire des pages « Idées de produits » (une par univers du quiz).
export default function IdeasIndex() {
  return (
    <>
      <PageHero eyebrow="Idées de produits" title="Quoi vendre sur ta boutique en ligne ?" subtitle="72 idées de produits, rangées en 12 univers. Pour chacun : à qui vendre, à quel prix, comment trouver tes clients et l'erreur à éviter." />
      <Container className="max-w-[1000px]">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {IDEA_PAGES.map((p) => {
            const n = NICHES.find((x) => x.id === p.niche)!;
            const Icon = n.icon;
            return (
              <Link key={p.slug} href={`/idees-produits/${p.slug}`} className="surface group rounded-card p-5 transition-colors hover:border-white/25">
                <Icon className="h-6 w-6 text-accent" />
                <p className="mt-3 text-lg font-semibold group-hover:text-accent">{n.label}</p>
                <p className="mt-1 text-sm text-fg-muted">{n.products.slice(0, 3).map((x) => x[0]).join(", ")}…</p>
              </Link>
            );
          })}
        </div>
      </Container>
    </>
  );
}
