import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SHOWCASE } from "@/lib/content/showcase";
import { StoreFrame } from "./StoreFrame";

// Vitrine : une grille de boutiques créées avec Vitrio, chacune sur un fond à ses couleurs.
export function ShowcaseGrid() {
  return (
    <section className="py-16">
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6">
        <div className="text-center">
          <Reveal as="h2" className="text-h2">{SHOWCASE.length} produits, {SHOWCASE.length} boutiques. <span className="serif-accent">Aucun</span> modèle.</Reveal>
          <Reveal delay={80} as="p" className="mx-auto mt-4 max-w-xl text-fg-muted">Chaque boutique part d'un lien ou d'une phrase. Clique pour voir ce que l'IA en a fait.</Reveal>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SHOWCASE.map((s, i) => (
            <Reveal key={s.slug} delay={(i % 4) * 70}>
              <Link
                href={`/exemples/${s.slug}`}
                className="group relative block overflow-hidden rounded-[22px] p-4 pb-16 shadow-[0_24px_60px_-30px_rgb(0_0_0/0.8)] ring-1 ring-white/10 transition-all duration-500 hover:-translate-y-1.5 hover:ring-white/30"
                style={{ background: `linear-gradient(160deg, ${s.palette.accent}, ${s.palette.ink})` }}
              >
                <div className="pointer-events-none transition-transform duration-700 ease-out group-hover:scale-[1.04]">
                  <StoreFrame s={s} />
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
