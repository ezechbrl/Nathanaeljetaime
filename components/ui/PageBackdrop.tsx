// Fond commun à tous les écrans (site, connexion, espace client) : noir, fines lignes verticales,
// lumières douces blanches et vertes, et des motifs différents le long de la page (points, rayons,
// cercles, petites étoiles qui scintillent). Jamais deux fois le même motif au même endroit.
const GREEN = "61 255 154";
const WHITE = "255 255 255";

const LIGHTS = [
  { top: "2%", left: "50%", size: "70rem", c: WHITE, a: 0.16 },
  { top: "12%", left: "90%", size: "32rem", c: GREEN, a: 0.2 },
  { top: "26%", left: "6%", size: "40rem", c: WHITE, a: 0.13 },
  { top: "40%", left: "82%", size: "42rem", c: GREEN, a: 0.13 },
  { top: "54%", left: "16%", size: "30rem", c: GREEN, a: 0.17 },
  { top: "67%", left: "62%", size: "46rem", c: WHITE, a: 0.12 },
  { top: "80%", left: "10%", size: "36rem", c: WHITE, a: 0.13 },
  { top: "93%", left: "86%", size: "34rem", c: GREEN, a: 0.17 },
  { top: "8%", left: "8%", size: "30rem", c: GREEN, a: 0.14 },
  { top: "33%", left: "55%", size: "36rem", c: GREEN, a: 0.09 },
  { top: "73%", left: "92%", size: "28rem", c: GREEN, a: 0.15 },
  { top: "86%", left: "45%", size: "34rem", c: GREEN, a: 0.1 },
];

// Petites étoiles (4 branches) qui scintillent, blanches ou vertes.
const STARS = [
  { top: "6%", left: "14%", s: 10, g: false, d: 0 },
  { top: "9%", left: "79%", s: 14, g: true, d: 1.2 },
  { top: "19%", left: "93%", s: 8, g: false, d: 2.1 },
  { top: "31%", left: "22%", s: 12, g: true, d: 0.6 },
  { top: "37%", left: "70%", s: 9, g: false, d: 1.8 },
  { top: "48%", left: "92%", s: 13, g: false, d: 0.3 },
  { top: "58%", left: "5%", s: 10, g: true, d: 2.5 },
  { top: "64%", left: "38%", s: 8, g: false, d: 1.1 },
  { top: "74%", left: "88%", s: 12, g: true, d: 0.9 },
  { top: "86%", left: "30%", s: 9, g: false, d: 2.2 },
  { top: "91%", left: "58%", s: 13, g: true, d: 0.4 },
];

const Star = ({ size, green }: { size: number; green: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" style={{ filter: `drop-shadow(0 0 ${size / 2}px rgb(${green ? GREEN : WHITE} / .8))` }}>
    <path d="M10 0c.6 5.6 3.9 8.9 10 10-6.1 1.1-9.4 4.4-10 10-.6-5.6-3.9-8.9-10-10 6.1-1.1 9.4-4.4 10-10z" fill={green ? "#3dff9a" : "#fff"} />
  </svg>
);

export function PageBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[linear-gradient(180deg,#181b1a_0%,#1c211f_40%,#171b19_100%)]">
      {/* Fines lignes verticales très discrètes. */}
      <div className="absolute inset-0 opacity-50 [background:repeating-linear-gradient(90deg,transparent_0_119px,rgb(255_255_255/0.035)_119px_120px)]" />

      {/* Lumières douces, blanches et vertes. */}
      {LIGHTS.map((l, i) => (
        <div key={i} className="absolute rounded-full" style={{ top: l.top, left: l.left, width: l.size, height: l.size, transform: "translate(-50%, -50%)", background: `radial-gradient(closest-side, rgb(${l.c} / ${l.a}), transparent)` }} />
      ))}

      {/* Motif 1 : une grille de petits points, en haut à droite. */}
      <div className="absolute right-[4%] top-[4%] h-[26rem] w-[26rem] opacity-70 [background-image:radial-gradient(rgb(255_255_255/0.22)_1px,transparent_1.5px)] [background-size:22px_22px] [mask-image:radial-gradient(closest-side,black,transparent)]" />

      {/* Motif 2 : deux rayons de lumière en biais, à gauche. */}
      <div className="absolute left-[-10%] top-[20%] h-[2px] w-[70%] -rotate-[18deg] bg-[linear-gradient(90deg,transparent,rgb(61_255_154/0.45),transparent)] blur-[1px]" />
      <div className="absolute left-[-5%] top-[21.5%] h-px w-[55%] -rotate-[18deg] bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.3),transparent)]" />

      {/* Motif 3 : des cercles fins, à droite au milieu de la page. */}
      <div className="absolute right-[-8rem] top-[44%] h-[34rem] w-[34rem]">
        {[1, 0.75, 0.5].map((k, i) => (
          <div key={k} className="absolute left-1/2 top-1/2 rounded-full border" style={{ width: `${k * 100}%`, height: `${k * 100}%`, transform: "translate(-50%, -50%)", borderColor: i === 1 ? "rgb(61 255 154 / .22)" : "rgb(255 255 255 / .1)" }} />
        ))}
      </div>

      {/* Motif 4 : grille de petits carrés, en bas à gauche. */}
      <div className="absolute bottom-[12%] left-[2%] h-[22rem] w-[30rem] opacity-60 [background-image:linear-gradient(rgb(255_255_255/0.06)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.06)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(closest-side,black,transparent)]" />

      {/* Motif 5 : une ligne de lumière horizontale, vers le bas. */}
      <div className="absolute right-0 top-[76%] h-px w-[60%] bg-[linear-gradient(90deg,transparent,rgb(61_255_154/0.5),rgb(255_255_255/0.4),transparent)]" />

      {/* Petites étoiles qui scintillent. */}
      {STARS.map((st, i) => (
        <div key={i} className="absolute [animation:twinkle_3.2s_ease-in-out_infinite]" style={{ top: st.top, left: st.left, animationDelay: `${st.d}s` }}>
          <Star size={st.s} green={st.g} />
        </div>
      ))}
    </div>
  );
}
