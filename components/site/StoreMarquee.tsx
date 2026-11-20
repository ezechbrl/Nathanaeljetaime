import Link from "next/link";
import { SHOWCASE } from "@/lib/content/showcase";

// Rangée de vraies boutiques créées avec Vigenia, à faire défiler au doigt (pas d'animation automatique).
export function StoreMarquee() {
  return (
    <div className="relative mt-8 [mask-image:linear-gradient(90deg,transparent,#000_5%,#000_95%,transparent)]">
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-[5%] pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SHOWCASE.map((s) => (
          <Link key={s.slug} href={`/exemples/${s.slug}`}
            className="group flex w-[220px] shrink-0 snap-start items-center gap-3 rounded-[16px] border border-white/10 bg-white/[0.05] p-2 pr-3 text-left backdrop-blur transition-colors hover:border-white/25">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {s.image && <img src={s.image} alt="" loading="lazy" draggable={false} className="h-14 w-14 shrink-0 rounded-[11px] object-cover" style={{ background: s.palette.soft }} />}
            <span className="min-w-0">
              <span className="block truncate text-[14px] font-semibold text-white">{s.name}</span>
              <span className="block truncate text-xs text-fg-muted">{s.category}</span>
              <span className="mt-1 block h-1 w-10 rounded-full" style={{ background: s.palette.accent }} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
