"use client";

import { ArrowDown, Camera, Check, HelpCircle, Lock, MessageSquare, PenLine, Rocket, RotateCcw, ShieldCheck, ShoppingBag, Star, Truck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import * as api from "@/lib/api/client";
import type { Job, Store } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { onColor } from "@/lib/store-style";
import { useApp } from "./AppContext";
import { Paywall } from "./Paywall";

// Ce que contient la boutique complète. Les avis ne sont promis que s'il y a un lien fournisseur (avis réels importés).
const unlocksFor = (withLink: boolean) => [
  { icon: PenLine, title: "Tous les textes", text: "Accueil, fiche produit, FAQ, offres par lot" },
  { icon: Camera, title: "Une dizaine de photos", text: "Ton produit sur fond neutre et en situation" },
  withLink
    ? { icon: Star, title: "Vrais avis acheteurs", text: "Ceux du produit chez ton fournisseur, traduits" }
    : { icon: HelpCircle, title: "FAQ et garanties", text: "Les réponses qui rassurent avant l'achat" },
  { icon: MessageSquare, title: "Éditeur IA", text: "Modifie tout en une phrase" },
  { icon: Rocket, title: "Mise en ligne Shopify", text: "Produit et design à importer, guidé pas à pas" },
];

const eur = (p: string) => `${Number(p).toFixed(2).replace(".", ",")} €`;

// Aperçu de la vraie boutique, au plus près du rendu final : bandeau, en-tête, grande photo avec l'accroche,
// garanties, bandeau défilant, atouts, puis la fiche produit floutée jusqu'au déblocage.
// Sans compte (`loginHref`) : la photo et la suite sont floutées, il faut se connecter pour les voir.
export function TeaserPreview({ store, loginHref, onUnlock }: { store: Store; loginHref?: string; onUnlock?: () => void }) {
  const t = store.teaser!;
  const style = store.theme.style ?? "lifestyle";
  const lumOf = (h: string) => { const x = h.replace("#", "").padEnd(6, "0"); return 0.299 * parseInt(x.slice(0, 2), 16) + 0.587 * parseInt(x.slice(2, 4), 16) + 0.114 * parseInt(x.slice(4, 6), 16); };
  // Style « sport et tech » : toujours sur fond sombre, comme la vraie boutique.
  const c0 = store.theme.colors;
  const flip = style === "tech" && lumOf(c0.background) > lumOf(c0.primary);
  const { primary, accent, background } = flip ? { ...c0, primary: c0.background, background: c0.primary } : c0;
  const { headingFont, bodyFont } = store.theme;
  const serif = /serif|fraunces|playfair|cormorant|garamond|bodoni|lora/i.test(headingFont);
  const heading = { fontFamily: `'${headingFont}', ${serif ? "Georgia, serif" : "system-ui, sans-serif"}`, fontWeight: serif ? 400 : 700, ...(style === "tech" ? { textTransform: "uppercase" as const, letterSpacing: "-0.01em" } : {}) };
  const onAccent = onColor(accent);
  // Bandeau défilant et cartes d'atouts : un rendu par style.
  const mqStyle = style === "premium" ? { background: `${primary}0a`, color: primary } : style === "direct" ? { background: primary, color: background } : { background: accent, color: onAccent };
  const cardClass = style === "premium" ? "border" : style === "direct" ? "border-l-4" : "";
  const cardStyle = (i: number) => style === "premium" ? { borderColor: `${primary}1f` } : style === "direct" ? { background: `${primary}08`, borderColor: accent } : style === "tech" ? { background: `${primary}0d`, boxShadow: i === 0 ? `0 0 0 1px ${accent}55` : undefined } : { background: `${accent}14` };
  const bullets = (t.bullets?.length ? t.bullets : t.benefits.map((b) => b.title)).slice(0, 3);
  const ref = useRef<HTMLDivElement>(null);
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWide(e.contentRect.width >= 640));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const dark = lumOf(primary) < lumOf(background) ? primary : background;
  const blurImg = loginHref ? "scale-110 blur-[14px]" : "";
  const trust = ["Livraison offerte", "Retours 30 jours", "Paiement sécurisé"];
  const icons = [Truck, RotateCcw, ShieldCheck];
  const mq = t.benefits.map((b) => b.title);
  return (
    <div ref={ref} className="relative overflow-hidden rounded-[13px] text-left" style={{ background, color: primary, fontFamily: `'${bodyFont}', system-ui, sans-serif` }}>
      <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(headingFont)}${serif ? ":ital@0;1" : ":wght@500;600;700"}&family=${encodeURIComponent(bodyFont)}:wght@400;500;600;700&display=swap`} precedence="default" />
      <style>{"@keyframes tp-mq{to{transform:translateX(-50%)}}@media (prefers-reduced-motion:reduce){[style*=tp-mq]{animation:none!important}}"}</style>
      <div className="flex h-8 items-center justify-center gap-1.5 text-[11px]" style={{ background: primary, color: background }}><Truck className="h-3.5 w-3.5" />Livraison offerte · Retours 30 jours</div>
      <div className="flex items-center justify-between border-b px-5 py-3" style={{ borderColor: `${primary}1a` }}>
        <span className="text-xl" style={heading}>{store.name}</span>
        {wide && <span className="flex gap-6 text-[13px] opacity-75"><span>Accueil</span><span>Boutique</span><span>FAQ</span></span>}
        <ShoppingBag className="h-5 w-5" />
      </div>

      {/* Haut de page : grande photo + accroche, comme dans la boutique finale. */}
      {t.image ? (
        wide ? (
          <div className="relative flex min-h-[420px] items-center overflow-hidden text-white">
            <img src={t.image} alt="" className={cn("absolute inset-0 h-full w-full object-cover", blurImg)} style={{ objectPosition: "70% center" }} />
            <div className="absolute inset-0" style={{ background: style === "premium" ? "rgba(0,0,0,.42)" : "linear-gradient(90deg,rgba(0,0,0,.62),rgba(0,0,0,.28) 45%,transparent 75%)" }} />
            <div className={cn("relative px-8 py-12", style === "premium" ? "mx-auto max-w-[640px] text-center" : "max-w-[520px]")}>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs backdrop-blur"><span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />{t.tagline}</span>
              <h3 className="mt-4 text-[2.5rem] leading-[1.04]" style={heading}>{t.heroTitle}</h3>
              <p className={cn("mt-3 max-w-[38ch] text-[15px] opacity-90", style === "premium" && "mx-auto")}>{t.heroSubtitle}</p>
              <span className="mt-6 inline-flex rounded-full px-6 py-3 text-sm font-semibold shadow-lg" style={{ background: accent, color: onAccent }}>Acheter · {eur(t.price)}</span>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden text-white" style={{ background: dark }}>
            <div className="relative aspect-[4/3.6] w-full overflow-hidden">
              <img src={t.image} alt="" className={cn("h-full w-full object-cover", blurImg)} />
              <div className="absolute inset-0" style={{ background: `linear-gradient(0deg, ${dark} 0%, transparent 38%)` }} />
            </div>
            <div className="relative -mt-6 px-5 pb-8">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs"><span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />{t.tagline}</span>
              <h3 className="mt-3 text-[1.9rem] leading-[1.06]" style={heading}>{t.heroTitle}</h3>
              <p className="mt-2.5 text-[15px] opacity-85">{t.heroSubtitle}</p>
              <span className="mt-5 inline-flex rounded-full px-5 py-3 text-sm font-semibold" style={{ background: accent, color: onAccent }}>Acheter · {eur(t.price)}</span>
            </div>
          </div>
        )
      ) : (
        <div className="p-6">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs" style={{ background: `${accent}22` }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />{t.tagline}</span>
          <h3 className="mt-4 text-[clamp(1.6rem,1.1rem+1.6vw,2.4rem)] leading-tight" style={heading}>{t.heroTitle}</h3>
          <p className="mt-3 text-sm opacity-70">{t.heroSubtitle}</p>
          <span className="mt-5 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold" style={{ background: accent, color: onAccent }}>Acheter · {eur(t.price)}</span>
        </div>
      )}

      {/* Garanties, puis bandeau défilant des atouts (comme dans le thème). */}
      <div className={cn("grid gap-2 px-5 py-4 text-[12.5px]", wide ? "grid-cols-3 px-8" : "grid-cols-1")} style={{ background: `${primary}08` }}>
        {trust.map((x, i) => { const I = icons[i]; return <span key={x} className="flex items-center gap-2"><I className="h-4 w-4" style={{ color: accent }} />{x}</span>; })}
      </div>
      {mq.length > 1 && (
        <div className="overflow-hidden py-3" style={mqStyle}>
          <div className="flex w-max" style={{ animation: "tp-mq 26s linear infinite" }}>
            {[0, 1].map((g) => (
              <div key={g} aria-hidden={g === 1} className="flex items-center gap-6 pr-6">
                {[0, 1, 2].flatMap((r) => mq.map((m, i) => <span key={`${r}-${i}`} className="flex items-center gap-6 whitespace-nowrap text-[15px] font-semibold"><span style={i % 2 ? { fontStyle: "italic", ...heading } : undefined}>{m}</span><span className="text-xs opacity-70">✦</span></span>))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Atouts : lisibles une fois connecté. */}
      {!loginHref && (
        <div className={cn("grid gap-3 px-5 py-6", wide ? "grid-cols-3 px-8" : "grid-cols-1")}>
          {t.benefits.map((b) => (
            <div key={b.title} className={cn("flex gap-3 rounded-[14px] p-4", cardClass)} style={cardStyle(t.benefits.indexOf(b))}>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full" style={{ background: accent, color: onAccent }}><Check className="h-4 w-4" /></span>
              <span><span className="block font-semibold">{b.title}</span><span className="mt-0.5 block text-sm opacity-70">{b.text}</span></span>
            </div>
          ))}
        </div>
      )}

      {/* Fiche produit lisible (nom, prix, description, points forts), connecté seulement. */}
      {!loginHref && (
        <div className={cn("grid items-center gap-6", wide ? "grid-cols-2 px-8 py-8" : "px-5 py-6")} style={{ background: style === "premium" ? undefined : `${primary}06` }}>
          <div className="aspect-square overflow-hidden rounded-[16px]" style={{ background: `linear-gradient(150deg, ${accent}55, ${primary}55)` }}>{t.image && <img src={t.image} alt="" className="h-full w-full object-cover" />}</div>
          <div>
            <p className={cn("leading-tight", wide ? "text-[1.7rem]" : "text-[1.45rem]")} style={heading}>{t.productTitle}</p>
            <p className="mt-2 text-xl font-bold">{eur(t.price)}</p>
            <p className="mt-3 text-[14.5px] leading-relaxed opacity-80">{t.description || t.heroSubtitle}</p>
            <ul className="mt-4 space-y-2 text-[14.5px]">{bullets.map((b) => <li key={b} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accent }} />{b}</li>)}</ul>
            <button type="button" onClick={onUnlock} className="mt-5 flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold shadow-lg" style={{ background: accent, color: onAccent }}>Ajouter au panier · {eur(t.price)}</button>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-xs opacity-60"><Lock className="h-3 w-3" /> Paiement sécurisé · Livraison suivie</p>
          </div>
        </div>
      )}

      {/* La suite (comment ça marche, photos, avis, FAQ…) : floutée jusqu'au déblocage. */}
      <div className="relative">
        <div aria-hidden className={cn("pointer-events-none select-none space-y-6 blur-[6px]", wide ? "p-8" : "p-5")}>
          {loginHref && (
            <div className={cn("grid gap-3", wide ? "grid-cols-3" : "grid-cols-1")}>
              {t.benefits.map((b) => <div key={b.title} className="rounded-[14px] p-4" style={{ background: `${accent}14` }}><p className="font-semibold">{b.title}</p><p className="mt-1 text-sm opacity-70">{b.text}</p></div>)}
            </div>
          )}
          <p className="text-center text-2xl" style={heading}>Comment ça marche</p>
          <div className={cn("grid gap-4", wide ? "grid-cols-3" : "grid-cols-1")}>{[0, 1, 2].map((i) => <div key={i} className="rounded-[16px] p-3" style={{ background: `${primary}0a` }}><p className="text-xs font-bold" style={{ color: accent }}>0{i + 1}</p><div className="mt-2 aspect-[4/3] rounded-[12px]" style={{ background: `linear-gradient(150deg, ${accent}40, ${primary}30)` }} /><div className="mt-3 h-3 w-2/3 rounded-full" style={{ background: `${primary}22` }} /></div>)}</div>
          <div className={cn("grid gap-4", wide ? "grid-cols-3" : "grid-cols-1")}>{[0, 1, 2].map((i) => <div key={i} className="h-28 rounded-[16px]" style={{ background: `${primary}0f` }} />)}</div>
        </div>
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-b from-transparent via-black/10 to-black/30 p-4">
          <a href={loginHref ?? "#debloquer"} onClick={onUnlock} className="flex items-center gap-2 rounded-full bg-[#0b1f1b]/90 px-5 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur">
            <Lock className="h-4 w-4 text-[#2ee6a6]" /> {loginHref ? "Connecte-toi pour voir ta boutique" : "Débloque ta boutique complète"}
          </a>
        </div>
      </div>
    </div>
  );
}

export function LockedStore({ store, onUnlocked }: { store: Store; onUnlocked: (res: { store: Store; job: Job }) => void }) {
  const { user, refresh } = useApp();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const tried = useRef(false);
  // Étape intermédiaire : d'abord la boutique, l'offre ne s'affiche qu'après « Débloquer ».
  const [showPay, setShowPay] = useState(false);
  useEffect(() => { if (window.location.hash === "#debloquer") setShowPay(true); }, []);
  const openPay = () => setShowPay(true);
  const paid = user.plan !== "free";

  // Abonnement actif : on lance tout de suite la vraie génération.
  useEffect(() => {
    if (!paid || tried.current) return;
    tried.current = true;
    setBusy(true);
    api.unlockStore(store.id).then(onUnlocked).catch((e) => { toast((e as Error).message, "error"); setBusy(false); });
  }, [paid, store.id, onUnlocked, toast]);

  // Retour du paiement : le temps que Shopify confirme, on revérifie l'abonnement.
  useEffect(() => {
    if (paid) return;
    const id = window.setInterval(refresh, 5000);
    return () => window.clearInterval(id);
  }, [paid, refresh]);

  if (!store.teaser) return null;
  return (
    <div className="px-5 pb-16 pt-8 sm:px-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#2ee6a6]/40 bg-[#2ee6a6]/10 px-3 py-1 text-xs font-medium text-[#a7f3d0]"><Lock className="h-3.5 w-3.5" /> Ton aperçu</span>
          <h1 className="mt-4 text-[clamp(1.9rem,1.3rem+2vw,3rem)] font-semibold leading-tight tracking-[-0.035em]">
            Ta boutique <span className="serif-accent">{store.name}</span> t'attend
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-fg-muted">Ton nom, tes couleurs, ton accroche et tes atouts sont prêts et gardés dans ton compte. Quand tu veux, débloque-la : textes, photos et design se créent en quelques minutes.</p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="glow-frame rounded-[14px] p-[1.5px]"><TeaserPreview store={store} onUnlock={openPay} /></div>
          <div className="flex flex-col gap-2.5">
            {unlocksFor(store.mode === "link").map(({ icon: I, title, text }) => (
              <div key={title} className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-white/[0.04] p-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[linear-gradient(160deg,#34f0b0,#0fae7c)] text-[#03140d]"><I className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><span className="block text-[15px] font-semibold">{title}</span><span className="block text-[13px] text-fg-muted">{text}</span></span>
                <Lock className="h-4 w-4 shrink-0 text-fg-faint" />
              </div>
            ))}
            <a href="#debloquer" onClick={openPay} className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,#34f0b0,#0fae7c)] text-[15px] font-semibold text-[#03140d] shadow-[0_10px_30px_-10px_rgb(46_230_166/0.8)]">
              {busy ? <><Spinner /> Déblocage…</> : <>Débloquer ma boutique complète <ArrowDown className="h-4 w-4" /></>}
            </a>
            <p className="text-center text-xs text-fg-muted">Prête en 3 minutes · sans engagement · annulable en un clic</p>
          </div>
        </div>

        {/* À quoi ressemble une boutique complète : une vraie boutique créée avec Vigenia (exemple). */}
        <div className="mt-10 grid items-center gap-5 rounded-[20px] border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-[1.4fr_1fr] sm:p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/showcase/ouate-store.jpg" alt="Exemple de boutique complète créée avec Vigenia" loading="lazy" className="w-full rounded-[12px] ring-1 ring-white/10" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6ee7b7]">Exemple de boutique complète</p>
            <p className="mt-2 text-xl font-semibold leading-snug">Voilà ce que devient ton aperçu une fois débloqué.</p>
            <p className="mt-2 text-sm text-fg-muted">Ici, Maison Ouate : photos, textes, page produit, panier et FAQ, prêts à mettre en ligne sur Shopify. La tienne garde ton nom, tes couleurs et ton produit.</p>
            <a href="#debloquer" onClick={openPay} className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#03140d]">Débloquer la mienne <ArrowDown className="h-4 w-4" /></a>
          </div>
        </div>

        {/* Téléphone : le bouton reste en bas de l'écran tant que l'offre n'est pas ouverte. */}
        {!paid && !showPay && (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#04140f]/95 p-3 pb-[max(env(safe-area-inset-bottom),12px)] backdrop-blur lg:hidden">
            <a href="#debloquer" onClick={openPay} className="flex h-12 items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,#34f0b0,#0fae7c)] text-[15px] font-semibold text-[#03140d]">Débloquer ma boutique complète <ArrowDown className="h-4 w-4" /></a>
          </div>
        )}

        <div id="debloquer" className="scroll-mt-6">{!paid && showPay && <div className="mt-12 [animation:fade-in_.4s_ease-out_both]"><Paywall unlockStoreId={store.id} /></div>}</div>
      </div>
    </div>
  );
}
