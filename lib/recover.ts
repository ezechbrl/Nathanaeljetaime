// Après une mise en ligne, l'onglet ouvert peut réclamer d'anciens fichiers qui n'existent plus :
// on recharge alors la page une seule fois (au plus toutes les 30 s) au lieu d'afficher une erreur.
const KEY = "vg-reload-at";

export function isStaleBuildError(error: unknown) {
  const text = error instanceof Error ? `${error.name} ${error.message}` : String(error);
  return /ChunkLoadError|Loading (CSS )?chunk|dynamically imported module|Failed to fetch|Importing a module script|Server Action .* not found|unexpected response from the server/i.test(text);
}

export function reloadOnce() {
  try {
    const last = Number(sessionStorage.getItem(KEY) ?? 0);
    if (Date.now() - last < 30_000) return false;
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch { /* stockage indisponible : on recharge quand même */ }
  window.location.reload();
  return true;
}
