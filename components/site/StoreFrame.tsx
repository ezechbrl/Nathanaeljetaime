import type { ShowcaseStore } from "@/lib/content/showcase";
import { cn } from "@/lib/cn";

const fontClass = { serif: "font-serif", sans: "font-sans", mono: "font-mono" } as const;

function ProductVisual({ s, className }: { s: ShowcaseStore; className?: string }) {
  if (s.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <div className={cn("relative overflow-hidden", className)}><img src={s.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" /></div>;
  }
  return (
    <div className={cn("relative overflow-hidden", className)} style={{ background: `linear-gradient(150deg, ${s.palette.soft}, ${s.palette.accent}55)` }}>
      <div className="absolute left-1/2 top-1/2 h-[58%] w-[34%] -translate-x-1/2 -translate-y-1/2 rounded-[18%] shadow-[0_18px_30px_-12px_rgba(0,0,0,.35)]" style={{ background: `linear-gradient(160deg, ${s.palette.accent}, ${s.palette.ink})` }} />
      <div className="absolute bottom-[14%] left-1/2 h-[6%] w-[46%] -translate-x-1/2 rounded-full bg-black/15 blur-[6px]" />
    </div>
  );
}

// Aperçu d'une boutique générée, version ordinateur (et téléphone en option).
export function StoreFrame({ s, phone = true, className }: { s: ShowcaseStore; phone?: boolean; className?: string }) {
  const { bg, ink, accent } = s.palette;
  return (
    <div className={cn("relative", className)}>
      <div className="aspect-[4/3] overflow-hidden rounded-[10px] border border-black/10 shadow-[0_30px_60px_-30px_rgba(0,0,0,.6)]" style={{ background: bg, color: ink }}>
        <div className="flex items-center gap-1.5 border-b border-black/5 bg-black/[0.03] px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-black/15" /><span className="h-2 w-2 rounded-full bg-black/15" /><span className="h-2 w-2 rounded-full bg-black/15" />
          <span className="ml-3 h-3.5 flex-1 rounded bg-black/[0.05] px-2 text-[7px] leading-[14px] opacity-60">{s.slug}.com</span>
        </div>
        <div className="py-1.5 text-center text-[7px] tracking-wide" style={{ background: ink, color: bg }}>Livraison offerte dès 39 € · Retours 30 jours</div>
        <div className={cn("flex items-center justify-between px-4 py-2.5 text-[8px]", fontClass[s.font])}>
          <span className={cn("text-[12px]", s.font === "serif" && "italic")}>{s.name}</span>
          <span className="flex gap-3 opacity-60"><span>Boutique</span><span>Histoire</span><span>Panier</span></span>
        </div>
        {s.layout === "center" ? (
          <div className="px-4 pb-4 text-center">
            <p className={cn("mx-auto max-w-[80%] text-[19px] leading-[1.05] tracking-tight", fontClass[s.font])}>{s.headline}</p>
            <p className="mt-1.5 text-[8px] opacity-60">{s.sub}</p>
            <span className="mt-2.5 inline-block rounded-full px-3 py-1 text-[7px] font-medium text-white" style={{ background: accent }}>Découvrir</span>
            <ProductVisual s={s} className="mt-3 h-24 rounded-md" />
          </div>
        ) : s.layout === "grid" ? (
          <div className="px-4 pb-4">
            <p className={cn("max-w-[70%] text-[19px] leading-[1.05] tracking-tight", fontClass[s.font])}>{s.headline}</p>
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i}>
                  <ProductVisual s={s} className="aspect-[4/5] rounded" />
                  <div className="mt-1 h-1 w-3/4 rounded bg-current opacity-20" />
                  <div className="mt-0.5 h-1 w-1/3 rounded bg-current opacity-20" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-[1.1fr_1fr] items-center gap-3 px-4 pb-4">
            <div>
              <p className={cn("text-[19px] leading-[1.05] tracking-tight", fontClass[s.font])}>{s.headline}</p>
              <p className="mt-1.5 text-[8px] opacity-60">{s.sub}</p>
              <div className="mt-2.5 flex items-center gap-2">
                <span className="rounded-full px-3 py-1 text-[7px] font-medium" style={{ background: accent, color: bg }}>Acheter · {s.price}</span>
                <span className="text-[7px] opacity-60">Livraison offerte</span>
              </div>
            </div>
            <ProductVisual s={s} className="aspect-square rounded-md" />
          </div>
        )}
      </div>

      {phone && (
        <div className="absolute -bottom-4 -right-2 w-[28%] overflow-hidden rounded-[12px] border-[3px] border-[#0b0f12] shadow-[0_20px_40px_-12px_rgba(0,0,0,.7)] sm:-right-4" style={{ background: bg, color: ink }}>
          <div className="flex items-center justify-between px-2 py-1.5 text-[6px]"><span className={cn("text-[8px]", fontClass[s.font], s.font === "serif" && "italic")}>{s.name}</span><span>☰</span></div>
          <ProductVisual s={s} className="aspect-square" />
          <div className="p-2">
            <p className="text-[7px] font-medium leading-tight">{s.product}</p>
            <p className="text-[7px] opacity-60">{s.price}</p>
            <span className="mt-1.5 block rounded-full py-1 text-center text-[6px] text-white" style={{ background: accent }}>Ajouter au panier</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Page complète d'une boutique, en long (vitrine de l'accueil) : accueil, fiche produit, atouts, avis, pied de page.
export function StoreLongFrame({ s }: { s: ShowcaseStore }) {
  const { bg, ink, accent, soft } = s.palette;
  const f = fontClass[s.font];
  return (
    <div className="relative">
      <div className="overflow-hidden rounded-[10px] border border-black/10 text-[8px] shadow-[0_30px_60px_-30px_rgba(0,0,0,.6)]" style={{ background: bg, color: ink }}>
        <div className="py-1 text-center text-[6.5px] tracking-wide" style={{ background: ink, color: bg }}>Livraison offerte dès 39 € · Retours 30 jours</div>
        <div className="flex items-center justify-between px-3 py-2">
          <span className={cn("text-[11px]", f, s.font === "serif" && "italic")}>{s.name}</span>
          <span className="flex gap-2.5 opacity-60"><span>Boutique</span><span>Avis</span><span>Panier</span></span>
        </div>
        {/* Accueil */}
        <div className="grid grid-cols-[1.15fr_1fr] items-center gap-2.5 px-3 pb-3">
          <div>
            <p className={cn("text-[15px] leading-[1.05] tracking-tight", f)}>{s.headline}</p>
            <p className="mt-1 text-[7px] opacity-60">{s.sub}</p>
            <span className="mt-2 inline-block rounded-full px-2.5 py-1 text-[6.5px] font-medium" style={{ background: accent, color: bg }}>Découvrir</span>
          </div>
          <ProductVisual s={s} className="aspect-[4/3] rounded-md" />
        </div>
        {/* Fiche produit */}
        <div className="grid grid-cols-[1fr_1.1fr] gap-2.5 px-3 py-3" style={{ background: soft }}>
          <ProductVisual s={s} className="aspect-square rounded-md" />
          <div>
            <p className="text-[9px] font-semibold leading-tight">{s.product}</p>
            <p className="mt-0.5 text-[7px] opacity-70">Livraison offerte · Retours 30 jours</p>
            <p className="mt-1 text-[10px] font-bold">{s.price}</p>
            <div className="mt-1.5 space-y-1">
              {["1 unité", "Lot de 2 · −15 %"].map((o, i) => (
                <div key={o} className="rounded-[4px] border px-1.5 py-1 text-[6.5px]" style={{ borderColor: i === 0 ? accent : `${ink}22`, background: i === 0 ? `${accent}14` : "transparent" }}>{o}</div>
              ))}
            </div>
            <span className="mt-1.5 block rounded-full py-1 text-center text-[6.5px] font-semibold" style={{ background: accent, color: bg }}>Ajouter au panier</span>
          </div>
        </div>
        {/* Atouts */}
        <div className="grid grid-cols-3 gap-1.5 px-3 py-3 text-center">
          {s.highlights.slice(0, 3).map((h) => (
            <div key={h}><span className="mx-auto mb-1 block h-3.5 w-3.5 rounded-full" style={{ background: `${accent}33`, border: `1px solid ${accent}` }} /><p className="text-[6px] leading-tight opacity-70">{h}</p></div>
          ))}
        </div>
        {/* Avis */}
        <div className="px-3 pb-3">
          <p className={cn("mb-1.5 text-center text-[10px]", f)}>Ils l'ont adopté</p>
          <div className="grid grid-cols-2 gap-1.5">
            {[0, 1].map((i) => (
              <div key={i} className="rounded-[5px] p-1.5" style={{ background: `${ink}0d` }}>
                <p className="text-[6px] text-[#f5b301]">★★★★★</p>
                <div className="mt-1 h-[3px] w-full rounded bg-current opacity-20" /><div className="mt-0.5 h-[3px] w-2/3 rounded bg-current opacity-20" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between px-3 py-2 text-[6px] opacity-80" style={{ background: ink, color: bg }}>
          <span className={f}>{s.name}</span><span>Visa · Mastercard · PayPal · Apple Pay</span>
        </div>
      </div>
      {/* Téléphone */}
      <div className="absolute -bottom-3 -right-2 w-[30%] overflow-hidden rounded-[12px] border-[3px] border-[#0b0f12] shadow-[0_20px_40px_-12px_rgba(0,0,0,.7)]" style={{ background: bg, color: ink }}>
        <div className="flex items-center justify-between px-2 py-1 text-[6px]"><span className={cn("text-[7.5px]", f, s.font === "serif" && "italic")}>{s.name}</span><span>☰</span></div>
        <ProductVisual s={s} className="aspect-square" />
        <div className="p-1.5">
          <p className="text-[6.5px] font-medium leading-tight">{s.product}</p>
          <p className="text-[6.5px] opacity-60">{s.price}</p>
          <span className="mt-1 block rounded-full py-0.5 text-center text-[5.5px]" style={{ background: accent, color: bg }}>Ajouter au panier</span>
        </div>
      </div>
    </div>
  );
}
