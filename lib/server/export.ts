import "server-only";
import type { StorePlan } from "@/lib/store-schema";
import { slotOf, type Slot } from "./images";
import { bundlePrices, BUNDLE_OPTION, parsePrice } from "./shopify";
import { db, must } from "./supabase";
import { buildThemeZip, type ThemeContext } from "./theme/build";
import type { StoreRow } from "./auth";
import { HttpError } from "./http";

// Boutique à télécharger (sans app Shopify) : un fichier de produits (CSV au format d'import de Shopify)
// et un thème .zip qui contient ses propres photos. Le marchand importe les deux dans son admin Shopify.

type AssetRow = { url: string; kind: string; storage_path: string | null };

// Ordre des photos de la fiche produit : celles du marchand d'abord, puis packshot, détail, en situation.
const GALLERY: Record<string, number> = { upload: 0, packshot: 1, white: 2, life1: 3, studio: 4, moment1: 5, life2: 6, moment2: 7, detail: 8, inuse: 9 };
// Visuels du thème (page d'accueil) : héros, bannière de fin, scènes de vie.
const THEME_SLOTS: Slot[] = ["hero", "moment3", "life1", "life2", "life3"];

export async function storeVisuals(store: StoreRow) {
  const plan = store.plan as StorePlan;
  const assets = must(await db().from("assets").select("url, kind, storage_path").eq("store_id", store.id).order("created_at")) as AssetRow[];
  let productIndex = 0;
  const tagged = assets.map((a) => ({ ...a, slot: a.kind === "upload" ? null : slotOf(a, a.kind === "product" ? productIndex++ : 0) }));
  const title = plan.product.title;
  const gallery = tagged
    .filter((a) => a.kind === "upload" || (a.slot && a.slot in GALLERY))
    .sort((x, y) => GALLERY[x.slot ?? "upload"] - GALLERY[y.slot ?? "upload"])
    .slice(0, 10)
    .map((a) => ({ url: a.url, alt: a.slot === "detail" ? `${title} — détail` : a.slot === "inuse" || a.slot?.startsWith("life") ? `${title} — en situation` : title }));
  const scenes: Partial<Record<Slot, string>> = {};
  for (const a of tagged) if (a.slot && THEME_SLOTS.includes(a.slot)) scenes[a.slot] = a.url; // la plus récente l'emporte
  return { gallery, scenes };
}

// Adresse du produit dans la boutique (/products/…), la même dans le fichier produits et dans le thème.
export function productHandle(plan: StorePlan) {
  const base = (plan.product.title || plan.brand.name || "produit").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
  return base || "produit";
}

export function checkSellable(plan: StorePlan) {
  if (parsePrice(plan.product.price) <= 0) throw new HttpError(422, "invalid_plan", `Le prix du produit est vide ou à 0 € (« ${plan.product.price} »). Corrige-le dans l'éditeur IA (ex. « Mets le prix à 59,90 € »), puis télécharge à nouveau.`);
  if (plan.product.title.trim().length < 3) throw new HttpError(422, "invalid_plan", `Le nom du produit est trop court (« ${plan.product.title} »). Corrige-le dans l'éditeur IA, puis télécharge à nouveau.`);
}

const COLUMNS = [
  "Handle", "Title", "Body (HTML)", "Vendor", "Type", "Tags", "Published", "Option1 Name", "Option1 Value",
  "Variant SKU", "Variant Grams", "Variant Inventory Tracker", "Variant Inventory Qty", "Variant Inventory Policy", "Variant Fulfillment Service",
  "Variant Price", "Variant Compare At Price", "Variant Requires Shipping", "Variant Taxable",
  "Image Src", "Image Position", "Image Alt Text", "SEO Title", "SEO Description", "Status",
] as const;
type Row = Partial<Record<(typeof COLUMNS)[number], string>>;
const cell = (v: string | undefined) => (v == null || v === "" ? "" : /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

// Fichier produits au format CSV de Shopify (Produits → Importer).
export function productCsv(plan: StorePlan, handle: string, gallery: { url: string; alt: string }[]) {
  const p = plan.product;
  const unit = parsePrice(p.price);
  const cmp = parsePrice(p.compareAtPrice);
  const offers = (p.bundles?.length ?? 0) > 1 ? bundlePrices(plan) : [];
  const variants = offers.length
    ? offers.map((o) => ({ option: o.label, price: o.price, compare: o.compareAtPrice ?? "" }))
    : [{ option: "Default Title", price: unit.toFixed(2), compare: cmp > unit ? cmp.toFixed(2) : "" }];
  const variantCells = (v: (typeof variants)[number]): Row => ({
    "Option1 Value": v.option, "Variant Grams": "0", "Variant Inventory Qty": "", "Variant Inventory Policy": "continue",
    "Variant Fulfillment Service": "manual", "Variant Price": v.price, "Variant Compare At Price": v.compare, "Variant Requires Shipping": "TRUE", "Variant Taxable": "TRUE",
  });
  const rows: Row[] = [];
  const count = Math.max(variants.length, gallery.length, 1);
  for (let i = 0; i < count; i++) {
    const row: Row = { Handle: handle };
    if (i === 0) {
      Object.assign(row, {
        Title: p.title, "Body (HTML)": p.descriptionHtml, Vendor: plan.brand.name, Type: "", Tags: (p.tags ?? []).join(", "), Published: "TRUE",
        "Option1 Name": offers.length ? BUNDLE_OPTION : "Title", "SEO Title": p.seoTitle ?? "", "SEO Description": p.seoDescription ?? "", Status: "active",
      });
    }
    if (variants[i]) Object.assign(row, variantCells(variants[i]));
    if (gallery[i]) Object.assign(row, { "Image Src": gallery[i].url, "Image Position": String(i + 1), "Image Alt Text": gallery[i].alt });
    rows.push(row);
  }
  return "﻿" + [COLUMNS.join(","), ...rows.map((r) => COLUMNS.map((c) => cell(r[c])).join(","))].join("\r\n") + "\r\n";
}

// Thème .zip avec ses propres photos (dossier assets/) : rien à envoyer dans les fichiers Shopify.
export async function downloadableThemeZip(store: StoreRow, scenes: Partial<Record<Slot, string>>) {
  const binaries: Record<string, Uint8Array> = {};
  const assetFiles: Record<string, string> = {};
  await Promise.all(Object.entries(scenes).map(async ([slot, url]) => {
    try {
      const res = await fetch(url!);
      if (!res.ok) return;
      const type = res.headers.get("content-type") ?? "";
      const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg";
      const name = `vigenia-${slot}.${ext}`;
      binaries[`assets/${name}`] = new Uint8Array(await res.arrayBuffer());
      assetFiles[slot] = name;
    } catch (e) {
      console.warn(`Visuel ${slot} non ajouté au thème :`, (e as Error).message);
    }
  }));
  const plan = store.plan as StorePlan;
  const ctx: ThemeContext = { plan, theme: store.theme as ThemeContext["theme"], productHandle: productHandle(plan), language: store.language ?? undefined, assetFiles };
  return buildThemeZip(ctx, binaries);
}

export const fileSlug = (name: string) => String(name || "boutique").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "boutique";
