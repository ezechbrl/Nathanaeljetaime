import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Section";
import { PageHero } from "@/components/site/PageHero";
import { FREE_TOOL_PAGES } from "@/lib/content/free-tools";

export const metadata: Metadata = {
  title: "Outils gratuits pour créer ta boutique en ligne",
  description: "Générateur de nom de boutique, de slogan, de description produit, de FAQ, idées de vidéos TikTok et légendes Instagram : gratuits et sans inscription.",
  alternates: { canonical: "/outils-gratuits" },
};

export default function FreeToolsHub() {
  return (
    <>
      <PageHero eyebrow="Outils gratuits" title={<>Des outils IA <span className="serif-accent">gratuits</span> pour ta boutique</>} subtitle="Sans inscription, sans carte bancaire. Un résultat en quelques secondes, prêt à copier." />
      <Container className="max-w-[1050px]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FREE_TOOL_PAGES.map((t) => (
            <Link key={t.slug} href={`/outils-gratuits/${t.slug}`} className="surface group flex flex-col rounded-card p-6 transition-transform hover:-translate-y-1">
              <h2 className="text-xl tracking-tight transition-colors group-hover:text-accent">{t.h1}</h2>
              <p className="mt-2 flex-1 text-[15px] text-fg-muted">{t.description}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent">Essayer gratuitement <ArrowRight className="h-4 w-4" /></span>
            </Link>
          ))}
        </div>
      </Container>
    </>
  );
}
