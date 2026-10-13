"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import type { Asset, Store } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { sanitizeHtml } from "@/lib/sanitize";

export type PreviewPage = "accueil" | "produit" | "faq" | "a-propos";

const SERIF = new Set(["Instrument Serif", "Fraunces", "Playfair Display", "Cormorant"]);

// Rendu de la boutique générée, à partir du plan (contenu) et du thème (couleurs, polices).
export function StorePreview({ store, page = "accueil", device = "auto", assets = [], className }: { store: Store; page?: PreviewPage; device?: "desktop" | "mobile" | "auto"; assets?: Asset[]; className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(false);
  // En mode "auto", la mise en page mobile s'active quand la place manque.
  useEffect(() => {
    const el = rootRef.current?.parentElement;
    if (!el || device !== "auto") return;
    const ro = new ResizeObserver(([e]) => setNarrow(e.contentRect.width < 640));
    ro.observe(el);
    return () => ro.disconnect();
  }, [device]);
  const plan = store.plan;
  if (!plan) return null;
  const { primary, accent, background } = store.theme.colors;
  const heading = SERIF.has(store.theme.headingFont) ? "font-serif" : "font-sans";
  const mobile = device === "mobile" || (device === "auto" && narrow);
  const hero = assets.find((a) => a.kind === "banner") ?? assets[0];
  const productImg = assets.find((a) => a.kind === "product") ?? assets[0];

  const Img = ({ a, className: c }: { a?: Asset; className?: string }) =>
    a ? <img src={a.url} alt="" className={cn("h-full w-full object-cover", c)} /> : <div className={cn("h-full w-full", c)} style={{ background: `linear-gradient(150deg, ${accent}33, ${accent}99)` }} />;

  return (
    <div ref={rootRef} className={cn("overflow-hidden text-left transition-[max-width] duration-500 ease-out", device === "mobile" ? "mx-auto max-w-[390px]" : "max-w-none", className)} style={{ background, color: primary }}>
      <div className="py-2 text-center text-[11px] tracking-wide" style={{ background: primary, color: background }}>
        {plan.strategy.offers[0] ?? "Livraison offerte"}
      </div>
      <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: `${primary}14` }}>
        <span className={cn("text-xl tracking-tight", heading, heading === "font-serif" && "italic")}>{plan.brand.name}</span>
        {!mobile && <nav className="flex gap-6 text-[13px] opacity-70"><span>Boutique</span><span>Notre histoire</span><span>FAQ</span></nav>}
        <span className="text-[13px] opacity-70">Panier (0)</span>
      </div>

      {page === "accueil" && (
        <>
          <section className={cn("grid items-center gap-8 px-5 py-12", !mobile && "grid-cols-2 px-10 py-16")}>
            <div>
              <h2 className={cn("text-[2.4rem] leading-[1.02] tracking-[-0.03em]", heading, mobile && "text-[2rem]")}>{plan.homepage.heroTitle}</h2>
              <p className="mt-4 text-[15px] leading-relaxed opacity-70">{plan.homepage.heroSubtitle}</p>
              <span className="mt-7 inline-block rounded-full px-6 py-3 text-sm font-medium" style={{ background: accent, color: background }}>{plan.homepage.ctaLabel}</span>
            </div>
            <div className="aspect-[4/3.4] overflow-hidden rounded-lg"><Img a={hero} /></div>
          </section>
          <section className={cn("grid gap-4 px-5 pb-12", !mobile && "grid-cols-3 px-10")}>
            {plan.homepage.benefits.map((b) => (
              <div key={b.title} className="rounded-lg p-5" style={{ background: `${primary}08` }}>
                <p className="font-medium">{b.title}</p>
                <p className="mt-1.5 text-sm opacity-70">{b.text}</p>
              </div>
            ))}
          </section>
          <section className="px-5 pb-14 text-center" style={{ paddingInline: mobile ? undefined : "2.5rem" }}>
            <p className={cn("text-2xl tracking-tight", heading)}>{plan.strategy.promise}</p>
          </section>
        </>
      )}

      {page === "produit" && (
        <section className={cn("grid gap-8 px-5 py-8", !mobile && "grid-cols-[1.1fr_1fr] px-10 py-12")}>
          <div className="aspect-square overflow-hidden rounded-lg"><Img a={productImg} /></div>
          <div>
            <h2 className={cn("text-[1.9rem] leading-tight tracking-[-0.02em]", heading)}>{plan.product.title}</h2>
            <p className="mt-1 text-sm opacity-60">{plan.product.subtitle}</p>
            <p className="mt-4 text-2xl">
              {Number(plan.product.price).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              {plan.product.compareAtPrice && <s className="ml-2 text-base opacity-40">{Number(plan.product.compareAtPrice).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</s>}
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              {plan.product.bulletPoints.map((b) => <li key={b} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accent }} />{b}</li>)}
            </ul>
            {plan.strategy.offers.filter((o) => /lot|bundle|pack/i.test(o)).map((o) => (
              <div key={o} className="mt-5 rounded-lg border-2 p-3 text-sm" style={{ borderColor: accent }}>{o}</div>
            ))}
            <span className="mt-6 block rounded-full py-3.5 text-center text-sm font-medium" style={{ background: accent, color: background }}>Ajouter au panier</span>
            <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] opacity-70">
              <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" /> 48-72 h</span>
              <span className="flex items-center gap-1.5"><RotateCcw className="h-3.5 w-3.5" /> 30 jours</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Paiement sécurisé</span>
            </div>
            <div className="prose-store mt-6 border-t pt-5 text-sm opacity-80" style={{ borderColor: `${primary}14` }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(plan.product.descriptionHtml) }} />
          </div>
        </section>
      )}

      {page === "faq" && (
        <section className={cn("px-5 py-10", !mobile && "px-10 py-14")}>
          <h2 className={cn("text-3xl tracking-tight", heading)}>Questions fréquentes</h2>
          <div className="mt-6 divide-y" style={{ borderColor: `${primary}14` }}>
            {[...plan.faq, ...plan.strategy.objections.map((o) => ({ question: o.objection, answer: o.answer }))].map((f) => (
              <div key={f.question} className="py-4" style={{ borderColor: `${primary}14` }}>
                <p className="font-medium">{f.question}</p>
                <p className="mt-1 text-sm opacity-70">{f.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {page === "a-propos" && (
        <section className={cn("px-5 py-10", !mobile && "mx-auto max-w-2xl py-16")}>
          <h2 className={cn("text-3xl tracking-tight", heading)}>{plan.aboutPage.title}</h2>
          <div className="prose-store mt-5 text-[15px] leading-relaxed opacity-80" dangerouslySetInnerHTML={{ __html: sanitizeHtml(plan.aboutPage.bodyHtml) }} />
        </section>
      )}

      <footer className="px-5 py-6 text-center text-[11px] opacity-50" style={{ background: `${primary}08` }}>© {plan.brand.name} · {plan.brand.tagline}</footer>
    </div>
  );
}

// Miniature (aperçu réduit) pour les cartes.
export function StoreThumb({ store, className }: { store: Store; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => el.style.setProperty("--thumb-scale", String(e.contentRect.width / 1000)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className={cn("relative aspect-[16/10] overflow-hidden rounded-[10px] border border-white/[0.08]", className)} style={{ background: store.theme.colors.background }}>
      {store.plan ? (
        <div className="pointer-events-none absolute left-0 top-0 w-[1000px] origin-top-left" style={{ transform: "scale(var(--thumb-scale, 0.3))" }}>
          <StorePreview store={store} device="desktop" />
        </div>
      ) : (
        <div className="grid h-full place-items-center bg-bg-3">
          <div className="h-2 w-24 animate-shimmer rounded bg-[linear-gradient(90deg,rgb(255_255_255/0.05),rgb(0_166_118/0.4),rgb(255_255_255/0.05))] bg-[length:200%_100%]" />
        </div>
      )}
    </div>
  );
}
