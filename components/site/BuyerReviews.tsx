import { Star } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { BUYER_REVIEWS } from "@/lib/content/buyer-reviews";

const flag = (c: string) => String.fromCodePoint(...[...c.toUpperCase()].map((x) => 0x1f1a5 + x.charCodeAt(0)));

// Section dédiée aux avis : de vrais avis d'acheteurs, importés automatiquement dans les boutiques créées.
export function BuyerReviews() {
  const row = [...BUYER_REVIEWS, ...BUYER_REVIEWS];
  return (
    <section className="overflow-hidden py-16 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 text-center sm:px-6">
        <Reveal as="p" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[13px] text-fg-muted">
          <span className="flex gap-0.5">{[0, 1, 2, 3, 4].map((k) => <Star key={k} className="h-3.5 w-3.5 fill-[#f5b301] text-[#f5b301]" />)}</span> Avis importés automatiquement
        </Reveal>
        <Reveal delay={60} as="h2" className="mt-5 text-h2">Tes clients voient de <span className="serif-accent">vrais</span> avis</Reveal>
        <Reveal delay={100} as="p" className="mx-auto mt-4 max-w-xl text-fg-muted">Vigenia récupère les avis des acheteurs de ton produit chez le fournisseur, les traduit et les affiche sur ta boutique. Exemples tirés de boutiques créées avec Vigenia.</Reveal>
      </div>
      {/* Bande d'avis qui défile en continu (s'arrête au survol). */}
      <div className="group mt-12 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <div className="flex w-max gap-4 [animation:marquee_60s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:[animation:none]">
          {row.map((r, i) => (
            <figure key={i} aria-hidden={i >= BUYER_REVIEWS.length} className="w-[300px] shrink-0 rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgb(8_40_31/0.92),rgb(3_16_12/0.96))] p-5 text-left sm:w-[340px]">
              <div className="flex items-center justify-between">
                <span className="flex gap-0.5">{[0, 1, 2, 3, 4].map((k) => <Star key={k} className="h-4 w-4 fill-[#f5b301] text-[#f5b301]" />)}</span>
                <span className="text-lg" title={r.country}>{flag(r.country)}</span>
              </div>
              <blockquote className="mt-3 text-[15px] leading-relaxed text-fg/90">« {r.text} »</blockquote>
              <figcaption className="mt-4 text-[12.5px] text-fg-faint"><span className="text-fg-muted">{r.author || "Acheteur vérifié"}</span> · {r.product} · boutique {r.store}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
