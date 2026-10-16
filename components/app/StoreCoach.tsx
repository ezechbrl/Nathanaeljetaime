"use client";

import { ArrowRight, Check, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Asset, Store } from "@/lib/api/types";
import { cn } from "@/lib/cn";

const priceOk = (v: string | undefined) => Number(String(v ?? "").replace(/[^\d,.]/g, "").replace(",", ".")) > 0;

// Panneau « coach » du tableau de bord : un score de boutique concret (vérifié sur le contenu réel)
// et des idées d'amélioration cliquables qui ouvrent l'éditeur IA avec la demande déjà écrite.
export function StoreCoach({ store, assets }: { store: Store; assets: Asset[] | undefined }) {
  const plan = store.plan!;
  const editor = (q: string) => `/app/boutiques/${store.id}/editeur?q=${encodeURIComponent(q)}`;
  const photos = (assets ?? []).length;
  const p = plan.product;

  const checks = [
    { ok: p.title.trim().length >= 3 && p.title.trim().toLowerCase() !== "x", label: "Un vrai nom de produit", href: editor(`Donne un nom clair et vendeur au produit (aujourd'hui : « ${p.title} »)`) },
    { ok: priceOk(p.price), label: "Un prix de vente", href: editor("Mets le prix du produit à ") },
    { ok: photos >= 6, label: `Au moins 6 photos (${photos})`, href: `/app/boutiques/${store.id}/studio` },
    { ok: !!p.seoTitle?.trim() && !!p.seoDescription?.trim(), label: "Titre et description Google", href: editor("Complète le titre SEO et la description SEO du produit") },
    { ok: (p.bundles?.length ?? 0) > 1, label: "Une offre par lot", href: editor("Ajoute un lot de 2 à −10 % et un lot de 3 à −20 %") },
    { ok: !!p.guarantee?.trim(), label: "Une garantie rassurante", href: editor("Ajoute une garantie satisfait ou remboursé 30 jours") },
    { ok: store.status === "published", label: "Boutique publiée sur Shopify", href: null },
  ];
  const score = Math.round((100 * checks.filter((c) => c.ok).length) / checks.length);

  // Idées tirées du contenu de la boutique (objections, offres, promesse).
  const ideas = useMemo(() => [
    ...plan.strategy.objections.slice(0, 3).map((o) => `Ajoute sur l'accueil un encadré qui répond à « ${o.objection} »`),
    ...plan.strategy.offers.slice(0, 2).map((o) => `Mets davantage en avant l'offre « ${o} » en haut de la page`),
    `Rends le titre d'accueil plus percutant (aujourd'hui : « ${plan.homepage.heroTitle} »)`,
    `Ajoute un encadré « Pourquoi ${plan.brand.name} ? » avec 4 raisons courtes`,
    "Raccourcis les textes de la fiche produit pour qu'elle se lise en 10 secondes",
    "Ajoute une comparaison avec l'alternative habituelle",
  ], [plan]);
  const [page, setPage] = useState(0);
  const shown = [0, 1, 2].map((i) => ideas[(page * 3 + i) % ideas.length]);

  const R = 26;
  const C = 2 * Math.PI * R;
  return (
    <section className="surface rounded-card p-5">
      <div className="flex items-center gap-4">
        <div className="relative grid h-16 w-16 shrink-0 place-items-center">
          <svg viewBox="0 0 64 64" className="absolute inset-0 -rotate-90">
            <circle cx="32" cy="32" r={R} fill="none" stroke="rgb(255 255 255 / .08)" strokeWidth="6" />
            <circle cx="32" cy="32" r={R} fill="none" stroke="rgb(var(--accent))" strokeWidth="6" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - score / 100)} className="transition-[stroke-dashoffset] duration-1000 ease-out" />
          </svg>
          <span className="text-lg font-semibold tabular-nums">{score}</span>
        </div>
        <div>
          <h2 className="font-medium">Score de ta boutique</h2>
          <p className="text-sm text-fg-muted">{score === 100 ? "Tout est prêt pour vendre !" : "Complète ce qui manque pour vendre plus."}</p>
        </div>
      </div>

      <ul className="mt-4 space-y-1">
        {checks.map((c) => {
          const row = (
            <>
              <span className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-full border", c.ok ? "border-accent bg-accent text-[#062b22]" : "border-white/20")}>{c.ok && <Check className="h-3 w-3" />}</span>
              <span className={cn("flex-1", c.ok ? "text-fg-muted line-through decoration-white/20" : "text-fg")}>{c.label}</span>
              {!c.ok && c.href && <ArrowRight className="h-3.5 w-3.5 text-accent opacity-0 transition-opacity group-hover:opacity-100" />}
            </>
          );
          return (
            <li key={c.label}>
              {!c.ok && c.href
                ? <Link href={c.href} className="group flex items-center gap-2.5 rounded-ctl px-2 py-1.5 text-sm hover:bg-white/[0.04]">{row}</Link>
                : <div className="flex items-center gap-2.5 px-2 py-1.5 text-sm">{row}</div>}
            </li>
          );
        })}
      </ul>

      <div className="mt-5 border-t border-white/[0.07] pt-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-medium"><Sparkles className="h-4 w-4 text-accent" /> Idées pour vendre plus</h3>
          <button type="button" onClick={() => setPage((n) => n + 1)} aria-label="Autres idées" className="grid h-7 w-7 place-items-center rounded-ctl text-fg-muted hover:bg-white/5 hover:text-fg"><RefreshCw className="h-3.5 w-3.5" /></button>
        </div>
        <ul key={page} className="mt-3 space-y-2">
          {shown.map((idea, i) => (
            <li key={idea} className="[animation:fade-in_.4s_ease-out_both]" style={{ animationDelay: `${i * 70}ms` }}>
              <Link href={editor(idea)} className="group block rounded-[12px] border border-white/[0.08] bg-white/[0.02] px-3 py-2.5 text-[13px] leading-snug transition-colors hover:border-accent/40 hover:bg-accent-deep/30">
                {idea}
                <span className="mt-1 flex items-center gap-1 text-xs text-accent">Appliquer avec l'IA <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" /></span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
