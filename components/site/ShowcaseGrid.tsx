import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SHOWCASE } from "@/lib/content/showcase";
import { StoreLongFrame } from "./StoreFrame";

// Vitrine : une grille de boutiques créées avec Vigenia, chacune sur un fond à ses couleurs.
export function ShowcaseGrid() {
  return (
    <section className="py-16">
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6">
        <div className="text-center">
          <Reveal as="h2" className="text-h2">Un produit, une boutique. <span className="serif-accent">Aucun</span> modèle.</Reveal>
          <Reveal delay={80} as="p" className="mx-auto mt-4 max-w-xl text-fg-muted">Chaque boutique part d'un lien ou d'une phrase. Clique pour voir ce que l'IA en a fait.<span className="mt-1 block text-[13px] text-fg-faint sm:hidden">← Fais glisser pour voir les autres →</span></Reveal>
        </div>
        <div className="-mx-4 mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden">
          {SHOWCASE.map((s, i) => (
            <Reveal key={s.slug} delay={(i % 3) * 70} className={`w-[78vw] max-w-[320px] shrink-0 snap-center sm:w-auto sm:max-w-none`}>
              <Link
                href={`/exemples/${s.slug}`}
                className="group relative block overflow-hidden rounded-[22px] p-4 pb-16 shadow-[0_24px_60px_-30px_rgb(0_0_0/0.8)] ring-1 ring-white/10 transition-all duration-500 hover:-translate-y-1.5 hover:ring-white/30"
                style={{ background: `linear-gradient(165deg, color-mix(in oklab, ${s.palette.accent} 70%, white), ${s.palette.accent} 50%, color-mix(in oklab, ${s.palette.accent} 78%, black))` }}
              >
                <div className="pointer-events-none transition-transform duration-700 ease-out group-hover:scale-[1.04]">
                  <StoreLongFrame s={s} />
                </div>
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent px-5 pb-4 pt-10">
                  <div>
                    <p className="text-[1.35rem] font-semibold leading-none tracking-[-0.02em] text-white">{s.name}</p>
                    <p className="mt-1 text-[12px] text-white/70">{s.category} · {s.language}</p>
                  </div>
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"><ArrowUpRight className="h-4 w-4" /></span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
