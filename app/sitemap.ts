import type { MetadataRoute } from "next";
import { POSTS } from "@/lib/content/blog";
import { LEGAL } from "@/lib/content/legal";
import { SHOWCASE } from "@/lib/content/showcase";

const base = (process.env.NEXT_PUBLIC_APP_URL ?? "https://vigenia.com").replace(/\/$/, "");

// Plan du site lu par Google : toutes les pages publiques du site vitrine.
export default function sitemap(): MetadataRoute.Sitemap {
  const pages: [string, number][] = [
    ["", 1], ["/tarifs", 0.9], ["/produit", 0.9], ["/boutique-shopify-cle-en-main", 0.9], ["/refonte-boutique-shopify", 0.8],
    ["/exemples", 0.8], ["/demo", 0.7], ["/blog", 0.7], ["/affiliation", 0.5], ["/fondateurs", 0.5], ["/nouveautes", 0.5], ["/contact", 0.4],
  ];
  return [
    ...pages.map(([path, priority]) => ({ url: `${base}${path}`, changeFrequency: "weekly" as const, priority })),
    ...POSTS.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.date, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...SHOWCASE.map((s) => ({ url: `${base}/exemples/${s.slug}`, changeFrequency: "monthly" as const, priority: 0.5 })),
    ...LEGAL.map((d) => ({ url: `${base}/legal/${d.slug}`, changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
