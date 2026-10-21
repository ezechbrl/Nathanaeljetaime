// Fond commun à tous les écrans (site, connexion, espace client) : dégradé vert profond qui s'éclaircit
// vers le bas, larges rayons de lumière obliques qui bougent lentement. Fixe derrière la page ;
// hauteur « grand écran » (100lvh) pour qu'aucune bande vide n'apparaisse sur téléphone.
export function PageBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[100lvh] overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(165deg,#04221a_0%,#073426_35%,#0b4634_70%,#09402f_100%)]" />
      <div className="absolute -inset-x-[15%] -top-[10%] bottom-0 blur-[28px] [animation:beams_22s_ease-in-out_infinite] [background:repeating-linear-gradient(112deg,transparent_0_90px,rgb(110_231_183/0.14)_150px,transparent_230px,transparent_300px,rgb(52_211_153/0.09)_340px,transparent_420px)]" />
      <div className="absolute -inset-x-[15%] -top-[10%] bottom-0 blur-[40px] [animation:beams_30s_ease-in-out_infinite_reverse] [background:repeating-linear-gradient(108deg,transparent_0_160px,rgb(0_0_0/0.18)_230px,transparent_320px)]" />
      <div className="absolute -left-[10%] top-[45%] h-[40rem] w-[50rem] rounded-full bg-[radial-gradient(closest-side,rgb(16_150_105/0.18),transparent)]" />
      <div className="absolute left-1/2 top-[30%] h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(46_230_166/0.10),transparent)]" />
    </div>
  );
}
