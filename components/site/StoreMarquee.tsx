import Link from "next/link";
import { SHOWCASE } from "@/lib/content/showcase";

// Défilé continu de vraies boutiques créées avec Vigenia, juste sous le champ.
export function StoreMarquee() {
  const items = [...SHOWCASE, ...SHOWCASE];
  return (
    <div className="relative mt-8 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
      <div className="flex w-max gap-3 [animation:store-mq_40s_linear_infinite] hover:[animation-play-state:paused]">
        {items.map((s, i) => (
          <Link key={`${s.slug}-${i}`} href={`/exemples/${s.slug}`} aria-hidden={i >= SHOWCASE.length} tabIndex={i >= SHOWCASE.length ? -1 : 0}
            className="group flex w-[220px] shrink-0 items-center gap-3 rounded-[16px] border border-white/10 bg-white/[0.05] p-2 pr-3 text-left backdrop-blur transition-colors hover:border-white/25">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {s.image && <img src={s.image} alt="" loading="lazy" className="h-14 w-14 shrink-0 rounded-[11px] object-cover" style={{ background: s.palette.soft }} />}
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
