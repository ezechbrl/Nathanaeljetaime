// Fond commun à tous les écrans (site, connexion, espace client) : noir, fines lignes verticales et
// petites lumières douces réparties sur toute la hauteur de la page.
const LIGHTS = [
  { top: "2%", left: "50%", size: "70rem", color: "rgb(255 255 255 / 0.09)" },
  { top: "14%", left: "88%", size: "34rem", color: "rgb(61 255 154 / 0.08)" },
  { top: "27%", left: "8%", size: "40rem", color: "rgb(255 255 255 / 0.075)" },
  { top: "41%", left: "78%", size: "44rem", color: "rgb(255 255 255 / 0.07)" },
  { top: "55%", left: "18%", size: "30rem", color: "rgb(61 255 154 / 0.075)" },
  { top: "68%", left: "60%", size: "48rem", color: "rgb(255 255 255 / 0.07)" },
  { top: "82%", left: "12%", size: "38rem", color: "rgb(255 255 255 / 0.075)" },
  { top: "94%", left: "85%", size: "36rem", color: "rgb(61 255 154 / 0.07)" },
];

export function PageBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[#0a0a0a]">
      {/* Noir, avec de fines lignes verticales très discrètes (style minimaliste). */}
      <div className="absolute inset-0 opacity-50 [background:repeating-linear-gradient(90deg,transparent_0_119px,rgb(255_255_255/0.035)_119px_120px)]" />
      {/* Petites lumières douces, à des endroits différents de la page (jamais deux fois au même endroit). */}
      {LIGHTS.map((l, i) => (
        <div key={i} className="absolute rounded-full" style={{ top: l.top, left: l.left, width: l.size, height: l.size, transform: "translate(-50%, -50%)", background: `radial-gradient(closest-side, ${l.color}, transparent)` }} />
      ))}
    </div>
  );
}
