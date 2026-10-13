"use client";

import { ButtonLink } from "@/components/ui/Button";
import { LogoMark } from "@/components/ui/Logo";
import { Reveal } from "@/components/ui/Reveal";
import { useScrollProgress } from "@/components/ui/useScrollProgress";
import { SHOWCASE } from "@/lib/content/showcase";
import { site } from "@/lib/site";
import { StoreFrame } from "./StoreFrame";

const FAN = [
  { i: 0, rot: -14, x: -88, y: 34 },
  { i: 2, rot: -7, x: -44, y: 12 },
  { i: 1, rot: 0, x: 0, y: 0 },
  { i: 3, rot: 7, x: 44, y: 12 },
  { i: 4, rot: 14, x: 88, y: 34 },
];

export function FinalCta({ title = "Crée des boutiques Shopify à fort potentiel avec l'IA" }: { title?: string }) {
  const ref = useScrollProgress<HTMLDivElement>(0.3);
  return (
    <section className="px-4 py-16 sm:px-6">
      <div ref={ref} className="relative mx-auto max-w-[1100px] overflow-hidden rounded-[18px] border border-accent/20 bg-[linear-gradient(180deg,#0b3324,#06180f_60%,#04140e)] px-6 pt-16 text-center sm:pt-20" style={{ "--p": 0 } as React.CSSProperties}>
        <div aria-hidden className="absolute inset-0 [background:radial-gradient(ellipse_60%_40%_at_50%_0%,rgb(0_166_118/0.18),transparent)]" />
        <Reveal className="relative flex items-center justify-center gap-2 text-sm text-fg-muted"><LogoMark className="h-5 w-5" /> {site.name}</Reveal>
        <Reveal delay={80} as="h2" className="relative mx-auto mt-6 max-w-3xl text-h1">{title}</Reveal>
        <Reveal delay={160} as="p" className="relative mx-auto mt-5 max-w-xl text-fg-muted">
          Décris ton projet. L'IA construit une boutique à l'image de ta marque, puis tu modifies tout en discutant ou dans l'éditeur avant de publier sur Shopify.
        </Reveal>
        <Reveal delay={240} className="relative mt-8"><ButtonLink href="/inscription" size="lg">Créer ma boutique</ButtonLink></Reveal>

        <div className="relative mx-auto mt-14 h-[200px] max-w-[760px] sm:h-[280px]">
          {FAN.map(({ i, rot, x, y }, k) => (
            <div
              key={i}
              className="absolute left-1/2 top-0 w-[46%] sm:w-[38%]"
              style={{
                zIndex: k === 2 ? 5 : 5 - Math.abs(k - 2),
                transform: `translateX(calc(-50% + ${x}% * var(--p))) translateY(calc(${y}px + (1 - var(--p)) * 120px)) rotate(calc(${rot}deg * var(--p)))`,
              }}
            >
              <StoreFrame s={SHOWCASE[i]} phone={false} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
