import type { StorePlan } from "@/lib/store-schema";
import type { Asset, Recommendation, Store, StoreMetrics } from "./types";

// Contenu de démonstration (mode mock uniquement). Marques fictives.

export function samplePlan(name: string, niche: string): StorePlan {
  if (!/baume|lèvre/i.test(niche)) return genericPlan(name, niche);
  return {
    brand: {
      name,
      tagline: `Le ${niche.toLowerCase()} qui change tout`,
      tone: "Chaleureux, précis, sans superlatifs",
      colors: { primary: "#2b1a22", accent: "#c8506a", background: "#fff7f4" },
    },
    strategy: {
      market: "Femmes de 25 à 40 ans, urbaines, attentives à la composition des produits qu'elles achètent.",
      promise: "Des lèvres nourries toute la journée avec 6 ingrédients, tous lisibles.",
      offers: ["Livraison offerte dès 39 €", "Lot de 3 à −20 %", "Satisfaite ou remboursée pendant 30 jours"],
      objections: [
        { objection: "Est-ce que ça colle ?", answer: "Texture fondante qui pénètre en 30 secondes, sans film gras." },
        { objection: "C'est cher pour un baume.", answer: "Un stick dure 3 mois en usage quotidien, soit 8 € par mois." },
        { objection: "Et si ça ne me convient pas ?", answer: "On rembourse sans question pendant 30 jours." },
      ],
    },
    homepage: {
      heroTitle: "Six ingrédients. Zéro compromis.",
      heroSubtitle: "Des baumes formulés en France pour des lèvres nourries du matin au soir.",
      ctaLabel: "Découvrir les baumes",
      benefits: [
        { title: "Formule courte", text: "Six ingrédients d'origine naturelle, rien d'autre." },
        { title: "Tient 8 heures", text: "Une application le matin suffit pour la journée." },
        { title: "Fabriqué à Grasse", text: "Petites séries, contrôlées une par une." },
      ],
      socialProofIdea: "Demander une photo avant/après aux 50 premières clientes en échange d'un baume offert.",
    },
    product: {
      title: `${name} — Baume nourrissant`,
      subtitle: "Cire d'abeille, karité, huile de jojoba",
      price: "14.90",
      compareAtPrice: "18.00",
      descriptionHtml:
        "<p>Un baume fondant qui nourrit sans briller.</p><h3>Pourquoi il marche</h3><ul><li><strong>Karité brut</strong> pour réparer</li><li><strong>Jojoba</strong> pour protéger</li><li><strong>Cire d'abeille</strong> pour faire tenir</li></ul>",
      bulletPoints: ["Tient 8 heures", "Sans parfum ajouté", "Stick de 4,5 g, environ 3 mois d'usage"],
      seoTitle: `Baume à lèvres naturel nourrissant | ${name}`,
      seoDescription: "Baume à lèvres en 6 ingrédients naturels, fabriqué en France. Livraison offerte dès 39 €.",
      tags: ["baume", "lèvres", "naturel"],
    },
    faq: [
      { question: "Quels sont les délais de livraison ?", answer: "48 à 72 h en France métropolitaine." },
      { question: "Convient-il aux peaux sensibles ?", answer: "Oui, la formule est sans parfum ajouté et testée sous contrôle dermatologique." },
      { question: "Puis-je le retourner ?", answer: "Oui, pendant 30 jours, même entamé." },
    ],
    aboutPage: {
      title: `L'histoire de ${name}`,
      bodyHtml: "<p>Tout a commencé par une liste d'ingrédients trop longue au dos d'un baume de pharmacie.</p>",
    },
  };
}

// Contenu neutre pour les boutiques créées en démo : il reprend le brief.
function genericPlan(name: string, niche: string): StorePlan {
  const subject = niche.replace(/\s+/g, " ").trim().replace(/[.,;:]$/, "");
  const short = subject.split(/[,.;]/)[0].slice(0, 60);
  return {
    brand: { name, tagline: "Bien pensé, bien fait", tone: "Direct, chaleureux, précis", colors: { primary: "#1d1d22", accent: "#b9813f", background: "#faf8f5" } },
    strategy: {
      market: `Acheteurs en ligne intéressés par : ${short}. Sensibles à la qualité, au rapport qualité-prix et aux délais.`,
      promise: `${short.charAt(0).toUpperCase() + short.slice(1)}, sans compromis sur la qualité.`,
      offers: ["Livraison offerte dès 39 €", "Lot de 2 à −15 %", "Satisfait ou remboursé pendant 30 jours"],
      objections: [
        { objection: "Est-ce que la qualité est au rendez-vous ?", answer: "Chaque pièce est contrôlée avant expédition, et tu as 30 jours pour changer d'avis." },
        { objection: "Quand vais-je le recevoir ?", answer: "Expédition sous 24 h, livraison en 48 à 72 h en France." },
      ],
    },
    homepage: {
      heroTitle: "L'essentiel, bien fait.",
      heroSubtitle: `${short.charAt(0).toUpperCase() + short.slice(1)}. Pensé pour durer, livré en 48 h.`,
      ctaLabel: "Découvrir",
      benefits: [
        { title: "Qualité contrôlée", text: "Chaque produit est vérifié avant de partir." },
        { title: "Livraison rapide", text: "Expédié sous 24 h, suivi inclus." },
        { title: "30 jours pour changer d'avis", text: "Retour simple, remboursement rapide." },
      ],
      socialProofIdea: "Demander un avis avec photo aux 30 premiers clients, en échange d'un code de réduction.",
    },
    product: {
      title: `${name} — ${short.split(" ").slice(0, 3).join(" ")}`,
      subtitle: "Notre produit signature",
      price: "29.90",
      compareAtPrice: "39.00",
      descriptionHtml: `<p>${short.charAt(0).toUpperCase() + short.slice(1)}.</p><h3>Pourquoi tu vas l'adorer</h3><ul><li><strong>Conçu pour durer</strong></li><li><strong>Simple à utiliser</strong> au quotidien</li><li><strong>Livré rapidement</strong>, emballage soigné</li></ul>`,
      bulletPoints: ["Expédié sous 24 h", "Garantie 30 jours", "Paiement sécurisé"],
      seoTitle: `${short} | ${name}`,
      seoDescription: `${short}. Livraison offerte dès 39 €, satisfait ou remboursé 30 jours.`,
      tags: short.toLowerCase().split(" ").filter((w) => w.length > 3).slice(0, 4),
    },
    faq: [
      { question: "Quels sont les délais de livraison ?", answer: "48 à 72 h en France métropolitaine." },
      { question: "Puis-je retourner mon produit ?", answer: "Oui, pendant 30 jours." },
      { question: "Le paiement est-il sécurisé ?", answer: "Oui, via Shopify Payments (carte, Apple Pay, Google Pay)." },
    ],
    aboutPage: { title: `L'histoire de ${name}`, bodyHtml: `<p>${name} est née d'une idée simple : proposer ${short.toLowerCase()} de qualité, sans détour.</p>` },
  };
}

const now = Date.now();
const ago = (days: number) => new Date(now - days * 86_400_000).toISOString();

export const seedStores: Store[] = [
  {
    id: "lumea",
    name: "Orée",
    niche: "Baumes à lèvres naturels",
    language: "français",
    mode: "start",
    status: "published",
    shopConnectionId: "conn_1",
    theme: { colors: { primary: "#2b1a22", accent: "#c8506a", background: "#fff7f4" }, headingFont: "Fraunces", bodyFont: "DM Sans" },
    plan: samplePlan("Orée", "Baume à lèvres"),
    previewUrl: null,
    liveUrl: "https://lumea.example",
    createdAt: ago(21),
    updatedAt: ago(0.1),
  },
  {
    id: "nordik",
    name: "Nordik Desk",
    niche: "Accessoires de bureau en bois",
    language: "anglais",
    mode: "link",
    status: "published",
    shopConnectionId: "conn_1",
    theme: { colors: { primary: "#1f2a24", accent: "#b9813f", background: "#f5f1ea" }, headingFont: "Instrument Serif", bodyFont: "DM Sans" },
    plan: { ...samplePlan("Nordik Desk", "Bureau en bois"), brand: { ...samplePlan("Nordik Desk", "Bureau").brand, colors: { primary: "#1f2a24", accent: "#b9813f", background: "#f5f1ea" } } },
    previewUrl: null,
    liveUrl: "https://nordik.example",
    createdAt: ago(40),
    updatedAt: ago(1),
  },
  {
    id: "matcha-lab",
    name: "Matcha Lab",
    niche: "Thé matcha bio",
    language: "français",
    mode: "start",
    status: "ready",
    shopConnectionId: null,
    theme: { colors: { primary: "#17301f", accent: "#5f9e47", background: "#f2f6ee" }, headingFont: "DM Sans", bodyFont: "DM Sans" },
    plan: { ...samplePlan("Matcha Lab", "Matcha"), brand: { ...samplePlan("Matcha Lab", "Matcha").brand, colors: { primary: "#17301f", accent: "#5f9e47", background: "#f2f6ee" } } },
    previewUrl: null,
    liveUrl: null,
    createdAt: ago(3),
    updatedAt: ago(3),
  },
];

export function seedMetrics(storeId: string, range: StoreMetrics["range"]): StoreMetrics {
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const base = storeId === "lumea" ? 420 : storeId === "nordik" ? 180 : 0;
  // Série déterministe (pas de Math.random) pour un rendu stable entre serveur et client.
  const series = Array.from({ length: days }, (_, i) => {
    const t = i / Math.max(days - 1, 1);
    const wave = Math.sin(i * 1.7) * 0.12 + Math.sin(i * 0.45) * 0.08;
    const sessions = Math.round(base * (0.85 + 0.3 * t + wave));
    const conversionRate = base ? +(1.4 + 2.4 * t + wave * 2).toFixed(2) : 0;
    const orders = Math.round((sessions * conversionRate) / 100);
    return {
      date: new Date(now - (days - 1 - i) * 86_400_000).toISOString().slice(0, 10),
      sessions,
      orders,
      revenue: orders * 2890,
      conversionRate,
    };
  });
  const sum = (k: "sessions" | "orders" | "revenue") => series.reduce((s, p) => s + p[k], 0);
  const sessions = sum("sessions");
  const orders = sum("orders");
  const revenue = sum("revenue");
  const totals = {
    sessions,
    orders,
    revenue,
    conversionRate: sessions ? +((orders / sessions) * 100).toFixed(2) : 0,
    averageOrderValue: orders ? Math.round(revenue / orders) : 0,
  };
  const previous = {
    sessions: Math.round(sessions * 0.82),
    orders: Math.round(orders * 0.55),
    revenue: Math.round(revenue * 0.52),
    conversionRate: +(totals.conversionRate * 0.62).toFixed(2),
    averageOrderValue: Math.round(totals.averageOrderValue * 0.94),
  };
  return { range, totals, previous, series };
}

export const seedRecommendations = (storeId: string): Recommendation[] => [
  {
    id: `${storeId}_r1`,
    storeId,
    title: "Remonter le prix et le bouton d'achat au-dessus de la galerie sur mobile",
    rationale: "68 % des visites viennent du mobile et le bouton n'apparaît qu'après deux écrans de défilement.",
    area: "product-page",
    expectedImpact: "high",
    status: "proposed",
    createdAt: ago(0.2),
  },
  {
    id: `${storeId}_r2`,
    storeId,
    title: "Proposer le lot de 3 directement sous le prix",
    rationale: "Le panier moyen stagne à 1,2 article ; le lot est aujourd'hui caché en bas de page.",
    area: "offer",
    expectedImpact: "medium",
    status: "proposed",
    createdAt: ago(0.2),
  },
  {
    id: `${storeId}_r3`,
    storeId,
    title: "Ajouter la réponse « ça colle ? » dans la FAQ produit",
    rationale: "C'est la question la plus posée par e-mail cette semaine.",
    area: "copy",
    expectedImpact: "low",
    status: "applied",
    createdAt: ago(2),
  },
];

// Visuels de remplacement générés localement (pas de dépendance réseau).
const PALETTES = [["#f4d6d9", "#c8506a"], ["#efe4d6", "#b9813f"], ["#dfeee0", "#5f9e47"], ["#e2e6f5", "#4b62c9"], ["#f6e7d2", "#d9822b"], ["#ece0f2", "#8a4fb0"]];
const img = (seed: string, w = 800, h = 800) => {
  const n = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0);
  const [a, b] = PALETTES[n % PALETTES.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><circle cx="${w * 0.62}" cy="${h * 0.45}" r="${Math.min(w, h) * 0.22}" fill="#fff" fill-opacity=".35"/><rect x="${w * 0.3}" y="${h * 0.3}" width="${w * 0.16}" height="${h * 0.42}" rx="${w * 0.03}" fill="#fff" fill-opacity=".7"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export const seedAssets = (storeId: string): Asset[] =>
  ["packshot", "texture", "lifestyle", "banner", "flatlay", "detail"].map((k, i) => ({
    id: `${storeId}_a${i}`,
    storeId,
    kind: k === "banner" ? "banner" : k === "lifestyle" ? "lifestyle" : "product",
    url: img(`${storeId}-${k}`, k === "banner" ? 1600 : 800, k === "banner" ? 900 : 800),
    width: k === "banner" ? 1600 : 800,
    height: k === "banner" ? 900 : 800,
    prompt: k === "banner" ? "Bannière lumière du matin, tons rosés" : null,
    createdAt: ago(i),
  }));
