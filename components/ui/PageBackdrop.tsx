// Fond commun à tous les écrans (site, connexion, espace client) : dégradé vert profond qui s'éclaircit
// vers le bas, larges rayons de lumière obliques qui bougent lentement. Fixe derrière la page ;
// hauteur « grand écran » (100lvh) pour qu'aucune bande vide n'apparaisse sur téléphone.
export function PageBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[100lvh] overflow-hidden bg-[#0a0a0a]">
      {/* Noir, avec de fines lignes verticales très discrètes (style minimaliste). */}
      <div className="absolute inset-0 opacity-[0.5] [background:repeating-linear-gradient(90deg,transparent_0_119px,rgb(255_255_255/0.035)_119px_120px)] [mask-image:linear-gradient(180deg,black,transparent_90%)]" />
      <div className="absolute left-1/2 top-[-20%] h-[40rem] w-[70rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(255_255_255/0.05),transparent)]" />
    </div>
  );
}
