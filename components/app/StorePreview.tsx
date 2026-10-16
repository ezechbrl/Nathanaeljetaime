"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight, Award, Check, ChevronLeft, ChevronRight, Clock, Droplet, Feather, Flame, Gift, Hand, Heart, Home, Leaf, Lock, Moon,
  RefreshCw, RotateCcw, ShieldCheck, ShoppingBag, Smile, Sparkles, Star, Sun, Truck, X, Zap, type LucideIcon,
} from "lucide-react";
import type { Asset, Store } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { sanitizeHtml } from "@/lib/sanitize";
import type { IconName } from "@/lib/store-schema";

export type PreviewPage = "accueil" | "produit" | "faq" | "a-propos";

const SERIF = /serif|fraunces|playfair|cormorant|garamond|bodoni|lora/i;
const ICON: Record<IconName, LucideIcon> = {
  bolt: Zap, leaf: Leaf, heart: Heart, check: Check, shield: ShieldCheck, truck: Truck, star: Star, sparkle: Sparkles, drop: Droplet, sun: Sun,
  clock: Clock, gift: Gift, recycle: RefreshCw, hand: Hand, award: Award, feather: Feather, smile: Smile, home: Home, moon: Moon, flame: Flame,
};
const BENEFIT_ICONS: IconName[] = ["sparkle", "heart", "leaf", "shield", "clock", "star"];
const eur = (v: number) => v.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
const mix = (a: string, b: string, t: number) => {
  const p = (h: string) => [0, 2, 4].map((i) => parseInt(h.replace("#", "").padEnd(6, "0").slice(i, i + 2), 16) || 0);
  const [x, y] = [p(a), p(b)];
  return `#${x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("")}`;
};

// Visuels par emplacement (même logique que la publication) : héros, moments, histoire, galerie.
function pickImages(assets: Asset[]) {
  const by = (s: string) => assets.find((a) => a.slot === s);
  const products = assets.filter((a) => a.kind === "upload" || a.kind === "product" || a.slot === "inuse");
  const lifestyle = assets.filter((a) => a.kind === "lifestyle");
  return {
    hero: by("hero") ?? assets.find((a) => a.kind === "banner"),
    gallery: products.length ? products : assets.slice(0, 1),
    inuse: by("inuse") ?? lifestyle[0],
    moments: [1, 2, 3].map((i) => by(`moment${i}`) ?? lifestyle[i] ?? products[i]),
    story: by("story") ?? lifestyle.at(-1),
  };
}

// Rendu de la boutique générée, fidèle au thème Vitrio installé dans Shopify.
export function StorePreview({ store, page = "accueil", device = "auto", assets = [], className }: { store: Store; page?: PreviewPage; device?: "desktop" | "mobile" | "auto"; assets?: Asset[]; className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(false);
  const [shot, setShot] = useState(0);
  const [bundle, setBundle] = useState(0);
  const [open, setOpen] = useState(0);
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
  const tint = mix(background, accent, 0.14);
  const serif = SERIF.test(store.theme.headingFont);
  const H = serif ? "font-serif" : "font-sans font-bold";
  const mobile = device === "mobile" || (device === "auto" && narrow);
  const home = plan.homepage;
  const prod = plan.product;
  const imgs = pickImages(assets);
  const price = Number(prod.price) || 0;
  const cmp = Number(prod.compareAtPrice) || 0;
  const bundles = (prod.bundles?.length ?? 0) > 1 ? prod.bundles! : [];
  const pad = mobile ? "px-5" : "px-12";
  const sec = mobile ? "py-12" : "py-20";
  const offers = plan.strategy.offers;
  const shipOffer = offers.find((o) => /livraison|shipping/i.test(o));
  const returnOffer = offers.find((o) => /retour|return|échange/i.test(o));

  const Img = ({ a, className: c, ratio }: { a?: Asset; className?: string; ratio?: string }) => (
    <div className={cn("relative overflow-hidden rounded-[18px]", c)} style={{ aspectRatio: ratio, background: `linear-gradient(150deg, ${tint}, ${mix(background, accent, 0.35)})` }}>
      {a ? <img src={a.url} alt="" className="absolute inset-0 h-full w-full object-cover" /> : <div className="absolute left-1/2 top-1/2 h-[55%] w-[34%] -translate-x-1/2 -translate-y-1/2 rounded-[22%] shadow-xl" style={{ background: `linear-gradient(160deg, ${accent}, ${primary})` }} />}
    </div>
  );
  const Frame = ({ a, ratio, light = false }: { a?: Asset; ratio: string; light?: boolean }) => (
    <div className="rounded-[22px] border p-1.5" style={{ borderColor: light ? "rgb(255 255 255 / .2)" : `${primary}1f`, background: light ? "rgb(255 255 255 / .06)" : `${primary}0a` }}><Img a={a} ratio={ratio} /></div>
  );
  const Btn = ({ children, light = false }: { children: React.ReactNode; light?: boolean }) => (
    <span className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold shadow-lg" style={light ? { background, color: primary } : { background: accent, color: "#fff" }}>{children} <ArrowRight className="h-4 w-4" /></span>
  );
  const Eyebrow = ({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) => (
    <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: dark ? `${background}b3` : accent }}>{children}</p>
  );

  const productBlock = (
    <div className={cn("grid gap-8", !mobile && "grid-cols-[1.08fr_1fr] gap-12")}>
      <div className="space-y-3">
        <div className="relative">
          <Img a={imgs.gallery[shot % Math.max(imgs.gallery.length, 1)]} ratio="1" />
          {imgs.gallery.length > 1 && (
            <>
              <button type="button" onClick={() => setShot((s) => (s + imgs.gallery.length - 1) % imgs.gallery.length)} className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-black shadow" aria-label="Précédente"><ChevronLeft className="h-4 w-4" /></button>
              <button type="button" onClick={() => setShot((s) => (s + 1) % imgs.gallery.length)} className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-black shadow" aria-label="Suivante"><ChevronRight className="h-4 w-4" /></button>
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-2.5 py-0.5 text-[11px] text-white">{(shot % imgs.gallery.length) + 1} / {imgs.gallery.length}</span>
            </>
          )}
        </div>
        {imgs.gallery.length > 1 && (
          <div className="flex gap-2">{imgs.gallery.slice(0, 5).map((a, i) => <button type="button" key={a.id} onClick={() => setShot(i)} className="w-1/5 overflow-hidden rounded-xl border-2 transition-opacity" style={{ borderColor: i === shot % imgs.gallery.length ? accent : "transparent", opacity: i === shot % imgs.gallery.length ? 1 : 0.7 }}><img src={a.url} alt="" className="aspect-square w-full object-cover" /></button>)}</div>
        )}
        {prod.highlights?.length ? (
          <div className="grid grid-cols-3 gap-2 rounded-[18px] p-4" style={{ background: mix(background, accent, 0.18) }}>
            {prod.highlights.slice(0, 3).map((h) => { const I = ICON[h.icon as IconName] ?? Check; return <div key={h.title} className="grid justify-items-center gap-2 text-center text-[12px] font-semibold"><span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background, color: accent }}><I className="h-4 w-4" /></span>{h.title}</div>; })}
          </div>
        ) : null}
      </div>
      <div>
        <h2 className={cn("text-[2rem] leading-[1.05] tracking-[-0.02em]", H, mobile && "text-[1.7rem]")}>{prod.title}</h2>
        <p className="mt-2 text-[15px] opacity-70">{prod.subtitle}</p>
        <p className="mt-4 flex items-center gap-3 text-2xl font-bold">
          {eur(bundles.length ? price * bundles[bundle].quantity * (1 - bundles[bundle].discountPercent / 100) : price)}
          {!bundles.length && cmp > price && <><s className="text-base font-normal opacity-50">{eur(cmp)}</s><span className="rounded-full px-2.5 py-1 text-[11px] font-bold text-white" style={{ background: accent }}>-{Math.round((1 - price / cmp) * 100)} %</span></>}
        </p>
        <hr className="my-5" style={{ borderColor: `${primary}24` }} />
        <ul className="space-y-2.5 text-[15px]">{prod.bulletPoints.map((b) => <li key={b} className="flex gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accent }} />{b}</li>)}</ul>
        {bundles.length > 0 && (
          <div className="mt-6 space-y-3.5">
            {bundles.map((b, i) => {
              const total = price * b.quantity * (1 - b.discountPercent / 100);
              const full = (cmp > price ? cmp : price) * b.quantity;
              const on = i === bundle;
              return (
                <button type="button" key={b.quantity} onClick={() => setBundle(i)} className="relative grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[16px] border-[1.5px] p-3 text-left transition-all" style={{ borderColor: on ? accent : `${primary}29`, background: on ? mix(background, accent, 0.09) : "transparent", boxShadow: on ? `0 0 0 1px ${accent}` : undefined }}>
                  {b.badge && <span className="absolute -top-2.5 left-4 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ background: primary, color: background }}>{b.badge}</span>}
                  <span className="relative h-12 w-12 overflow-hidden rounded-[10px]"><Img a={imgs.gallery[0]} className="h-full rounded-none" /><span className="absolute bottom-0.5 right-0.5 rounded-full bg-white px-1.5 text-[10px] font-bold text-black">×{b.quantity}</span></span>
                  <span><span className="block text-[15px] font-bold">{b.label}</span><span className="text-sm"><strong>{eur(total)}</strong>{full > total + 0.01 && <s className="ml-2 opacity-50">{eur(full)}</s>}</span>{full > total + 0.01 && <span className="block text-xs font-semibold" style={{ color: accent }}>Économise {eur(full - total)}</span>}</span>
                  <span className="grid h-5 w-5 place-items-center rounded-full border-2" style={{ borderColor: on ? accent : `${primary}4d` }}>{on && <span className="h-2.5 w-2.5 rounded-full" style={{ background: accent }} />}</span>
                </button>
              );
            })}
          </div>
        )}
        <span className="mt-5 flex items-center justify-center rounded-full py-4 text-sm font-semibold text-white shadow-lg" style={{ background: accent }}>
          Ajouter au panier{bundles.length ? ` — ${eur(price * bundles[bundle].quantity * (1 - bundles[bundle].discountPercent / 100))}` : ""}
        </span>
        {prod.guarantee && <p className="mt-4 flex gap-2 border-t pt-4 text-sm" style={{ borderColor: `${primary}1f` }}><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accent }} />{prod.guarantee}</p>}
        <div className="mt-4 space-y-2.5 rounded-[18px] border p-4 text-[13px]" style={{ borderColor: `${primary}14`, background: `${primary}08` }}>
          {shipOffer && <p className="flex items-center gap-2.5"><Truck className="h-4 w-4 opacity-70" />{shipOffer}</p>}
          {returnOffer && <p className="flex items-center gap-2.5"><RotateCcw className="h-4 w-4 opacity-70" />{returnOffer}</p>}
          <p className="flex items-center gap-2.5"><Lock className="h-4 w-4 opacity-70" />Paiement sécurisé</p>
        </div>
        <div className="mt-4">
          {[{ title: "Description", html: prod.descriptionHtml }, ...(prod.details ?? [])].map((d, i) => (
            <div key={d.title} className="border-b" style={{ borderColor: `${primary}24` }}>
              <button type="button" onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between py-4 text-left text-[15px] font-semibold">{d.title}<span className={cn("text-xl font-light transition-transform", open === i && "rotate-45")}>+</span></button>
              {open === i && <div className="prose-store pb-4 text-sm opacity-80" dangerouslySetInnerHTML={{ __html: sanitizeHtml(d.html) }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const features = home.features?.length ? home.features : home.benefits.map((b, i) => ({ icon: BENEFIT_ICONS[i % 6], title: b.title, text: b.text }));
  const faq = [...plan.faq, ...plan.strategy.objections.map((o) => ({ question: o.objection, answer: o.answer }))];

  return (
    <div ref={rootRef} className={cn("overflow-hidden text-left transition-[max-width] duration-500 ease-out", device === "mobile" ? "mx-auto max-w-[390px]" : "max-w-none", className)} style={{ background, color: primary }}>
      <div className="flex h-9 items-center justify-center gap-2 px-4 text-center text-[11.5px]" style={{ background: primary, color: background }}>
        <Truck className="h-3.5 w-3.5" />{home.announcements?.[0] ?? offers[0] ?? plan.brand.tagline}
      </div>
      <div className={cn("grid grid-cols-[1fr_auto_1fr] items-center border-b py-4", pad)} style={{ borderColor: `${primary}1a` }}>
        <span className={cn("text-xl tracking-tight", H)}>{plan.brand.name}</span>
        {!mobile ? <nav className="flex gap-7 text-[13px] opacity-80"><span>Boutique</span></nav> : <span />}
        <span className="relative justify-self-end"><ShoppingBag className="h-5 w-5" /><span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[9px] font-bold text-white" style={{ background: accent }}>0</span></span>
      </div>

      {page === "accueil" && (
        <>
          {imgs.hero ? (
            <section className="relative flex min-h-[460px] items-end overflow-hidden text-white sm:items-center" style={{ minHeight: mobile ? 520 : 520 }}>
              <img src={imgs.hero.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0" style={{ background: mobile ? "linear-gradient(0deg,rgba(0,0,0,.75),rgba(0,0,0,.15))" : "linear-gradient(90deg,rgba(0,0,0,.62),rgba(0,0,0,.3) 45%,transparent 75%)" }} />
              <div className={cn("relative max-w-[560px] pb-10 pt-24", pad)}>
                <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-xs backdrop-blur"><Sparkles className="h-3.5 w-3.5" />{plan.brand.tagline}</span>
                <h2 className={cn("text-[2.9rem] leading-[1.02]", H, mobile && "text-[2.2rem]")}>{home.heroTitle}</h2>
                <p className="mt-4 max-w-[36ch] text-[16px] opacity-90">{home.heroSubtitle}</p>
                <div className="mt-7"><Btn light>{home.ctaLabel}</Btn></div>
                <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[13px] opacity-95">{[shipOffer, returnOffer].filter(Boolean).map((t) => <span key={t} className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5" />{t}</span>)}</div>
              </div>
            </section>
          ) : (
            <section className={cn("grid items-center gap-8", pad, sec, !mobile && "grid-cols-2")} style={{ background: tint }}>
              <div>
                <span className="mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs" style={{ background: `${accent}24` }}><Sparkles className="h-3.5 w-3.5" />{plan.brand.tagline}</span>
                <h2 className={cn("text-[2.6rem] leading-[1.02]", H, mobile && "text-[2rem]")}>{home.heroTitle}</h2>
                <p className="mt-4 text-[15px] opacity-70">{home.heroSubtitle}</p>
                <div className="mt-7"><Btn>{home.ctaLabel}</Btn></div>
              </div>
              <Frame a={imgs.gallery[0]} ratio="4/4.3" />
            </section>
          )}

          <section className={cn("text-center", pad, sec)} style={{ background: tint }}>
            <h3 className={cn("text-[2rem] tracking-tight", H)}>{home.featuresTitle ?? plan.brand.tagline}</h3>
            {home.featuresSubtitle && <p className="mt-2 text-sm opacity-70">{home.featuresSubtitle}</p>}
            <div className={cn("mt-10 grid gap-6", mobile ? "grid-cols-2" : "grid-cols-5")}>
              {features.slice(0, mobile ? 4 : 5).map((f) => { const I = ICON[f.icon as IconName] ?? Check; return <div key={f.title}><I className="mx-auto h-7 w-7" style={{ color: accent }} /><p className="mt-3 text-sm font-semibold">{f.title}</p><p className="mt-1 text-xs opacity-65">{f.text}</p></div>; })}
            </div>
          </section>

          <section className={cn("grid items-center gap-10", pad, sec, !mobile && "grid-cols-2 gap-14")}>
            <Frame a={imgs.inuse} ratio="4/4.6" />
            <div>
              {home.benefitsEyebrow && <Eyebrow>{home.benefitsEyebrow}</Eyebrow>}
              <h3 className={cn("mt-2 text-[2rem] leading-tight tracking-tight", H)}>{home.benefitsTitle ?? plan.strategy.promise}</h3>
              <ul className="mt-6 space-y-4">{home.benefits.map((b, i) => { const I = ICON[(home.benefitIcons?.[i] ?? BENEFIT_ICONS[i % 6]) as IconName] ?? Check; return <li key={b.title} className="grid grid-cols-[auto_1fr] gap-x-3"><I className="row-span-2 mt-0.5 h-5 w-5" style={{ color: accent }} /><strong className="text-[15px]">{b.title}</strong><span className="text-sm opacity-70">{b.text}</span></li>; })}</ul>
              <div className="mt-7"><Btn>{home.ctaLabel}</Btn></div>
            </div>
          </section>

          {home.moments && (
            <section className={cn(pad, "pb-16")}>
              <h3 className={cn("text-center text-[2rem] tracking-tight", H)}>{home.moments.title}</h3>
              <div className={cn("mt-8 grid gap-4", mobile ? "grid-flow-col auto-cols-[78%] overflow-x-auto" : "grid-cols-3")}>
                {home.moments.items.slice(0, 3).map((m, i) => <div key={m.title}><Frame a={imgs.moments[i]} ratio="4/5" /><p className="mt-3 font-semibold">{m.title}</p></div>)}
              </div>
            </section>
          )}

          {home.comparison && (
            <section className={cn("grid items-center gap-8", pad, sec, !mobile && "grid-cols-2 gap-14")} style={{ background: primary, color: background }}>
              <div>
                <h3 className={cn("text-[2rem] leading-tight tracking-tight", H)}>{home.comparison.title}</h3>
                <p className="mt-4 text-[15px] opacity-75">{home.comparison.text}</p>
              </div>
              <div className="rounded-[22px] p-6 shadow-2xl" style={{ background, color: primary }}>
                <div className="grid grid-cols-2 gap-4 text-center"><p className={cn("text-xl", H)} style={{ color: accent }}>{home.comparison.usLabel}</p><p className={cn("text-xl", H)}>{home.comparison.themLabel}</p></div>
                {home.comparison.rows.map((r) => (
                  <div key={r.us} className="mt-3 grid grid-cols-2 gap-4 border-t pt-3 text-[13px]" style={{ borderColor: `${primary}1a` }}>
                    <span className="flex gap-2"><Check className="h-4 w-4 shrink-0" style={{ color: accent }} />{r.us}</span>
                    <span className="flex gap-2 opacity-60"><X className="h-4 w-4 shrink-0" />{r.them}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className={cn(pad, sec)} style={{ background: tint }}>{productBlock}</section>

          <section className="relative grid min-h-[340px] place-items-center overflow-hidden px-6 py-16 text-center text-white" style={{ background: primary }}>
            {(imgs.moments[2] ?? imgs.hero) && <><img src={(imgs.moments[2] ?? imgs.hero)!.url} alt="" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-black/45" /></>}
            <div className="relative max-w-lg">
              <h3 className={cn("text-[2.2rem] leading-tight", H)}>{home.finalCta?.title ?? plan.strategy.promise}</h3>
              {home.finalCta?.text && <p className="mt-3 opacity-90">{home.finalCta.text}</p>}
              <div className="mt-6"><Btn light>{home.ctaLabel}</Btn></div>
            </div>
          </section>
        </>
      )}

      {page === "produit" && <section className={cn(pad, "py-10")}>{productBlock}</section>}

      {page === "faq" && (
        <section className={cn(pad, sec)}>
          <h2 className={cn("text-3xl tracking-tight", H)}>Questions fréquentes</h2>
          <div className="mt-6">{faq.map((f) => (
            <div key={f.question} className="border-b py-4" style={{ borderColor: `${primary}24` }}>
              <p className="font-semibold">{f.question}</p>
              <p className="mt-1 text-sm opacity-70">{f.answer}</p>
            </div>
          ))}</div>
        </section>
      )}

      {page === "a-propos" && (
        <section className={cn(pad, sec, !mobile && "mx-auto max-w-2xl")}>
          <h2 className={cn("text-3xl tracking-tight", H)}>{plan.aboutPage.title}</h2>
          <div className="prose-store mt-5 text-[15px] leading-relaxed opacity-80" dangerouslySetInnerHTML={{ __html: sanitizeHtml(plan.aboutPage.bodyHtml) }} />
        </section>
      )}

      <footer className={cn("flex flex-wrap items-center justify-between gap-3 py-8 text-[12px]", pad)} style={{ background: primary, color: background }}>
        <span className={cn("text-lg", H)}>{plan.brand.name}</span>
        <span className="opacity-70">© {plan.brand.name} · {plan.brand.tagline}</span>
      </footer>
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
