import type { Metadata } from "next";
import { Container } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { PageHero } from "@/components/site/PageHero";
import { CHANGELOG } from "@/lib/content/changelog";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Nouveautés", description: "Ce qui est disponible, ce qu'on construit, et ce qui arrive ensuite." };

const STYLE = {
  Disponible: "border-good/30 text-good",
  "En cours": "border-accent/30 text-accent",
  Prévu: "border-white/15 text-fg-muted",
};

export default function ChangelogPage() {
  return (
    <>
      <PageHero eyebrow="Nouveautés" title={<>Ce qui sort, ce qui <span className="serif-accent">arrive</span></>} subtitle="Le produit évolue chaque semaine. Voici où on en est." />
      <Container className="max-w-[820px]">
        <ol className="relative border-l border-white/[0.08] pl-8">
          {CHANGELOG.map((c, i) => (
            <Reveal as="li" key={c.title} delay={i * 50} className="relative pb-12">
              <span className={cn("absolute -left-[37px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-bg", c.status === "Disponible" ? "bg-good" : c.status === "En cours" ? "bg-accent" : "bg-fg-faint")} />
              <div className="flex flex-wrap items-center gap-3">
                <span className={cn("rounded-full border px-2.5 py-0.5 text-xs", STYLE[c.status])}>{c.status}</span>
                {c.date && <span className="text-sm text-fg-faint">{c.date}</span>}
              </div>
              <h2 className="mt-3 text-2xl tracking-tight">{c.title}</h2>
              <p className="mt-2 text-[16px] leading-relaxed text-fg-muted">{c.text}</p>
            </Reveal>
          ))}
        </ol>
      </Container>
    </>
  );
}
