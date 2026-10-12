import { SHOWCASE } from "@/lib/mock";
import { StoreMockup } from "./StoreMockup";

export function Showcase() {
  const items = [...SHOWCASE, ...SHOWCASE];
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">Des boutiques pensées<br className="sm:hidden" /> pour vendre.</h2>
        <p className="mt-3 text-black/60">Exemples de boutiques générées à partir d'un simple brief.</p>
      </div>
      <div className="relative mt-12 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max animate-marquee gap-5 hover:[animation-play-state:paused]">
          {items.map((s, i) => (
            <StoreMockup key={`${s.name}-${i}`} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}
