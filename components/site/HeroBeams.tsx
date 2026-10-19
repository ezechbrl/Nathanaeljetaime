// Fond du haut de la page d'accueil : dégradé vert avec de larges rayons de lumière obliques qui bougent lentement.
export function HeroBeams() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#05261d_0%,#0a3a2c_45%,rgb(var(--bg))_100%)]" />
      <div className="absolute -inset-x-[15%] -top-[10%] bottom-0 blur-[28px] [animation:beams_22s_ease-in-out_infinite] [background:repeating-linear-gradient(112deg,transparent_0_90px,rgb(110_231_183/0.16)_150px,transparent_230px,transparent_300px,rgb(52_211_153/0.10)_340px,transparent_420px)]" />
      <div className="absolute -inset-x-[15%] -top-[10%] bottom-0 blur-[40px] [animation:beams_30s_ease-in-out_infinite_reverse] [background:repeating-linear-gradient(108deg,transparent_0_160px,rgb(0_0_0/0.28)_230px,transparent_320px)]" />
      <div className="absolute left-1/2 top-[38%] h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(46_230_166/0.18),transparent)]" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent to-bg" />
    </div>
  );
}
