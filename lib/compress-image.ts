// Photo réduite dans le navigateur (JPEG, côté le plus long limité) avant l'envoi ou la mise de côté.
export function compressImage(file: File, max = 1600, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * k);
      canvas.height = Math.round(img.height * k);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(img.src);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => reject(new Error("Image illisible."));
    img.src = URL.createObjectURL(file);
  });
}

// Photos ajoutées sur la page d'accueil (avant la connexion) : gardées dans le navigateur, puis reprises
// par le formulaire de création une fois connecté.
const KEY = "vigenia-landing-photos";
export function saveLandingPhotos(photos: string[]) {
  try {
    if (photos.length) localStorage.setItem(KEY, JSON.stringify({ at: Date.now(), photos }));
    else localStorage.removeItem(KEY);
  } catch { /* stockage plein ou indisponible : on continue sans les photos */ }
}
export function takeLandingPhotos(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    localStorage.removeItem(KEY);
    const saved = raw ? (JSON.parse(raw) as { at: number; photos: string[] }) : null;
    return saved && Date.now() - saved.at < 86_400_000 ? saved.photos.slice(0, 3) : [];
  } catch {
    return [];
  }
}
