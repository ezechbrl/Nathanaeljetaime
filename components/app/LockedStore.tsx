"use client";

import { ArrowDown, Camera, Check, HelpCircle, Lock, Mail, MessageSquare, PenLine, Rocket, RotateCcw, ShieldCheck, ShoppingBag, Star, Timer, Truck, X } from "lucide-react";
import Link from "next/link";
import { useCountdown } from "@/components/pricing/PlanCards";
import { useApi } from "@/lib/api/hooks";
import { HESITATIONS } from "@/lib/content/cancel";
import { PAID_PLANS, SINGLE, euro, showBarred } from "@/lib/content/pricing";
import { useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import * as api from "@/lib/api/client";
import type { Asset, Job, Store } from "@/lib/api/types";
import { StorePreview } from "./StorePreview";
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

// Contenu de l'aperçu mis au format d'une boutique complète, pour l'afficher avec le même rendu (StorePreview).
function teaserStore(store: Store): { store: Store; assets: Asset[] } {
  const t = store.teaser!;
  const desc = (t.description ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || t.heroSubtitle;
  const bullets = (t.bullets?.length ? t.bullets : t.benefits.map((b) => b.title)).slice(0, 3);
  const icons = ["check", "heart", "shield", "truck", "star"] as const;
  const plan = {
    brand: { name: store.name, tagline: t.tagline, tone: "", colors: store.theme.colors },
    strategy: { market: "", promise: t.heroSubtitle, offers: ["Livraison offerte", "Retours sous 30 jours"], objections: [] },
    homepage: {
      heroTitle: t.heroTitle, heroSubtitle: t.heroSubtitle, ctaLabel: "Découvrir", socialProofIdea: "",
      benefits: t.benefits.slice(0, 3), benefitIcons: ["heart", "check", "shield"], benefitsEyebrow: t.tagline.toUpperCase(), benefitsTitle: "Ce que ça change pour toi",
      features: [...bullets.map((b, i) => ({ icon: icons[i], title: b, text: "" })), { icon: "truck", title: "Livraison offerte", text: "" }, { icon: "star", title: "Retours 30 jours", text: "" }],
      featuresTitle: t.tagline, featuresSubtitle: "",
      announcements: ["Livraison offerte · Retours 30 jours"],
      finalCta: { title: t.heroTitle, text: t.heroSubtitle },
    },
    product: {
      title: t.productTitle, subtitle: t.heroSubtitle, price: t.price, compareAtPrice: "", bulletPoints: bullets,
      descriptionHtml: `<p>${desc.replace(/[<>&]/g, "")}</p>`, highlights: bullets.map((b, i) => ({ icon: icons[i], title: b.split(" ").slice(0, 3).join(" ") })),
      guarantee: "30 jours pour changer d'avis.", details: [{ title: "Livraison et retours", html: "<p>Livraison offerte et suivie. Retours sous 30 jours.</p>" }],
      tags: [], seoTitle: "", seoDescription: "", bundles: [],
    },
    faq: [], aboutPage: { title: "", bodyHtml: "" },
  };
  const img = (id: string, slot: string, kind: Asset["kind"]) => ({ id, storeId: store.id, kind, url: t.image!, width: 1280, height: 720, prompt: null, slot, createdAt: store.createdAt });
  const assets: Asset[] = t.image ? [img("t-hero", "hero", "banner")] : [];
  // La photo de l'aperçu laisse la place à gauche (produit à droite) : le titre va toujours à gauche.
  return { store: { ...store, theme: { ...store.theme, heroLayout: "left" }, plan: plan as unknown as Store["plan"] }, assets };
}

// Deux blocs qui donnent envie d'acheter, sans répéter la photo : les atouts, puis l'offre (prix, points forts, bouton).
function ConversionBlocks({ store }: { store: Store }) {
  const t = store.teaser!;
  const { primary, accent, background } = store.theme.colors;
  const onAccent = onColor(accent);
  const serif = /serif|fraunces|playfair|cormorant|garamond|bodoni|lora/i.test(store.theme.headingFont);
  const heading = { fontFamily: `'${store.theme.headingFont}', ${serif ? "Georgia, serif" : "system-ui, sans-serif"}`, fontWeight: serif ? 400 : 700, ...(store.theme.style === "tech" ? { textTransform: "uppercase" as const } : {}) };
  const bullets = (t.bullets?.length ? t.bullets : t.benefits.map((b) => b.title)).slice(0, 3);
  const desc = (t.description ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || t.heroSubtitle;
  const icons = [Star, ShieldCheck, Truck];
  return (
    <div style={{ background, color: primary, fontFamily: `'${store.theme.bodyFont}', system-ui, sans-serif` }}>
      <div className="px-5 py-12 sm:px-12">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: accent }}>{t.tagline}</p>
        <h3 className="mt-2 text-center text-[1.9rem] leading-tight" style={heading}>Pourquoi tu vas l&apos;adorer</h3>
        {t.image2 && (
          <div className="mx-auto mt-8 max-w-[860px] overflow-hidden rounded-[22px]" style={{ boxShadow: `0 30px 60px -30px ${accent}66` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={t.image2} alt={t.productTitle} className="aspect-[16/10] w-full object-cover" />
          </div>
        )}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {t.benefits.slice(0, 3).map((b, i) => {
            const I = icons[i];
            return (
              <div key={b.title} className="rounded-[20px] p-5" style={{ background: `${primary}0d`, boxShadow: `inset 0 0 0 1px ${primary}14` }}>
                <span className="grid h-11 w-11 place-items-center rounded-full" style={{ background: accent, color: onAccent }}><I className="h-5 w-5" /></span>
                <p className="mt-4 text-[17px] font-semibold">{b.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed opacity-75">{b.text}</p>
              </div>
            );
          })}
        </div>
      </div>
      <div className="px-5 pb-12 sm:px-12">
        <div className="mx-auto max-w-[720px] rounded-[26px] p-6 sm:p-8" style={{ background: `linear-gradient(160deg, ${primary}12, ${primary}05)`, boxShadow: `inset 0 0 0 1.5px ${accent}66, 0 30px 60px -30px ${accent}55` }}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[1.6rem] leading-tight" style={heading}>{t.productTitle}</p>
              <p className="mt-2 text-sm opacity-75">{desc}</p>
            </div>
            <p className="shrink-0 rounded-full px-4 py-1.5 text-xl font-bold" style={{ background: `${accent}22`, color: accent }}>{eur(t.price)}</p>
          </div>
          <ul className="mt-5 grid gap-2.5 sm:grid-cols-3">{bullets.map((b) => <li key={b} className="flex items-start gap-2 text-[14.5px]"><Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accent }} />{b}</li>)}</ul>
          <button type="button" tabIndex={-1} className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold shadow-lg transition-transform hover:scale-[1.01]" style={{ background: accent, color: onAccent }}><ShoppingBag className="h-5 w-5" /> Ajouter au panier · {eur(t.price)}</button>
          <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-xs opacity-75">
            <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" /> Livraison offerte</span>
            <span className="flex items-center gap-1.5"><RotateCcw className="h-3.5 w-3.5" /> Retours 30 jours</span>
            <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Paiement sécurisé</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Ce que la boutique complète ajoute, flouté : un gros plan du produit, comment ça marche, FAQ.
function LockedSections({ store, loginHref, onUnlock }: { store: Store; loginHref?: string; onUnlock?: () => void }) {
  const t = store.teaser!;
  const { primary, accent, background } = store.theme.colors;
  const block = (h: number) => <div className="rounded-[16px]" style={{ height: h, background: `linear-gradient(150deg, ${accent}40, ${primary}26)` }} />;
  return (
    <div className="relative overflow-hidden" style={{ background, color: primary }}>
      <div aria-hidden className="pointer-events-none select-none space-y-14 px-6 py-14 blur-[8px] sm:px-12">
        <div>
          <p className="text-center text-2xl font-semibold">Partout avec toi</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-[1.4fr_1fr]">
            <div className="aspect-[4/3] overflow-hidden rounded-[18px]" style={{ background: `linear-gradient(150deg, ${accent}40, ${primary}26)` }}>{t.image3 ? <img src={t.image3} alt="" className="h-full w-full scale-105 object-cover" /> : t.image && <img src={t.image} alt="" className="h-full w-full scale-[1.6] object-cover" style={{ objectPosition: "72% 60%" }} />}</div>
            <div className="grid gap-4">{block(140)}{block(140)}</div>
          </div>
        </div>
        <div>
          <p className="text-center text-2xl font-semibold">Comment ça marche</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="rounded-[18px] p-3" style={{ background: `${primary}08` }}><p className="text-xs font-bold" style={{ color: accent }}>0{i + 1}</p><div className="mt-2">{block(140)}</div></div>)}</div>
        </div>
        <div className="mx-auto max-w-2xl">
          <p className="text-center text-2xl font-semibold">Questions fréquentes</p>
          {[0, 1, 2].map((i) => <div key={i} className="mt-4 h-12 rounded-[12px]" style={{ background: `${primary}0d` }} />)}
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/45" />
      <div className="absolute inset-x-0 top-24 grid place-items-center p-6">
        <a href={loginHref ?? "#debloquer"} onClick={onUnlock} className="flex items-center gap-2 rounded-full bg-[linear-gradient(180deg,#14b886,#00876a)] glow-hover px-6 py-3.5 text-[15px] font-semibold text-white">
          <Lock className="h-4 w-4" /> {loginHref ? "Connecte-toi pour voir ta boutique" : "Débloque la suite de ta boutique"}
        </a>
        {!loginHref && <p className="mt-3 rounded-full bg-black/55 px-4 py-1.5 text-center text-xs text-white backdrop-blur">+ une dizaine de photos, comment ça marche, FAQ, mise en ligne Shopify</p>}
      </div>
    </div>
  );
}

// Aperçu gratuit : le haut d'une vraie boutique (même rendu que les boutiques complètes), avec la photo une
// seule fois, puis deux blocs qui donnent envie d'acheter, puis la suite floutée (avec une 2ᵉ photo).
export function TeaserPreview({ store, loginHref, onUnlock }: { store: Store; loginHref?: string; onUnlock?: () => void }) {
  const data = teaserStore(store);
  return (
    // [contain:inline-size] : la boutique ne peut jamais élargir la page (sinon, sur téléphone, tout se dézoome).
    <div className="overflow-hidden rounded-[13px] [contain:inline-size]">
      {/* Net : seulement le haut de la boutique (la belle photo et l'accroche). Tout le reste est flouté. */}
      <div className="pointer-events-none select-none"><StorePreview store={data.store} assets={data.assets} animate={false} sections={["hero", "marquee"]} footer={false} /></div>
      <div className="relative">
        <div aria-hidden className="pointer-events-none select-none blur-[7px]">
          <StorePreview store={data.store} assets={data.assets} animate={false} sections={["features"]} footer={false} />
          {!loginHref && <ConversionBlocks store={store} />}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/15 to-black/35" />
        <div className="absolute inset-x-0 top-16 grid place-items-center p-6">
          <a href={loginHref ?? "#debloquer"} onClick={onUnlock} className="flex items-center gap-2 rounded-full bg-[linear-gradient(180deg,#14b886,#00876a)] glow-hover px-6 py-3.5 text-[15px] font-semibold text-white">
            <Lock className="h-4 w-4" /> {loginHref ? "Connecte-toi pour voir ta boutique" : "Débloque toute ta boutique"}
          </a>
        </div>
      </div>
      <LockedSections store={store} loginHref={loginHref} onUnlock={onUnlock} />
    </div>
  );
}

// Le prix, dès l'aperçu (pas de surprise après « Débloquer ») : « Ma boutique » en paiement unique (39 €, sans
// abonnement), ou un abonnement dès 29 €/mois.
function PriceLine() {
  const billing = useApi(() => api.getBilling(false), []);
  if (!billing.data) return null;
  return (
    <p className="mx-auto mt-3 flex max-w-xl flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-fg-muted">
      <span>Ta boutique complète : <b className="text-white">{euro(SINGLE.price)} une fois</b>{showBarred() && <> <s className="text-fg-faint">{euro(SINGLE.was)}</s></>}</span>
      <span>· ou un abonnement dès {euro(PAID_PLANS[0].monthly)}/mois</span>
    </p>
  );
}

// « Qu'est-ce qui te fait hésiter ? » : petite carte qui apparaît après un moment sur l'aperçu (ou quand la souris
// quitte la page sur ordinateur), une seule fois par aperçu. La réponse arrive dans Ventes et dans les topos.
function HesitationAsk({ storeId }: { storeId: string }) {
  const key = `vg-hesit-${storeId}`;
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const [details, setDetails] = useState("");
  const [sent, setSent] = useState(false);
  useEffect(() => {
    try { if (localStorage.getItem(key)) return; } catch { return; }
    const show = () => setOpen(true);
    const t = window.setTimeout(show, 45_000);
    const onLeave = (e: MouseEvent) => { if (e.clientY <= 0) show(); };
    document.addEventListener("mouseout", onLeave);
    return () => { window.clearTimeout(t); document.removeEventListener("mouseout", onLeave); };
  }, [key]);
  const close = () => { setOpen(false); try { localStorage.setItem(key, "1"); } catch { /* stockage indisponible */ } };
  const send = () => {
    if (!reason) return;
    api.sendHesitation(storeId, reason, details.trim() || undefined).catch(() => {});
    setSent(true);
    try { localStorage.setItem(key, "1"); } catch { /* stockage indisponible */ }
    window.setTimeout(() => setOpen(false), 2500);
  };
  if (!open) return null;
  return (
    <div role="dialog" aria-label="Qu'est-ce qui te fait hésiter ?" className="fixed inset-x-3 bottom-[84px] z-50 mx-auto max-w-[420px] rounded-[18px] border border-white/15 bg-[#0d0d0d]/95 p-4 shadow-2xl backdrop-blur [animation:rise_.4s_cubic-bezier(.2,.8,.2,1)_both] lg:bottom-6 lg:left-auto lg:right-6 lg:mx-0">
      <button type="button" onClick={close} aria-label="Fermer" className="absolute right-3 top-3 text-fg-faint hover:text-white"><X className="h-4 w-4" /></button>
      {sent ? <p className="py-2 pr-6 text-sm">Merci, ça nous aide vraiment à améliorer Vigenia 🙏</p> : (
        <>
          <p className="pr-6 text-[15px] font-semibold">Qu'est-ce qui te fait hésiter ?</p>
          <p className="mt-0.5 text-xs text-fg-muted">Un clic suffit : ta réponse nous aide à améliorer Vigenia.</p>
          <div className="mt-3 grid gap-1.5">
            {HESITATIONS.map((h) => (
              <button key={h.id} type="button" onClick={() => setReason(h.id)} aria-pressed={reason === h.id}
                className={cn("rounded-[11px] border px-3 py-2 text-left text-[13.5px] transition-colors", reason === h.id ? "border-white/15 bg-white/[0.06] text-white" : "border-white/10 bg-white/[0.04] text-fg-muted hover:border-white/25")}>{h.label}</button>
            ))}
          </div>
          {reason && <input value={details} onChange={(e) => setDetails(e.target.value)} maxLength={500} placeholder="Un mot de plus ? (facultatif)" className="field mt-2 h-10 text-sm" />}
          <button type="button" disabled={!reason} onClick={send} className="mt-3 h-10 w-full rounded-full bg-[linear-gradient(180deg,#14b886,#00876a)] glow-hover text-sm font-semibold text-white disabled:opacity-40">Envoyer</button>
        </>
      )}
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
  // Ouvre l'offre puis descend jusqu'à elle (le bloc n'existe qu'après l'ouverture).
  const openPay = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setShowPay(true);
    window.setTimeout(() => document.getElementById("debloquer")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };
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
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-xs font-medium text-white/80"><Lock className="h-3.5 w-3.5" /> Ton aperçu</span>
          <h1 className="mt-4 text-[clamp(1.9rem,1.3rem+2vw,3rem)] font-semibold leading-tight tracking-[-0.035em]">
            Ta boutique <span className="serif-accent">{store.name}</span> t'attend
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-fg-muted">Ton nom, tes couleurs, ton accroche et tes atouts sont prêts et gardés dans ton compte. Quand tu veux, débloque-la : textes, photos et design se créent en quelques minutes.</p>
          {!paid && (
            <a href="#debloquer" onClick={openPay} className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,#14b886,#00876a)] glow-hover px-7 text-[15px] font-semibold text-white [animation:cta-glow_2.4s_ease-in-out_infinite]">
              Débloquer ma boutique <ArrowDown className="h-4 w-4" />
            </a>
          )}
          {!paid && <PriceLine />}
        </div>

        <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="glow-frame min-w-0 rounded-[14px] p-[1.5px]"><TeaserPreview store={store} onUnlock={openPay} /></div>
          <div className="flex flex-col gap-2.5">
            {unlocksFor(store.mode === "link").map(({ icon: I, title, text }) => (
              <div key={title} className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-white/[0.04] p-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[linear-gradient(180deg,#14b886,#00876a)] glow-hover text-white"><I className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><span className="block text-[15px] font-semibold">{title}</span><span className="block text-[13px] text-fg-muted">{text}</span></span>
                <Lock className="h-4 w-4 shrink-0 text-fg-faint" />
              </div>
            ))}
            <a href="#debloquer" onClick={openPay} className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,#14b886,#00876a)] glow-hover text-[15px] font-semibold text-white">
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
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#3dff9a]">Exemple de boutique complète</p>
            <p className="mt-2 text-xl font-semibold leading-snug">Voilà ce que devient ton aperçu une fois débloqué.</p>
            <p className="mt-2 text-sm text-fg-muted">Ici, Maison Ouate : photos, textes, page produit, panier et FAQ, prêts à mettre en ligne sur Shopify. La tienne garde ton nom, tes couleurs et ton produit.</p>
            <a href="#debloquer" onClick={openPay} className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,#14b886,#00876a)] px-5 text-sm font-semibold text-white glow-hover">Débloquer la mienne <ArrowDown className="h-4 w-4" /></a>
          </div>
        </div>

        {/* Un vrai humain derrière Vigenia : on peut poser sa question avant de payer. */}
        {!paid && (
          <div className="mt-6 flex flex-col items-start gap-3 rounded-[20px] border border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:items-center">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/[0.06] text-white/80"><Mail className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-[16px] font-semibold">Une question avant de te lancer ?</p>
              <p className="text-sm text-fg-muted">Vigenia est un petit projet indépendant : c&apos;est son créateur qui lit chaque message et qui te répond.</p>
            </div>
            <Link href="/contact" className="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-white/20 px-5 text-sm font-semibold hover:border-white/40">Écrire un message</Link>
          </div>
        )}
        {!paid && <HesitationAsk storeId={store.id} />}

        {/* Téléphone : le bouton reste en bas de l'écran tant que l'offre n'est pas ouverte. */}
        {!paid && !showPay && (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0d0d0d]/95 p-3 pb-[max(env(safe-area-inset-bottom),12px)] backdrop-blur lg:hidden">
            <a href="#debloquer" onClick={openPay} className="flex h-12 items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,#14b886,#00876a)] glow-hover text-[15px] font-semibold text-white">Débloquer ma boutique complète <ArrowDown className="h-4 w-4" /></a>
          </div>
        )}

        <div id="debloquer" className="scroll-mt-6">{!paid && showPay && <div className="mt-12 [animation:fade-in_.4s_ease-out_both]"><Paywall unlockStoreId={store.id} /></div>}</div>
      </div>
    </div>
  );
}
