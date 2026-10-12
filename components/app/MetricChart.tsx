"use client";

import { useMemo, useRef, useState } from "react";
import type { MetricsPoint } from "@/lib/api/types";
import { formatShortDate } from "@/lib/format";

// Une seule série (pas de double axe) : courbe 2 px, aplat à 10 %, grille fine, réticule + infobulle au survol.
export function MetricChart({ series, metric, format, label }: { series: MetricsPoint[]; metric: keyof Omit<MetricsPoint, "date">; format: (n: number) => string; label: string }) {
  const W = 760, H = 240, P = { l: 48, r: 16, t: 16, b: 28 };
  const ref = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const { pts, ticks, max } = useMemo(() => {
    const values = series.map((p) => p[metric] as number);
    const raw = Math.max(...values, 0) || 1;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => raw / s <= 4) ?? mag * 10;
    const max = Math.ceil(raw / step) * step;
    const ticks = Array.from({ length: Math.round(max / step) + 1 }, (_, i) => i * step);
    const x = (i: number) => P.l + (i / Math.max(series.length - 1, 1)) * (W - P.l - P.r);
    const y = (v: number) => P.t + (1 - v / max) * (H - P.t - P.b);
    return { pts: values.map((v, i) => ({ x: x(i), y: y(v), v })), ticks: ticks.map((t) => ({ t, y: y(t) })), max };
  }, [series, metric]);

  if (!series.length) return null;
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1].x} ${H - P.b} L${pts[0].x} ${H - P.b} Z`;
  const last = pts[pts.length - 1];
  const h = hover !== null ? pts[hover] : null;
  const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} k` : n.toLocaleString("fr-FR"));
  const labelEvery = Math.ceil(series.length / 6);

  function onMove(e: React.PointerEvent) {
    const r = ref.current!.getBoundingClientRect();
    const xs = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((xs - P.l) / (W - P.l - P.r)) * (series.length - 1));
    setHover(Math.min(series.length - 1, Math.max(0, i)));
  }

  return (
    <div className="relative">
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="h-auto w-full touch-none" role="img" aria-label={`${label}, ${series.length} jours, maximum ${format(max)}`} onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
        {ticks.map(({ t, y }) => (
          <g key={t}>
            <line x1={P.l} x2={W - P.r} y1={y} y2={y} stroke="rgb(255 255 255 / 0.07)" strokeWidth="1" />
            <text x={P.l - 8} y={y + 4} textAnchor="end" className="fill-fg-faint text-[11px]">{metric === "revenue" ? compact(t / 100) : metric === "conversionRate" ? `${t} %` : compact(t)}</text>
          </g>
        ))}
        {series.map((p, i) => i % labelEvery === 0 && (
          <text key={p.date} x={pts[i].x} y={H - 8} textAnchor="middle" className="fill-fg-faint text-[11px]">{formatShortDate(p.date)}</text>
        ))}
        <path d={area} fill="rgb(79 227 207 / 0.1)" />
        <path d={line} fill="none" stroke="rgb(79 227 207)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={last.x} cy={last.y} r="4.5" fill="rgb(79 227 207)" stroke="#042128" strokeWidth="2" />
        {h && (
          <g>
            <line x1={h.x} x2={h.x} y1={P.t} y2={H - P.b} stroke="rgb(255 255 255 / 0.25)" strokeWidth="1" />
            <circle cx={h.x} cy={h.y} r="5" fill="rgb(79 227 207)" stroke="#042128" strokeWidth="2" />
          </g>
        )}
      </svg>
      {h && hover !== null && (
        <div className="pointer-events-none absolute top-2 rounded-ctl border border-white/10 bg-bg-2/95 px-3 py-2 text-xs shadow-xl backdrop-blur" style={{ left: `clamp(0px, calc(${(h.x / W) * 100}% - 70px), calc(100% - 140px))` }}>
          <p className="text-fg-faint">{formatShortDate(series[hover].date)}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-fg"><span className="h-2 w-2 rounded-full bg-accent" />{label} : {format(h.v)}</p>
        </div>
      )}
    </div>
  );
}
