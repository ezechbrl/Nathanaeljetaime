"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { ALL_RANKINGS, type Tier } from "@/lib/content/rankings";
import { PRODUCT_PAGES, productSlug } from "@/lib/content/product-pages";
import { EXTRA_PRODUCTS } from "@/lib/content/product-pages-extra";
import { NICHES } from "@/lib/niches";

// Espace client : toutes les tier lists, avec pour chaque produit sa raison et un bouton pour créer sa boutique
// directement avec ce produit (le quiz garde l'idée et saute les questions de produit).
const COLORS: Record<Tier, string> = { S: "#ff5c7a", A: "#ffa94d", B: "#ffe066", C: "#8ce99a" };
const ALL = [...PRODUCT_PAGES, ...EXTRA_PRODUCTS];
const briefOf = (name: string) => {
  const extra = EXTRA_PRODUCTS.find((x) => x.name === name);
  if (extra) return extra.brief;
  for (const n of NICHES) { const p = n.products.find(([pn]) => pn === name); if (p) return p[1]; }
  return name;
};

export default function IdeasPage() {
  const [slug, setSlug] = useState(ALL_RANKINGS[0].slug);
  const r = ALL_RANKINGS.find((x) => x.slug === slug)!;
  return (
    <div className="mx-auto max-w-[1000px] px-5 pb-20 pt-8 sm:px-8">
      <h1 className="text-[clamp(1.7rem,1.2rem+1.6vw,2.4rem)] font-semibold tracking-[-0.03em]">Idées de produits</h1>
      <p className="mt-1 text-fg-muted">Nos classements S, A, B, C. Choisis un produit et crée ta boutique en un clic.</p>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
        {ALL_RANKINGS.map((x) => (
          <button key={x.slug} type="button" onClick={() => setSlug(x.slug)} className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] ${x.slug === slug ? "border-[#3dff9a] bg-[#3dff9a]/10 text-white" : "border-white/15 text-fg-muted hover:text-white"}`}>
            {x.h1.replace(/ \(tier list.*\)$/, "").replace("Les meilleurs produits ", "").replace("à vendre", "").trim() || x.h1}
          </button>
        ))}
      </div>

      <h2 className="mt-6 text-xl font-semibold">{r.h1}</h2>
      <p className="mt-1 text-sm text-fg-muted">{r.intro}</p>
      <div className="mt-5 space-y-3">
        {(["S", "A", "B", "C"] as Tier[]).map((t) => r.items.filter((i) => i.tier === t).map((i) => {
          const name = i.product ?? i.name;
          const why = i.why || ALL.find((p) => p.name === name)?.why || "";
          return (
            <div key={i.name} className="flex flex-col gap-3 rounded-[16px] border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] text-lg font-black text-black" style={{ background: COLORS[t] }}>{t}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{i.name}</p>
                <p className="text-[13.5px] text-fg-muted">{why}</p>
                {i.examples && <p className="mt-1 text-xs text-fg-faint">Exemples : {i.examples.join(", ")}</p>}
              </div>
              {i.product && (
                <Link href={`/quiz?${new URLSearchParams({ mode: "describe", brief: briefOf(i.product) })}`} className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-[linear-gradient(180deg,#14b886,#00876a)] px-4 py-2.5 text-sm font-semibold text-white">
                  Créer ma boutique <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              {i.product && <Link href={`/vendre/${productSlug(i.product)}`} className="text-center text-xs text-fg-muted underline-offset-4 hover:underline sm:w-20">Le guide</Link>}
            </div>
          );
        }))}
      </div>
    </div>
  );
}
