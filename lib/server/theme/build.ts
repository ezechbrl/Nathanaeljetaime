import { strToU8, zipSync } from "fflate";
import type { StorePlan } from "@/lib/store-schema";
import { staticThemeFiles } from "./files";

export type ThemeContext = {
  plan: StorePlan;
  theme: { colors: { primary: string; accent: string; background: string }; headingFont: string; bodyFont: string };
  productHandle?: string;
  aboutHandle?: string;
  faqHandle?: string;
};

const SERIF = /serif|fraunces|playfair|cormorant|garamond|bodoni|lora|libre baskerville|dm serif/i;

// Texte lisible (blanc ou presque noir) sur une couleur donnée.
function onColor(hex: string) {
  const h = hex.replace("#", "").padEnd(6, "0");
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = (parseInt(h.slice(i, i + 2), 16) || 0) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.45 ? "#141414" : "#ffffff";
}

const plain = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
const blocks = <T,>(items: T[], type: string, settings: (x: T) => Record<string, string>) => {
  const out: Record<string, { type: string; settings: Record<string, string> }> = {};
  items.forEach((x, i) => { out[`${type}_${i + 1}`] = { type, settings: settings(x) }; });
  return { blocks: out, block_order: Object.keys(out) };
};

// Contenu propre à la boutique : réglages globaux et modèles de page.
export function themeContent(ctx: ThemeContext): Record<string, string> {
  const { plan, theme } = ctx;
  const product = ctx.productHandle;
  const aboutUrl = ctx.aboutHandle ? `/pages/${ctx.aboutHandle}` : "";
  const faqUrl = ctx.faqHandle ? `/pages/${ctx.faqHandle}` : "";
  const shopUrl = product ? `/products/${product}` : "/collections/all";
  const offers = plan.strategy.offers;
  const faqItems = [...plan.faq, ...plan.strategy.objections.map((o) => ({ question: o.objection, answer: o.answer }))].slice(0, 10);
  const freeShip = offers.map((o) => (/livraison|shipping|envío|versand|spedizione/i.test(o) ? o.match(/(\d+(?:[.,]\d+)?)\s?(?:€|eur|\$)/i) : null)).find(Boolean);
  const freeShippingThreshold = freeShip ? Math.round(Number(freeShip[1].replace(",", "."))) : 0;
  const shippingHtml = `<p><strong>Livraison</strong> : suivie, avec un numéro de suivi dès l'expédition.${freeShippingThreshold ? ` Offerte dès ${freeShippingThreshold} €.` : ""}</p><p><strong>Retours</strong> : 30 jours pour changer d'avis.</p>`;
  const trust = {
    blocks: {
      t1: { type: "item", settings: { icon: "truck", title: "Livraison suivie", text: freeShippingThreshold ? `Offerte dès ${freeShippingThreshold} €` : "Expédiée rapidement" } },
      t2: { type: "item", settings: { icon: "return", title: "30 jours", text: "Pour changer d'avis" } },
      t3: { type: "item", settings: { icon: "lock", title: "Paiement sécurisé", text: "Carte, Apple Pay, PayPal" } },
      t4: { type: "item", settings: { icon: "chat", title: "Une question ?", text: "On répond vite" } },
    },
    block_order: ["t1", "t2", "t3", "t4"],
  };
  const marqueeItems = [...offers, ...plan.homepage.benefits.map((b) => b.title)].slice(0, 6);
  const story = { title: plan.aboutPage.title, text: clip(plain(plan.aboutPage.bodyHtml), 320) };
  const reassure = { r1_title: "Livraison", r1_text: "Suivie, partout en France", r2_title: "Retours", r2_text: "30 jours pour changer d'avis", r3_title: "Paiement", r3_text: "100 % sécurisé" };

  const settingsData = {
    current: {
      brand_name: plan.brand.name,
      color_primary: theme.colors.primary,
      color_accent: theme.colors.accent,
      color_on_accent: onColor(theme.colors.accent),
      color_background: theme.colors.background,
      heading_font: theme.headingFont,
      heading_style: SERIF.test(theme.headingFont) ? "serif" : "sans",
      body_font: theme.bodyFont,
      free_shipping_threshold: freeShippingThreshold,
      sections: {
        announcement: { type: "announcement", settings: { text: clip(offers[0] ?? plan.brand.tagline, 120) } },
        header: { type: "header", settings: { shop_url: shopUrl, about_url: aboutUrl, about_label: "Notre histoire", faq_url: faqUrl } },
        footer: { type: "footer", settings: { tagline: plan.brand.tagline, about_url: aboutUrl, faq_url: faqUrl } },
      },
    },
  };

  const faqSection = (title: string) => ({ type: "faq", settings: { eyebrow: "FAQ", title, open_first: true }, ...blocks(faqItems, "q", (f) => ({ question: clip(f.question, 250), answer: f.answer })) });

  const lifestyle = (eyebrow: string, title: string, text: string, reverse: boolean, hint: string, cta = "", url = "") => ({ type: "lifestyle", settings: { ...(product ? { product } : {}), media_hint: hint, reverse, eyebrow, title, text, cta, url } });

  const index = {
    sections: {
      hero: { type: "hero", settings: { eyebrow: plan.brand.tagline, title: plan.homepage.heroTitle, subtitle: plan.homepage.heroSubtitle, cta: plan.homepage.ctaLabel, ...(product ? { product } : {}), t1: clip(offers[0] ?? "", 60), t2: clip(offers[1] ?? "", 60), t3: clip(offers[2] ?? "", 60) } },
      marquee: { type: "marquee", settings: { speed: 35 }, ...blocks(marqueeItems, "item", (t) => ({ text: clip(t, 60) })) },
      benefits: { type: "benefits", settings: { eyebrow: "Pourquoi nous", title: plan.strategy.promise }, ...blocks(plan.homepage.benefits.slice(0, 6), "benefit", (b) => ({ title: b.title, text: b.text })) },
      ...(product ? { featured: { type: "featured-product", settings: { product, eyebrow: "Notre produit", add_label: "Ajouter au panier", ...reassure }, ...blocks(plan.product.bulletPoints.slice(0, 6), "bullet", (t) => ({ text: t })) } } : {}),
      story: lifestyle("Notre histoire", story.title, story.text, false, "situation", aboutUrl ? "Lire notre histoire" : "", aboutUrl),
      trust: { type: "trust", settings: {}, ...trust },
      promise: { type: "promise", settings: { text: plan.strategy.promise, cta: plan.homepage.ctaLabel, url: shopUrl } },
      faq: faqSection("Tes questions, nos réponses"),
      news: { type: "newsletter", settings: { eyebrow: "Restons en contact", title: "Les nouveautés en avant-première", text: `Reçois les nouveautés de ${plan.brand.name}, sans spam.`, cta: "Je m'inscris" } },
    },
    order: ["hero", "marquee", "benefits", ...(product ? ["featured"] : []), "story", "trust", "promise", "faq", "news"],
  };

  const productBlocks = [
    ...plan.product.bulletPoints.slice(0, 6).map((text) => ({ type: "bullet", settings: { text } })),
    ...offers.filter((o) => /lot|pack|bundle|offert|achet/i.test(o)).slice(0, 2).map((text) => ({ type: "offer", settings: { text } })),
  ];
  const productTpl = {
    sections: {
      main: { type: "main-product", settings: { subtitle: plan.product.subtitle, add_label: "Ajouter au panier", sticky: true, shipping: shippingHtml, ...reassure }, blocks: Object.fromEntries(productBlocks.map((b, i) => [`b${i + 1}`, b])), block_order: productBlocks.map((_, i) => `b${i + 1}`) },
      trust: { type: "trust", settings: {}, ...trust },
      benefits: { type: "benefits", settings: { eyebrow: "Ce qui change", title: plan.homepage.heroTitle }, ...blocks(plan.homepage.benefits.slice(0, 3), "benefit", (b) => ({ title: b.title, text: b.text })) },
      detail: lifestyle("Dans le détail", plan.product.subtitle || plan.product.title, clip(plan.product.bulletPoints.join(" · "), 300), true, "détail"),
      faq: faqSection("Questions fréquentes"),
    },
    order: ["main", "trust", "benefits", "detail", "faq"],
  };

  const simple = (type: string) => JSON.stringify({ sections: { main: { type, settings: {} } }, order: ["main"] }, null, 2);

  return {
    "config/settings_data.json": JSON.stringify(settingsData, null, 2),
    "templates/index.json": JSON.stringify(index, null, 2),
    "templates/product.json": JSON.stringify(productTpl, null, 2),
    "templates/page.json": simple("main-page"),
    "templates/page.faq.json": JSON.stringify({ sections: { faq: faqSection("Questions fréquentes") }, order: ["faq"] }, null, 2),
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
