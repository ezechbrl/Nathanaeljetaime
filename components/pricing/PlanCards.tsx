"use client";

import { Check, CreditCard, Headphones, ShieldCheck, Sparkles, Star, Timer } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { LAUNCH_OFFER, PAID_PLANS, euro, withOffer, type Plan, type PlanFeature } from "@/lib/content/pricing";

export type Interval = "month" | "year";

// Fond « aurore » vert, commun à la page Tarifs et à l'écran d'abonnement.
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute -left-[15%] -top-[25%] h-[70%] w-[65%] rounded-full bg-[radial-gradient(closest-side,rgb(16_176_127/0.35),transparent)] [animation:aurora_14s_ease-in-out_infinite]" />
      <div className="absolute -right-[10%] top-[20%] h-[70%] w-[55%] rounded-full bg-[radial-gradient(closest-side,rgb(163_230_53/0.14),transparent)] [animation:aurora_18s_ease-in-out_infinite_reverse]" />
      {/* Rayons de lumière obliques */}
      <div className="absolute inset-0 opacity-60 [background:repeating-linear-gradient(100deg,transparent_0_70px,rgb(52_211_153/0.05)_70px_120px,transparent_120px_200px)] [mask-image:linear-gradient(180deg,black,transparent_85%)]" />
    </div>
  );
}

export function IntervalToggle({ value, onChange }: { value: Interval; onChange: (v: Interval) => void }) {
  return (
    <div className="mx-auto flex w-fit items-center gap-1 rounded-full border border-white/10 bg-black/30 p-1 text-[13px] font-semibold backdrop-blur" role="radiogroup" aria-label="Période">
      {(["month", "year"] as const).map((v) => (
        <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => onChange(v)} className={cn("rounded-full px-4 py-1.5 transition-colors", value === v ? "bg-[linear-gradient(180deg,#2ee6a6,#10b07f)] text-[#03140d] shadow-[0_0_20px_-4px_rgb(46_230_166/0.7)]" : "text-fg-muted hover:text-fg")}>
          {v === "month" ? "Mensuel" : "Annuel"}
        </button>
      ))}
      <span className="rounded-full bg-[#a3e635]/15 px-2.5 py-1 text-[12px] text-[#bef264]">Le moins cher</span>
    </div>
  );
}

// Prix payé à chaque période (mois ou an) ; avec l'offre de lancement, `was` est le prix normal (barré).
export function planPrice(plan: Plan, interval: Interval, offer = false) {
  const billed = interval === "year" ? plan.yearly : plan.monthly;
  return offer ? { billed: withOffer(billed), was: billed } : { billed, was: null };
}

// Temps restant avant `endsAt`, mis à jour chaque seconde (null une fois écoulé).
export function useCountdown(endsAt: string | null | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!endsAt) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [endsAt]);
  if (!endsAt) return null;
  const left = Math.max(0, new Date(endsAt).getTime() - now);
  if (!left) return null;
  const s = Math.floor(left / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return { h: pad(Math.floor(s / 3600)), m: pad(Math.floor((s % 3600) / 60)), s: pad(s % 60) };
}

type Left = NonNullable<ReturnType<typeof useCountdown>>;

// Bandeau de l'offre de lancement, avec le compte à rebours.
export function OfferBanner({ left }: { left: Left }) {
  return (
    <div className="mx-auto flex max-w-[760px] flex-wrap items-center justify-between gap-3 rounded-[18px] border border-[#2ee6a6]/40 bg-white/[0.04] px-5 py-3 backdrop-blur shadow-[0_0_40px_-15px_rgb(46_230_166/0.7)]">
      <div>
        <p className="bg-[linear-gradient(90deg,#6ee7b7,#2ee6a6_45%,#bef264)] bg-clip-text text-[17px] font-extrabold uppercase tracking-[0.03em] text-transparent">Offre de lancement : −{LAUNCH_OFFER.percent} % à vie</p>
        <p className="text-[12.5px] text-fg-muted">Abonne-toi avant la fin du compteur : ce prix reste le tien tant que tu restes abonné.</p>
      </div>
      <div className="flex items-end gap-1.5 font-semibold tabular-nums" aria-label={`Il reste ${left.h} heures ${left.m} minutes`}>
        {[{ v: left.h, l: "heures" }, { v: left.m, l: "min" }, { v: left.s, l: "sec" }].map((u, i) => (
          <span key={u.l} className="flex items-end gap-1.5">
            {i > 0 && <span className="pb-4 text-xl text-[#2ee6a6]">:</span>}
            <span className="flex flex-col items-center"><span className="grid h-11 min-w-[2.8rem] place-items-center rounded-lg border border-[#2ee6a6]/45 bg-[#2ee6a6]/10 px-1.5 text-[1.6rem] leading-none text-[#a7f3d0] shadow-[0_0_18px_-4px_rgb(46_230_166/0.6)]">{u.v}</span><span className="mt-1 text-[10px] font-medium uppercase tracking-wider text-[#6ee7b7]/80">{u.l}</span></span>
          </span>
        ))}
      </div>
    </div>
  );
}

// Les deux offres côte à côte. `action` rend le bouton (paiement dans l'app, inscription sur le site).
export function PlanCards({ interval, action, left, offer = false }: { interval: Interval; action: (plan: Plan, interval: Interval) => ReactNode; left?: Left | null; offer?: boolean }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {PAID_PLANS.map((plan) => {
        const { billed, was } = planPrice(plan, interval, offer || !!left);
        const featured = plan.featured;
        return (
          <div key={plan.id} className={cn("relative rounded-[22px] p-px", featured ? "bg-[linear-gradient(160deg,#2ee6a6,rgb(255_255_255/0.08)_45%,#a3e635)] shadow-[0_0_60px_-18px_rgb(46_230_166/0.55)]" : "bg-[linear-gradient(160deg,rgb(52_211_153/0.45),rgb(255_255_255/0.06)_50%,rgb(52_211_153/0.2))]")}>
            <div className="flex h-full flex-col rounded-[21px] bg-[linear-gradient(180deg,rgb(10_40_30/0.85),rgb(4_16_12/0.92))] p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[1.6rem] font-semibold tracking-[-0.02em]">{plan.name}</p>
                <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11.5px] font-semibold", featured ? "border-[#a3e635]/40 bg-[#a3e635]/10 text-[#bef264]" : "border-[#2ee6a6]/35 bg-[#2ee6a6]/10 text-[#a7f3d0]")}>{featured && <Sparkles className="h-3 w-3" />} {plan.badge}</span>
              </div>
              <p className="mt-2 text-[13.5px] leading-snug text-fg-muted">{plan.tagline}</p>
              <p className="mt-4 flex flex-wrap items-baseline gap-x-1 gap-y-1">
                {was !== null && <span className="mr-1.5 whitespace-nowrap text-lg font-semibold text-fg-faint line-through decoration-[#ef4444] decoration-[3px] sm:text-xl">{euro(was)}</span>}
                <span className="whitespace-nowrap text-[2.4rem] font-semibold leading-none tracking-[-0.04em] tabular-nums sm:text-[2.8rem]">{euro(billed)}</span>
                <span className="whitespace-nowrap text-sm text-fg-muted">{interval === "year" ? "/ an" : "/ mois"}</span>
                {was !== null && <span className="ml-1.5 self-center whitespace-nowrap rounded-full bg-[#f87171]/15 px-2 py-0.5 text-[12px] font-bold text-[#fca5a5]">−{LAUNCH_OFFER.percent} %</span>}
              </p>
              {interval === "year" ? (
                <p className="mt-2 text-[14px] font-medium leading-snug text-[#6ee7b7]">
                  <span className="text-[16px] font-semibold text-white">≈ {(Math.round((billed / 12) * 10) / 10).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € / mois</span>
                  <span className="block text-[12.5px] text-fg-muted">payé une fois par an</span>
                </p>
              ) : <p className="mt-1.5 min-h-5 text-[14px] font-medium text-[#6ee7b7]">Sans engagement</p>}
              {left && <p className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full border border-[#2ee6a6]/30 bg-[#2ee6a6]/10 px-2.5 py-1 text-[12px] font-semibold tabular-nums text-[#a7f3d0]"><Timer className="h-3.5 w-3.5" /> Ce prix encore {left.h}:{left.m}:{left.s}</p>}
              <div className="mt-5">{action(plan, interval)}</div>
              <div className="my-5 h-px bg-white/10" />
              <p className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-fg-faint">{plan.id === "agency" ? "Tout le Starter, et en plus" : "Ce qui est inclus"}</p>
              <ul className="mt-3 space-y-2.5 text-[14.5px]">
                {plan.features.map((f) => <FeatureItem key={typeof f === "string" ? f : f.text} f={f} />)}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Une ligne d'offre ; au survol (ou au toucher sur téléphone), une petite bulle montre un aperçu réel.
function FeatureItem({ f }: { f: PlanFeature }) {
  const [open, setOpen] = useState(false);
  const check = <span className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-[#2ee6a6]/15"><Check className="h-3 w-3 text-[#2ee6a6]" strokeWidth={3} /></span>;
  if (typeof f === "string") return <li className="flex gap-2.5">{check}{f}</li>;
  return (
    <li className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" onClick={() => setOpen((o) => !o)} onBlur={() => setOpen(false)} aria-expanded={open} className="flex w-full gap-2.5 text-left">
        {check}
        <span className="flex-1 underline decoration-[#2ee6a6]/50 decoration-dotted underline-offset-4">{f.text}</span>
      </button>
      {open && (
        <div role="tooltip" className="absolute bottom-full left-0 right-0 z-30 mb-2 rounded-[14px] border border-[#2ee6a6]/30 bg-[#06261c]/95 p-2.5 shadow-[0_20px_50px_-15px_rgb(0_0_0/0.8),0_0_30px_-10px_rgb(46_230_166/0.5)] backdrop-blur-xl [animation:fade-in_.15s_ease-out]">
          <FeaturePreview kind={f.preview} />
        </div>
      )}
    </li>
  );
}

function FeaturePreview({ kind }: { kind: Extract<PlanFeature, object>["preview"] }) {
  if (kind === "photos-pro") {
    return (
      <div>
        <div className="grid grid-cols-3 gap-1.5">
          {["/showcase/norde-scene.jpg", "/showcase/norde-detail.jpg", "/showcase/norde-packshot.jpg"].map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="Photo produit créée par l'IA de Vitrio" loading="lazy" className="aspect-square w-full rounded-[8px] object-cover" />
          ))}
        </div>
        <p className="mt-1.5 text-[11.5px] text-fg-muted">Mises en situation, détails, packshots : <span className="font-semibold text-white">300 / mois</span></p>
      </div>
    );
  }
  if (kind === "stores") {
    return (
      <div>
        <div className="grid grid-cols-2 gap-1.5">
          {[["/showcase/norde.jpg", "Nordé"], ["/showcase/macho.jpg", "Mâchô"]].map(([src, name]) => (
            <div key={name} className="overflow-hidden rounded-[8px] bg-white/[0.05]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
              <p className="px-2 py-1 text-[11.5px] font-semibold">{name} <span className="font-normal text-[#6ee7b7]">· en ligne</span></p>
            </div>
          ))}
        </div>
        <p className="mt-1.5 text-[11.5px] text-fg-muted">Plusieurs boutiques, un seul espace</p>
      </div>
    );
  }
  if (kind === "coach") {
    return (
      <div className="space-y-1.5 text-[12px]">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#6ee7b7]">Idées pour vendre plus · aujourd'hui</p>
        {["Ajoute une réponse à « Est-ce que ça colle ? » sur l'accueil", "Mets le lot de 2 en avant sur la fiche produit"].map((t) => (
          <p key={t} className="rounded-[10px] bg-white/[0.05] px-3 py-2">{t} <span className="text-[#2ee6a6]">· Appliquer avec l'IA →</span></p>
        ))}
      </div>
    );
  }
  if (kind === "photos") {
    return (
      <div>
        <div className="grid grid-cols-3 gap-1.5">
          {["/showcase/norde-white.jpg", "/showcase/norde.jpg", "/showcase/macho.jpg"].map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="Photo produit créée par l'IA de Vitrio" loading="lazy" className="aspect-square w-full rounded-[8px] object-cover" />
          ))}
        </div>
        <p className="mt-1.5 text-[11.5px] text-fg-muted">Créées par l'IA de Vitrio</p>
      </div>
    );
  }
  if (kind === "reviews") {
    return (
      <div className="space-y-1.5">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#6ee7b7]">Exemple d'avis importés</p>
        {[["Karim B.", "Le micro est super clair."], ["Julie M.", "Confortable même après 4 h de jeu."]].map(([n, t]) => (
          <div key={n} className="rounded-[10px] bg-white/[0.05] px-3 py-2 text-[12.5px]">
            <p className="flex items-center justify-between font-semibold">{n}<span className="flex text-[#fbbf24]">{[0, 1, 2, 3, 4].map((i) => <Star key={i} className="h-3 w-3 fill-current" />)}</span></p>
            <p className="mt-0.5 text-fg-muted">« {t} »</p>
          </div>
        ))}

      </div>
    );
  }
  if (kind === "texts") {
    return (
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6ee7b7]">Titre de l'accueil · casque gaming</p>
        <p className="mt-1 text-[17px] font-semibold leading-tight">Entends tout. Avant les autres.</p>
        <p className="mt-1 text-[12px] text-fg-muted">Son spatial, micro antibruit, 40 h d'autonomie.</p>

      </div>
    );
  }
  return (
    <div className="space-y-1.5 text-[12.5px]">
      {[["1 casque", "59,00 €", ""], ["Lot de 2", "100,30 €", "−15 %"], ["Lot de 3", "141,60 €", "−20 %"]].map(([l, p, d], i) => (
        <div key={l} className={cn("flex items-center justify-between rounded-[10px] border px-3 py-2", i === 1 ? "border-[#2ee6a6]/60 bg-[#2ee6a6]/10" : "border-white/10 bg-white/[0.03]")}>
          <span className="font-medium">{l}{d && <span className="ml-2 rounded-full bg-[#2ee6a6]/20 px-1.5 py-0.5 text-[10.5px] font-bold text-[#a7f3d0]">{d}</span>}</span>
          <span className="tabular-nums">{p}</span>
        </div>
      ))}
    </div>
  );
}

export function TrustRow() {
  return (
    <>
    {/* Le prix remis en perspective : ordres de grandeur pour une boutique complète. */}
    <div className="mx-auto mt-6 grid max-w-[640px] grid-cols-3 overflow-hidden rounded-[16px] border border-white/10 text-center">
      {[["Une agence", "≈ 2 000 €", "et 3 semaines"], ["Un freelance", "≈ 500 €", "et 1 à 2 semaines"], ["Vitrio", "39 €/mois", "et 10 minutes"]].map(([who, price, time], i) => (
        <div key={who} className={cn("px-2 py-3", i === 2 ? "bg-[#2ee6a6]/12 shadow-[inset_0_0_30px_-10px_rgb(46_230_166/0.5)]" : "bg-black/20", i > 0 && "border-l border-white/10")}>
          <p className={cn("text-[11.5px] font-semibold uppercase tracking-[0.08em]", i === 2 ? "text-[#6ee7b7]" : "text-fg-faint")}>{who}</p>
          <p className={cn("mt-1 whitespace-nowrap text-[16px] font-bold tabular-nums sm:text-[20px]", i === 2 ? "text-white" : "text-fg-muted line-through decoration-[#ef4444]/70")}>{price}</p>
          <p className="text-[11.5px] text-fg-muted">{time}</p>
        </div>
      ))}
    </div>
    <p className="mt-2 text-center text-[11.5px] text-fg-faint">Ordres de grandeur pour une boutique Shopify complète. Avec Vitrio, l'IA la plus récente fait le travail, et tu peux tout modifier.</p>
    <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12.5px] text-fg-muted">
      <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#2ee6a6]" /> Annulation en 1 clic</span>
      <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-[#2ee6a6]" /> Paiement sécurisé par Stripe</span>
      <span className="inline-flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5 text-[#2ee6a6]" /> Carte, Apple Pay, Google Pay</span>
      <span className="inline-flex items-center gap-1.5"><Headphones className="h-3.5 w-3.5 text-[#2ee6a6]" /> Support humain</span>
    </div>
    </>
  );
}

// Bouton lumineux des offres.
export const planButtonClass = (featured?: boolean) =>
  cn(
    "group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold transition-all hover:-translate-y-px disabled:opacity-60",
    featured
      ? "bg-[linear-gradient(180deg,#34f0b0,#0fae7c)] text-[#03140d] shadow-[inset_0_1px_0_rgb(255_255_255/0.4),0_10px_30px_-8px_rgb(46_230_166/0.7)]"
      : "border border-[#2ee6a6]/40 bg-[#2ee6a6]/10 text-[#d1fae5] shadow-[0_0_24px_-10px_rgb(46_230_166/0.6)] hover:bg-[#2ee6a6]/20",
  );
