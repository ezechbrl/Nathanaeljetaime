// Styles de boutique : choisis par l'IA selon la niche. Chacun a ses polices, sa mise en page,
// l'ordre de ses sections et ses bandeaux défilants. Partagé par le thème Shopify et l'aperçu.

export const STORE_STYLES = ["premium", "direct", "lifestyle", "tech"] as const;
export type StoreStyle = (typeof STORE_STYLES)[number];

export const STYLE_NAMES: Record<StoreStyle, string> = {
  premium: "Premium minimal",
  direct: "Vente directe",
  lifestyle: "Lifestyle",
  tech: "Sport / tech",
};

// Polices Google Fonts (toutes disponibles dans les graisses chargées par le thème).
export const STYLE_FONTS: Record<StoreStyle, { heading: string; body: string }> = {
  premium: { heading: "Cormorant Garamond", body: "Jost" },
  direct: { heading: "Archivo", body: "Inter" },
  lifestyle: { heading: "Fraunces", body: "DM Sans" },
  tech: { heading: "Space Grotesk", body: "Inter" },
};

export const STYLE_LAYOUTS: Record<StoreStyle, readonly ("left" | "right" | "center")[]> = {
  premium: ["center", "left"],
  direct: ["left", "right"],
  lifestyle: ["right", "left"],
  tech: ["center", "left"],
};

// Ordre des sections de l'accueil. « extras » = encadrés ajoutés ; « marquee2 » = second bandeau (sens inverse).
export type HomeSection = "hero" | "marquee" | "features" | "benefits" | "moments" | "extras" | "comparison" | "reviews" | "buy" | "faq" | "marquee2" | "banner";
export const STYLE_ORDER: Record<StoreStyle | "legacy", HomeSection[]> = {
  premium: ["hero", "marquee", "benefits", "moments", "features", "extras", "reviews", "buy", "comparison", "banner"],
  direct: ["hero", "marquee", "benefits", "comparison", "features", "extras", "reviews", "buy", "faq", "marquee2", "banner"],
  lifestyle: ["hero", "moments", "marquee", "benefits", "features", "extras", "reviews", "buy", "marquee2", "banner"],
  tech: ["hero", "marquee", "features", "comparison", "benefits", "moments", "extras", "reviews", "buy", "marquee2", "banner"],
  legacy: ["hero", "marquee", "features", "benefits", "moments", "extras", "comparison", "reviews", "buy", "banner"],
};

// Couleurs des bandeaux défilants : base / tint / dark / accent (mêmes noms que les sections du thème).
export const STYLE_MARQUEE: Record<StoreStyle | "legacy", { first: "base" | "tint" | "dark" | "accent"; second: "base" | "tint" | "dark" | "accent"; big: boolean }> = {
  premium: { first: "tint", second: "base", big: false },
  direct: { first: "accent", second: "dark", big: true },
  lifestyle: { first: "tint", second: "accent", big: true },
  tech: { first: "accent", second: "tint", big: true },
  legacy: { first: "accent", second: "tint", big: false },
};

export const isStyle = (s: unknown): s is StoreStyle => STORE_STYLES.includes(s as StoreStyle);
export const orderFor = (s: unknown) => STYLE_ORDER[isStyle(s) ? s : "legacy"];
export const marqueeFor = (s: unknown) => STYLE_MARQUEE[isStyle(s) ? s : "legacy"];

// Textes courts du bandeau : atouts et bénéfices de la boutique (2 à 5 mots), sans doublon.
export function marqueeTexts(home: { features?: { title: string }[]; benefits: { title: string }[] }, extra: string[] = []) {
  const seen = new Set<string>();
  return [...(home.features ?? []).map((f) => f.title), ...home.benefits.map((b) => b.title), ...extra]
    .map((t) => t.trim())
    .filter((t) => t && t.length <= 40 && !seen.has(t.toLowerCase()) && seen.add(t.toLowerCase()))
    .slice(0, 6);
}

// --- Couleurs : contraste garanti -------------------------------------------------------------

const rgb = (hex: string) => {
  const h = hex.replace("#", "").padEnd(6, "0");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) || 0);
};
const toHex = (c: number[]) => `#${c.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("")}`;
export const mixHex = (a: string, b: string, t: number) => { const [x, y] = [rgb(a), rgb(b)]; return toHex(x.map((v, i) => v + (y[i] - v) * t)); };
export function luminance(hex: string) {
  const [r, g, b] = rgb(hex).map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export const contrast = (a: string, b: string) => { const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
// Texte lisible (blanc ou presque noir) sur une couleur.
export const onColor = (hex: string) => (contrast(hex, "#ffffff") >= contrast(hex, "#141414") ? "#ffffff" : "#141414");

const HEX = /^#[0-9a-f]{6}$/i;

// Corrige une palette pour qu'elle reste lisible : texte bien contrasté sur le fond, couleur d'accent
// visible sur le fond (icônes, liens), fond sombre pour le style sport / tech, clair pour les autres.
export function fixPalette(colors: { primary: string; accent: string; background: string }, style?: unknown) {
  let { primary, accent, background } = colors;
  if (!HEX.test(background)) background = "#ffffff";
  if (!HEX.test(primary)) primary = "#141414";
  if (!HEX.test(accent)) accent = "#2563eb";
  const dark = style === "tech";
  if (dark && luminance(background) > 0.05) background = mixHex(background, "#05060a", 0.9);
  if (!dark && isStyle(style) && luminance(background) < 0.6) background = mixHex(background, "#ffffff", 0.85);
  const ink = luminance(background) > 0.4 ? "#111111" : "#f5f5f7";
  for (let i = 0; i < 8 && contrast(primary, background) < 7; i++) primary = mixHex(primary, ink, 0.35);
  // L'accent sert aussi aux icônes et sur-titres : assez visible sur le fond (sans le salir pour autant).
  for (let i = 0; i < 8 && contrast(accent, background) < 2.2; i++) accent = mixHex(accent, ink, 0.15);
  return { primary, accent, background };
}
