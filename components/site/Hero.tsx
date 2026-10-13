import { Check, Sparkles } from "lucide-react";
import { LightRays } from "@/components/ui/LightRays";
import { Reveal } from "@/components/ui/Reveal";
import { SHOWCASE } from "@/lib/content/showcase";
import { AppPreview } from "./AppPreview";
import { PromptBox } from "./PromptBox";
import { StoreFrame } from "./StoreFrame";

const DONE = [
  { t: "Marché et promesse posés", d: "0:42" },
  { t: "Fiche produit rédigée", d: "2:10" },
  { t: "Visuels générés", d: "3:35" },
];

// Aperçu à droite : une boutique d'exemple et le journal de ce que l'IA vient de faire.
function HeroVisual() {
  const s = SHOWCASE[0];
  return (
    <div className="relative mx-auto w-full max-w-[520px] lg:mr-0">
      <div className="absolute -inset-6 rounded-[28px] bg-[radial-gradient(closest-side,rgb(0_128_96/0.35),transparent)]" aria-hidden />
      <div className="relative rotate-[1.5deg] transition-transform duration-700 hover:rotate-0">
        <StoreFrame s={s} />
      </div>
      <div className="absolute -bottom-10 -left-4 w-[260px] rounded-card border border-white/10 bg-bg-2 p-4 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.7)] sm:-left-12">
        <p className="flex items-center gap-2 text-xs text-fg-muted"><Sparkles className="h-3.5 w-3.5 text-accent" /> Brief : « {s.brief.slice(0, 38)}… »</p>
        <ul className="mt-3 space-y-2">
          {DONE.map((x, i) => (
            <li key={x.t} className="anim flex items-center gap-2 text-[13px]" style={{ animationName: "pop-in", animationDuration: ".5s", animationDelay: `${0.6 + i * 0.35}s` }}>
              <span className="grid h-4 w-4 place-items-center rounded-full bg-accent/15"><Check className="h-3 w-3 text-accent" /></span>
              {x.t}
              <span className="ml-auto text-[11px] tabular-nums text-fg-faint">{x.d}</span>
            </li>
          ))}
        </ul>
      </div>
      <span className="absolute -right-2 -top-4 rounded-full border border-accent/30 bg-bg-2/90 px-3 py-1 text-xs text-accent backdrop-blur sm:-right-6">Publiée sur Shopify</span>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative pb-10 pt-28 sm:pt-36">
      <LightRays />
      <div className="relative mx-auto grid max-w-[1200px] items-center gap-16 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
        <div>
          <Reveal>
            <span className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgb(94_211_140)]" />
              Bêta ouverte · ta première boutique est offerte
            </span>
          </Reveal>
          <Reveal delay={80} as="h1" className="mt-7 max-w-2xl text-[clamp(2.6rem,1.5rem+3.3vw,4.4rem)] leading-[1.02] tracking-[-0.045em]">
            Décris ton produit. On s'occupe de la <span className="serif-accent pr-1">vitrine</span>.
          </Reveal>
          <Reveal delay={180} as="p" className="mt-6 max-w-xl text-[17px] leading-relaxed text-fg-muted sm:text-lg">
            Vitrio étudie ton marché, écrit chaque page, crée tes visuels et publie une boutique Shopify prête à encaisser. Toi, tu valides.
          </Reveal>
          <Reveal delay={260} className="mt-9">
            <PromptBox align="left" />
          </Reveal>
        </div>
        <Reveal delay={200} className="hidden pb-8 lg:block"><HeroVisual /></Reveal>
      </div>
      <div className="relative px-4 sm:px-6">
        <AppPreview />
      </div>
    </section>
  );
}
