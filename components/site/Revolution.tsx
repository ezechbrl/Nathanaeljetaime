import { Camera, MessageSquareText, Rocket, Star } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

// Grand titre « Une révolution » : ce qui prenait des semaines prend maintenant quelques minutes.
const PILLARS = [
  { icon: MessageSquareText, title: "Des textes qui vendent", text: "Accueil, fiche produit, FAQ et offres par lot, écrits pour ton client." },
  { icon: Camera, title: "Des photos de pro", text: "Ton produit en studio et en situation, sans photographe." },
  { icon: Star, title: "De vrais avis", text: "Les avis des acheteurs du produit, traduits, avec leurs photos." },
  { icon: Rocket, title: "Publié sur Shopify", text: "Thème à ta marque, produit et pages créés en un clic." },
];

export function Revolution() {
  return (
    <section className="relative overflow-hidden py-24">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-10 h-[26rem] w-[70rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(46_230_166/0.16),transparent)]" />
      <div className="relative mx-auto max-w-[1200px] px-4 text-center sm:px-6">
        <Reveal as="h2" className="bg-[linear-gradient(180deg,#ffffff_20%,#a7f3d0_60%,rgb(110_231_183/0.35))] bg-clip-text pb-2 font-display text-[clamp(3.4rem,1.5rem+8vw,9rem)] font-medium leading-[0.95] tracking-[-0.06em] text-transparent">
          Une révolution
        </Reveal>
        <Reveal delay={100} as="p" className="mx-auto mt-6 max-w-2xl text-[clamp(1.05rem,0.9rem+0.5vw,1.3rem)] leading-relaxed text-fg-muted">
          Avant : 3 semaines, un développeur et 2 000 €. <span className="text-fg">Maintenant : 10 minutes, toi et une phrase.</span>
        </Reveal>
        <div className="mt-14 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map(({ icon: I, title, text }, i) => (
            <Reveal key={title} delay={i * 80} className="group relative rounded-[20px] bg-[linear-gradient(160deg,rgb(46_230_166/0.5),rgb(255_255_255/0.06)_45%,rgb(46_230_166/0.15))] p-px">
              <div className="h-full rounded-[19px] bg-[linear-gradient(180deg,rgb(8_40_31/0.92),rgb(4_20_15/0.95))] p-6 backdrop-blur">
                <span className="grid h-11 w-11 place-items-center rounded-2xl border border-[#2ee6a6]/30 bg-[#2ee6a6]/10 text-[#6ee7b7] shadow-[0_0_20px_-4px_rgb(46_230_166/0.5)] transition-transform duration-500 group-hover:scale-110"><I className="h-5 w-5" /></span>
                <p className="mt-5 text-[1.1rem] font-semibold tracking-[-0.01em]">{title}</p>
                <p className="mt-2 text-[14px] leading-relaxed text-fg-muted">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
