// Fines lignes « circuit » de chaque côté du haut de l'accueil, avec une lueur verte qui les parcourt.
// Décor discret, masqué sur mobile.
type Line = { d: string; end: [number, number] };
const LEFT: Line[] = [
  { d: "M0 140 H120 Q140 140 140 160 V330 Q140 350 160 350 H300", end: [300, 350] },
  { d: "M0 420 H60 Q80 420 80 440 V560 Q80 580 100 580 H230", end: [230, 580] },
];
const RIGHT: Line[] = [
  { d: "M520 110 H380 Q360 110 360 130 V290 Q360 310 340 310 H230", end: [230, 310] },
  { d: "M520 470 H450 Q430 470 430 490 V610 Q430 630 410 630 H300", end: [300, 630] },
];

function Side({ lines, className, delay, id }: { lines: Line[]; className: string; delay: number; id: string }) {
  return (
    <svg viewBox="0 0 520 700" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" x2="1">
          <stop offset="0" stopColor="#2ee6a6" stopOpacity="0" />
          <stop offset="0.5" stopColor="#a7f3d0" />
          <stop offset="1" stopColor="#2ee6a6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {lines.map((l, i) => (
        <g key={l.d}>
          <path d={l.d} stroke="rgb(46 230 166 / 0.14)" strokeWidth="1.2" />
          <path d={l.d} stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round" pathLength={1000} className="circuit-pulse" style={{ animationDelay: `${delay + i * 2.2}s` }} />
          <circle cx={l.end[0]} cy={l.end[1]} r="2.5" fill="#6ee7b7" style={{ animation: `node-glow 3s ease-in-out ${i * 1.3}s infinite` }} />
        </g>
      ))}
    </svg>
  );
}

export function HeroCircuits() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-24 hidden h-[700px] lg:block">
      <Side id="pulse-l" lines={LEFT} delay={0} className="absolute left-0 top-0 h-full w-[34%] max-w-[520px] [filter:drop-shadow(0_0_6px_rgb(46_230_166/0.6))]" />
      <Side id="pulse-r" lines={RIGHT} delay={1.1} className="absolute right-0 top-0 h-full w-[34%] max-w-[520px] [filter:drop-shadow(0_0_6px_rgb(46_230_166/0.6))]" />
    </div>
  );
}
