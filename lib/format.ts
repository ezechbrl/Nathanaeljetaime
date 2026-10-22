export const formatDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
export const formatShortDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
// Montants en centimes (contrat d'API).
export const formatMoney = (cents: number, currency = "EUR") =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);
export const formatPercent = (n: number) => `${n.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
export const formatNumber = (n: number) => n.toLocaleString("fr-FR");
export function timeAgo(d: string) {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return "à l'instant";
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
  if (s < 172800) return "hier";
  return `il y a ${Math.floor(s / 86400)} j`;
}

// Avis affichés en 1 ou 2 phrases : on garde le début du vrai texte, sans le réécrire.
export function shortReview(text: string, max = 180) {
  const sentences = text.trim().match(/[^.!?]+[.!?]*/g) ?? [text];
  let out = sentences[0].trim();
  if (sentences[1] && out.length + sentences[1].length <= max) out += ` ${sentences[1].trim()}`;
  if (out.length > max) out = `${out.slice(0, max).replace(/\s+\S*$/, "")}…`;
  else if (out.length < text.trim().length) out = out.replace(/[.!?]*$/, (p) => p || "…");
  return out;
}
