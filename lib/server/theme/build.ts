import { strToU8, zipSync } from "fflate";
import { toIcon, type IconName, type StorePlan } from "@/lib/store-schema";
import { staticThemeFiles } from "./files";
import { labelsFor } from "./labels";

export type ThemeContext = {
  plan: StorePlan;
  theme: { colors: { primary: string; accent: string; background: string }; headingFont: string; bodyFont: string };
  language?: string;
  productHandle?: string;
  aboutHandle?: string;
  faqHandle?: string;
  // Visuels envoyés dans les fichiers Shopify, par emplacement (hero, moment1…, story).
  files?: Record<string, { filename: string }>;
};

const SERIF = /serif|fraunces|playfair|cormorant|garamond|bodoni|lora|libre baskerville|dm serif/i;

const rgb = (hex: string) => {
  const h = hex.replace("#", "").padEnd(6, "0");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) || 0);
};
const toHex = (c: number[]) => `#${c.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("")}`;
const mix = (a: string, b: string, t: number) => { const [x, y] = [rgb(a), rgb(b)]; return toHex(x.map((v, i) => v + (y[i] - v) * t)); };

// Texte lisible (blanc ou presque noir) sur une couleur donnée.
function onColor(hex: string) {
  const [r, g, b] = rgb(hex).map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.45 ? "#141414" : "#ffffff";
}

// Nom d'une offre par quantité : le même côté variantes Shopify et côté thème.
export const bundleLabel = (b: { label: string; quantity: number }) => b.label.trim() || String(b.quantity);

const plain = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
// Les réglages « richtext » de Shopify n'acceptent que des paragraphes et des listes.
const richtext = (html: string) => {
  const h = html.replace(/<h[1-6][^>]*>/gi, "<p><strong>").replace(/<\/h[1-6]>/gi, "</strong></p>").trim();
  return /^<(p|ul|ol)[\s>]/i.test(h) ? h : `<p>${h}</p>`;
};
type Block = { type: string; settings: Record<string, unknown> };
const blocks = (list: Block[]) => {
  const out: Record<string, Block> = {};
  list.forEach((b, i) => { out[`${b.type}_${i + 1}`] = b; });
  return { blocks: out, block_order: Object.keys(out) };
};

// Drapeau d'un pays à partir de son code (FR → 🇫🇷).
const flag = (code?: string) => (code && /^[A-Za-z]{2}$/.test(code) ? String.fromCodePoint(...[...code.toUpperCase().replace("UK", "GB")].map((c) => 0x1f1a5 + c.charCodeAt(0))) : "");

const BENEFIT_ICONS: IconName[] = ["sparkle", "heart", "leaf", "shield", "clock", "star"];

// Contenu propre à la boutique : réglages globaux et modèles de page.
export function themeContent(ctx: ThemeContext): Record<string, string> {
  const { plan, theme } = ctx;
  const home = plan.homepage;
  const prod = plan.product;
  const L = labelsFor(ctx.language ?? "français");
  const product = ctx.productHandle;
  const shopUrl = product ? `/products/${product}` : "/collections/all";
  const file = (slot: string) => (ctx.files?.[slot] ? `shopify://shop_images/${ctx.files[slot].filename}` : undefined);
  const offers = plan.strategy.offers;
  const find = (re: RegExp) => offers.find((o) => re.test(o)) ?? "";
  const shipOffer = find(/livraison|shipping|envío|envio|versand|spedizione|verzending|portes/i);
  const returnOffer = find(/retour|return|échange|devolu|rückgabe|reso|retourn|troca/i);
  const freeShip = shipOffer.match(/(\d+(?:[.,]\d+)?)\s?(?:€|eur|\$|£)/i);
  const freeShippingThreshold = freeShip ? Math.round(Number(freeShip[1].replace(",", "."))) : 0;
  const faqItems = [...plan.faq, ...plan.strategy.objections.map((o) => ({ question: o.objection, answer: o.answer }))].slice(0, 10);

  const reviews = plan.reviews;
  const labels = Object.fromEntries(Object.entries(L).map(([k, v]) => [`label_${k}`, v]));
  const settingsData = {
    current: {
      brand_name: plan.brand.name,
      color_primary: theme.colors.primary,
      color_accent: theme.colors.accent,
      color_on_accent: onColor(theme.colors.accent),
      color_background: theme.colors.background,
      color_tint: mix(theme.colors.background, theme.colors.accent, 0.14),
      heading_font: theme.headingFont,
      heading_style: SERIF.test(theme.headingFont) ? "serif" : "sans",
      body_font: theme.bodyFont,
      free_shipping_threshold: freeShippingThreshold,
      ...(reviews && reviews.average >= 1 ? { rating: reviews.average.toFixed(1), rating_count: reviews.total } : {}),
      ...labels,
      sections: {
        announcement: { type: "announcement", ...blocks((home.announcements?.length ? home.announcements : [shipOffer, returnOffer, plan.brand.tagline].filter(Boolean)).slice(0, 3).map((text, i) => ({ type: "msg", settings: { icon: (["truck", "return", "gift"] as const)[i] ?? "sparkle", text: clip(text, 110) } }))) },
        header: { type: "header", settings: { scheme: "base", shop_url: shopUrl } },
        footer: { type: "footer", settings: { scheme: "dark", tagline: plan.brand.tagline } },
      },
    },
  };

  const faqSection = (title: string, scheme = "tint") => ({ type: "faq", settings: { scheme, eyebrow: "FAQ", title, open_first: true }, ...blocks(faqItems.map((f) => ({ type: "q", settings: { question: clip(f.question, 250), answer: f.answer } }))) });

  const features = home.features?.length
    ? home.features
    : home.benefits.map((b, i) => ({ icon: BENEFIT_ICONS[i % BENEFIT_ICONS.length], title: b.title, text: clip(b.text, 70) }));
  const featuresSection = { type: "features", settings: { scheme: "tint", title: home.featuresTitle ?? plan.brand.tagline, subtitle: home.featuresSubtitle ?? "" }, ...blocks(features.slice(0, 6).map((f) => ({ type: "feat", settings: { icon: toIcon(f.icon), title: f.title, text: f.text } }))) };

  const benefitsSection = {
    type: "image-list",
    settings: { scheme: "base", ...(product ? { product } : {}), media_hint: "situation", reverse: false, eyebrow: home.benefitsEyebrow ?? "", title: home.benefitsTitle ?? plan.strategy.promise, text: "", cta: home.ctaLabel, url: shopUrl, cta_style: "button" },
    ...blocks(home.benefits.slice(0, 5).map((b, i) => ({ type: "item", settings: { icon: home.benefitIcons?.[i] ? toIcon(home.benefitIcons[i]) : BENEFIT_ICONS[i % BENEFIT_ICONS.length], title: b.title, text: b.text } }))),
  };

  const comparisonSection = home.comparison && {
    type: "comparison",
    settings: { scheme: "dark", eyebrow: "", title: home.comparison.title, text: home.comparison.text, us: home.comparison.usLabel, them: home.comparison.themLabel },
    ...blocks(home.comparison.rows.slice(0, 6).map((r) => ({ type: "row", settings: { us: r.us, them: r.them } }))),
  };

  const productSettings = {
    subtitle: prod.subtitle,
    bundle_label: "",
    sticky: true,
    dynamic_checkout: false,
    show_description: true,
    guarantee: prod.guarantee ?? "",
    t1: shipOffer ? clip(shipOffer, 80) : "",
    t2: returnOffer ? clip(returnOffer, 80) : "",
    t3: L.secure,
    t4: "",
  };
  const productBlocks = blocks([
    ...prod.bulletPoints.slice(0, 6).map((text) => ({ type: "bullet", settings: { text } })),
    ...(prod.highlights ?? []).slice(0, 3).map((h) => ({ type: "highlight", settings: { icon: toIcon(h.icon), title: h.title } })),
    ...((prod.bundles?.length ?? 0) > 1 ? prod.bundles! : []).slice(0, 4).map((b) => ({ type: "bundle", settings: { label: bundleLabel(b), quantity: b.quantity, badge: b.badge } })),
    ...(prod.details ?? []).slice(0, 5).map((d) => ({ type: "detail", settings: { title: d.title, content: richtext(d.html) } })),
  ]);

  const extras = Object.fromEntries((home.extraSections ?? []).slice(0, 4).map((x, i) => [`extra${i + 1}`, {
    type: "features",
    settings: { scheme: i % 2 ? "tint" : "base", title: x.title, subtitle: x.subtitle ?? "" },
    ...blocks(x.items.slice(0, 6).map((it) => ({ type: "feat", settings: { icon: "check", title: it.title, text: it.text } }))),
  }]));

  // Avis réels (acheteurs du produit chez le fournisseur), avec leur origine indiquée sous la section.
  const reviewsSection = {
    type: "testimonials",
    settings: { scheme: "base", title: "", note: reviews?.items.length ? L.reviews_note : "" },
    ...blocks((reviews?.items ?? []).slice(0, 9).map((r) => ({ type: "review", settings: { quote: r.text, author: r.author || "—", country: flag(r.country), stars: Math.min(5, Math.max(1, Math.round(r.rating))), ...(r.photo ? { photo: r.photo } : {}) } }))),
  };
  // Moments d'usage : une scène de vie par moment (personne de la cible qui utilise le produit).
  const moments = home.moments?.items.slice(0, 3).map((m, i) => ({ ...m, image: file(`life${i + 1}`) })) ?? [];
  const momentsSection = moments.some((m) => m.image) && {
    type: "moments",
    settings: { scheme: "base", title: home.moments!.title },
    ...blocks(moments.filter((m) => m.image).map((m) => ({ type: "moment", settings: { image: m.image, title: m.title, text: m.text ?? "" } }))),
  };

  const sections: Record<string, unknown> = {
    hero: { type: "hero", settings: { image: file("hero"), ...(product ? { product } : {}), eyebrow: plan.brand.tagline, title: home.heroTitle, subtitle: home.heroSubtitle, cta: home.ctaLabel }, ...blocks([shipOffer, returnOffer, prod.guarantee ?? ""].filter(Boolean).slice(0, 3).map((t, i) => ({ type: "trust", settings: { icon: (["truck", "return", "shield"] as const)[i], text: clip(t, 60) } }))) },
    features: featuresSection,
    benefits: benefitsSection,
    ...(momentsSection ? { moments: momentsSection } : {}),
    ...extras,
    ...(comparisonSection ? { comparison: comparisonSection } : {}),
    reviews: reviewsSection,
    ...(product ? { buy: { type: "featured-product", settings: { scheme: "tint", product, heading_tag: "h2", eyebrow: "", ...productSettings, sticky: false, bundle_label: "" }, ...productBlocks } } : {}),
    banner: { type: "image-banner", settings: { image: file("moment3") || file("hero"), title: home.finalCta?.title ?? plan.strategy.promise, text: home.finalCta?.text ?? "", cta: home.ctaLabel, url: shopUrl } },
  };
  const index = { sections, order: Object.keys(sections) };

  const productTpl = {
    sections: {
      main: { type: "main-product", settings: { scheme: "base", heading_tag: "h1", eyebrow: "", ...productSettings }, ...productBlocks },
      features: { ...featuresSection, settings: { ...featuresSection.settings, title: "" } },
      reviews: { ...reviewsSection, settings: { ...reviewsSection.settings, scheme: "tint" } },
      benefits: { ...benefitsSection, settings: { ...benefitsSection.settings, cta: "" } },
      ...(momentsSection ? { moments: momentsSection } : {}),
      ...(comparisonSection ? { comparison: comparisonSection } : {}),
    },
    order: ["main", "features", "reviews", "benefits", ...(momentsSection ? ["moments"] : []), ...(comparisonSection ? ["comparison"] : [])],
  };

  // Réglages vides (liens, images) retirés : Shopify refuse une valeur vide pour ces types.
  const EMPTYABLE = new Set(["image", "url", "about_url", "faq_url", "shop_url"]);
  const clean = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(clean);
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).filter(([k, x]) => x !== undefined && !(EMPTYABLE.has(k) && x === "")).map(([k, x]) => [k, clean(x)]));
    return v;
  };
  const json = (o: unknown) => JSON.stringify(clean(o), null, 2);
  const simple = (type: string) => JSON.stringify({ sections: { main: { type, settings: {} } }, order: ["main"] }, null, 2);

  return {
    "config/settings_data.json": json(settingsData),
    "templates/index.json": json(index),
    "templates/product.json": json(productTpl),
    "templates/page.json": simple("main-page"),
    "templates/page.faq.json": json({ sections: { faq: faqSection(L.faq, "base") }, order: ["faq"] }),
    "templates/collection.json": simple("main-collection"),
    "templates/list-collections.json": simple("main-list-collections"),
    "templates/cart.json": simple("main-cart"),
    "templates/404.json": simple("main-404"),
    "templates/search.json": simple("main-search"),
    "templates/blog.json": simple("main-blog"),
    "templates/article.json": simple("main-article"),
    "templates/password.json": JSON.stringify({ layout: "password", sections: { main: { type: "main-password", settings: {} } }, order: ["main"] }, null, 2),
  };
}

// Archive .zip du thème complet, au format attendu par Shopify (themeCreate).
export function buildThemeZip(ctx: ThemeContext): Uint8Array {
  const files = { ...staticThemeFiles(), ...themeContent(ctx) };
  return zipSync(Object.fromEntries(Object.entries(files).map(([path, src]) => [path, strToU8(src)])), { level: 6 });
}
