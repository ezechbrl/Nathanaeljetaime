"use client";

import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Globe2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Section";
import { SHOWCASE } from "@/lib/content/showcase";
import { StoreFrame } from "./StoreFrame";

// Carrousel horizontal des boutiques d'exemple.
export function ShowcaseGrid() {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => track.current?.scrollBy({ left: dir * 340, behavior: "smooth" });
  return (
    <section className="py-20">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal as="h2" className="text-h2">Huit briefs, huit boutiques.<br /><span className="serif-accent">Aucun</span> modèle.</Reveal>
            <Reveal delay={80} as="p" className="mt-4 max-w-lg text-fg-muted">Chaque boutique part d'une seule phrase. Clique pour voir ce que l'IA en a tiré.</Reveal>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => scroll(-1)} aria-label="Boutiques précédentes" className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-fg-muted transition-colors hover:border-white/30 hover:text-fg"><ArrowLeft className="h-4 w-4" /></button>
            <button type="button" onClick={() => scroll(1)} aria-label="Boutiques suivantes" className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-fg-muted transition-colors hover:border-white/30 hover:text-fg"><ArrowRight className="h-4 w-4" /></button>
            <ButtonLink href="/inscription" className="ml-2">Essayer avec mon produit</ButtonLink>
          </div>
        </div>
      </Container>
      <div ref={track} className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-4 [scrollbar-width:none] sm:px-6 xl:px-[max(1.5rem,calc((100vw-1200px)/2+1.5rem))] [&::-webkit-scrollbar]:hidden">
        {SHOWCASE.map((s) => (
          <div key={s.slug} className="w-[300px] shrink-0 snap-start sm:w-[320px]">
            <Link
              href={`/exemples/${s.slug}`}
              className="surface group flex h-full flex-col overflow-hidden rounded-card p-2 transition-all duration-500 ease-out hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_24px_60px_-30px_rgb(0_166_118/0.55)]"
            >
              <div
                className="relative overflow-hidden rounded-[14px] p-3 pb-4"
                style={{ background: `linear-gradient(160deg, ${s.palette.accent}, ${s.palette.ink})` }}
              >
                <div className="transition-transform duration-700 ease-out group-hover:scale-[1.03]">
                  <StoreFrame s={s} phone={false} />
                </div>
              </div>
              <div className="flex flex-1 flex-col px-3 pb-3 pt-4">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-0.5 font-medium text-accent">{s.category}</span>
                  <span className="inline-flex items-center gap-1 text-fg-faint">
                    <Globe2 className="h-3.5 w-3.5" /> {s.language}
                  </span>
                </div>
                <span className="mt-3 text-lg tracking-tight">{s.name}</span>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-fg-muted">
                  <Sparkles className="mr-1 inline h-3.5 w-3.5 -translate-y-px text-accent" />
                  « {s.brief} »
                </p>
                <ul className="mt-4 space-y-1.5 border-t border-white/[0.07] pt-4">
                  {s.highlights.slice(0, 3).map((h) => (
                    <li key={h} className="flex items-start gap-2 text-[13px] leading-snug text-fg-muted">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" /> {h}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm">
                  <span className="min-w-0 truncate text-fg-faint">{s.product} · <span className="whitespace-nowrap text-fg">{s.price}</span></span>
                  <span className="inline-flex shrink-0 items-center gap-1 text-accent">
                    Voir <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
