// Mini aperçu d'une boutique générée, utilisé dans la vitrine et le dashboard.
export function StoreMockup({ name, niche, colors }: { name: string; niche: string; colors: string[] }) {
  const [bg, accent, ink] = colors;
  return (
    <div className="w-64 shrink-0 overflow-hidden rounded-2xl border border-black/5 shadow-sm" style={{ background: bg, color: ink }}>
      <div className="flex items-center justify-between px-4 py-3 text-xs">
        <span className="font-bold">{name}</span>
        <span className="flex gap-2 opacity-50"><span>Boutique</span><span>Panier</span></span>
      </div>
      <div className="px-4 pb-4">
        <div className="h-24 rounded-xl" style={{ background: `linear-gradient(135deg, ${accent}33, ${accent}88)` }} />
        <p className="mt-3 text-sm font-semibold leading-tight">La nouvelle référence {niche.toLowerCase()}</p>
        <div className="mt-2 h-2 w-3/4 rounded bg-current opacity-10" />
        <div className="mt-1 h-2 w-1/2 rounded bg-current opacity-10" />
        <span className="mt-3 inline-block rounded-full px-3 py-1 text-[10px] font-semibold text-white" style={{ background: accent }}>
          Acheter
        </span>
      </div>
    </div>
  );
}
