import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Section";
import { SHOWCASE } from "@/lib/content/showcase";
import { StoreFrame } from "./StoreFrame";

export function ShowcaseGrid() {
  return (
    <section className="py-24">
      <Container>
        <div className="text-center">
          <Reveal as="h2" className="text-h1">Des boutiques pensées<br />pour vendre.</Reveal>
          <Reveal delay={120} className="mt-8"><ButtonLink href="/inscription">Créer ma boutique</ButtonLink></Reveal>
        </div>
        <Reveal delay={80} as="p" className="mt-16 text-sm text-fg-muted">Exemples générés à partir d'un brief de deux lignes</Reveal>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SHOWCASE.map((s, i) => (
            <Reveal key={s.slug} delay={(i % 4) * 70}>
              <Link
                href={`/exemples/${s.slug}`}
                className="group relative block overflow-hidden rounded-card p-3 pb-12 transition-transform duration-500 ease-out hover:-translate-y-1"
                style={{ background: `linear-gradient(160deg, ${s.palette.accent}, ${s.palette.ink})` }}
              >
                <div className="transition-transform duration-700 ease-out group-hover:scale-[1.03]">
                  <StoreFrame s={s} phone={false} />
                </div>
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-10 text-white">
                  <span className="text-lg tracking-tight">{s.name}</span>
                  <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
