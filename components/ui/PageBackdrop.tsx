// Fond commun à tous les écrans (site, connexion, espace client), fixe derrière la page :
// dégradé vert profond, rayons de lumière doux, fine trame de points et lueurs émeraude et citron vert.
// Hauteur « grand écran » (100lvh) : sur téléphone, le fond ne laisse jamais de bande vide quand la barre d'adresse se replie.
export function PageBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[100lvh] overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(170deg,#04211a_0%,#083326_45%,#05231b_100%)]" />
      <div className="absolute -inset-x-[15%] -top-[10%] bottom-0 opacity-80 blur-[34px] [animation:beams_26s_ease-in-out_infinite] [background:repeating-linear-gradient(122deg,transparent_0_120px,rgb(110_231_183/0.11)_180px,transparent_260px,transparent_380px,rgb(163_230_53/0.06)_420px,transparent_500px)]" />
      <div className="absolute inset-0 opacity-[0.22] [background-image:radial-gradient(rgb(167_243_208/0.55)_1px,transparent_1.2px)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_75%_60%_at_50%_30%,black,transparent_75%)]" />
      <div className="absolute -left-[10%] top-[8%] h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(closest-side,rgb(16_176_127/0.22),transparent)] [animation:aurora_18s_ease-in-out_infinite]" />
      <div className="absolute -right-[8%] top-[35%] h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(closest-side,rgb(163_230_53/0.10),transparent)] [animation:aurora_24s_ease-in-out_infinite_reverse]" />
    </div>
  );
}
