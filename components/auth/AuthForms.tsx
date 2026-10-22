"use client";

import { site } from "@/lib/site";
import { ArrowRight, ArrowUp, Mail, Store } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button, Spinner } from "@/components/ui/Button";
import * as api from "@/lib/api/client";

const ERRORS: Record<string, string> = {
  signature: "La connexion Shopify n'a pas pu être vérifiée. Réessaie.",
  session: "La connexion n'a pas pu aboutir : vérifie que les cookies sont autorisés dans ton navigateur, puis réessaie.",
  "compte-existant": "Un compte existe déjà avec l'e-mail de cette boutique. Connecte-toi avec ta première boutique, puis relie celle-ci depuis Paramètres.",
  google: "La connexion Google a échoué. Réessaie.",
  lien: "Ce lien de connexion n'est plus valide (il expire au bout d'une heure). Demande-en un nouveau.",
};

// Après connexion : on reprend là où la personne en était (brief tapé sur la landing, offre choisie…).
function nextUrl(params: URLSearchParams) {
  const next = params.get("next");
  if (next?.startsWith("/app")) return next;
  if (params.get("plan")) return `/app/abonnement?plan=${params.get("plan")}&interval=${params.get("interval") ?? "month"}`;
  const carry = new URLSearchParams();
  for (const k of ["brief", "url", "mode"]) {
    const v = params.get(k);
    if (v) carry.set(k, v);
  }
  return carry.size ? `/app?${carry}` : "/app";
}

export function normalizeShop(input: string) {
  const raw = input.trim().toLowerCase();
  // Adresse copiée depuis l'admin : admin.shopify.com/store/ma-boutique/…
  const admin = raw.match(/admin\.shopify\.com\/store\/([a-z0-9][a-z0-9-]*)/);
  const d = admin ? admin[1] : raw.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  if (!d) return null;
  const full = d.endsWith(".myshopify.com") ? d : `${d.replace(/\.myshopify$/, "")}.myshopify.com`;
  return /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(full) ? full : null;
}

export function ShopifyForm({ next, cta = "Connecter", onBeforeRedirect }: { next: string; cta?: string; onBeforeRedirect?: (autostart: boolean) => void }) {
  const [shop, setShop] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  // Retour depuis l'onglet Shopify : le champ est prêt, il n'y a plus qu'à coller.
  useEffect(() => {
    if (!created) return;
    const onBack = () => { if (document.visibilityState === "visible") input.current?.focus(); };
    document.addEventListener("visibilitychange", onBack);
    return () => document.removeEventListener("visibilitychange", onBack);
  }, [created]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const domain = normalizeShop(shop);
    if (!domain) return setError("Saisis l'adresse de ta boutique, par exemple ma-boutique.myshopify.com");
    setError("");
    setLoading(true);
    onBeforeRedirect?.(false);
    await api.loginWithShopify(domain, next).catch((err) => {
      setError((err as Error).message);
      setLoading(false);
    });
  }

  const inner = "relative flex h-full min-h-[200px] flex-col items-center justify-center gap-3 overflow-hidden rounded-[21px] p-4 text-center sm:min-h-[230px] sm:gap-4 sm:p-5";
  return (
    <div className="space-y-4">
      {/* Deux grands encadrés lumineux : relier son compte Shopify, ou en créer un (lien partenaire). */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <button type="button" onClick={() => setOpen(true)} aria-expanded={open} className="glow-frame group rounded-[22px] p-[1.5px] text-left transition-transform hover:-translate-y-1">
          <span className={`${inner} pt-9 bg-[linear-gradient(180deg,rgb(10_58_43/0.97),rgb(4_24_18/0.98))] sm:pt-10`}>
            <span className="absolute inset-x-0 top-0 bg-[linear-gradient(90deg,#10b981,#2ee6a6)] py-1.5 text-center text-[11px] font-bold leading-tight text-[#03140d] sm:text-[12px]">−50 % à vie · offre 24 h</span>
            <span aria-hidden className="absolute -top-10 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-[#2ee6a6]/25 blur-2xl transition-opacity group-hover:opacity-100" />
            <ShopifyBag className="relative h-14 w-14 drop-shadow-[0_6px_18px_rgb(149_191_71/0.55)] transition-transform group-hover:scale-110 sm:h-16 sm:w-16" />
            <span className="relative text-[15px] font-semibold leading-snug sm:text-[17px]">Connecter mon compte Shopify</span>
            <span className="relative inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full bg-[linear-gradient(180deg,#34f0b0,#0fae7c)] px-4 text-sm font-semibold text-[#03140d] shadow-[0_8px_24px_-6px_rgb(46_230_166/0.8)]">Connexion <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
          </span>
        </button>
        <a href={site.shopifySignupUrl} target="_blank" rel="noreferrer sponsored" onClick={() => { setCreated(true); setOpen(true); }} className="glow-frame glow-frame-lime group rounded-[22px] p-[1.5px] transition-transform hover:-translate-y-1">
          <span className={`${inner} pt-9 bg-[linear-gradient(180deg,rgb(12_60_32/0.96),rgb(4_26_14/0.98))] sm:pt-10`}>
            <span className="absolute inset-x-0 top-0 bg-[linear-gradient(90deg,#22c55e,#4ade80)] py-1.5 text-center text-[11px] font-bold leading-tight text-[#052e16] sm:text-[12px]">1 €/mois pendant 3 mois</span>
            <span aria-hidden className="absolute -top-10 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-[#4ade80]/20 blur-2xl" />
            <span className="relative">
              <ShopifyBag className="h-14 w-14 drop-shadow-[0_6px_18px_rgb(149_191_71/0.55)] transition-transform group-hover:scale-110 sm:h-16 sm:w-16" />
              <span className="absolute -bottom-1 -right-2 grid h-7 w-7 place-items-center rounded-full border border-[#4ade80]/40 bg-[#052e16]"><Store className="h-4 w-4 text-[#4ade80]" /></span>
            </span>
            <span className="relative text-[15px] font-semibold leading-snug sm:text-[17px]">Créer mon compte Shopify</span>
            <span className="relative inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full bg-[linear-gradient(180deg,#6ee7a0,#22c55e)] px-3.5 text-sm font-semibold text-[#052e16] shadow-[0_8px_24px_-6px_rgb(74_222_128/0.7)]"><span className="sm:hidden">Création</span><span className="hidden sm:inline">Créer mon compte</span> <ArrowUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" /></span>
          </span>
        </a>
      </div>

      {open && (
        <form onSubmit={submit} className="rounded-card border border-accent/25 bg-accent-deep/20 p-3">
          {created && <ReturnSteps className="mb-4" />}
          <label htmlFor="shop" className="text-sm font-medium">{created ? "Colle l'adresse de ta boutique" : "Adresse de ta boutique"}</label>
          <div className="mt-2 flex items-center rounded-ctl border border-line/15 bg-white/[0.03] focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent/15">
            <input ref={input} id="shop" autoFocus={!created} value={shop} onChange={(e) => setShop(e.target.value)} autoComplete="off" spellCheck={false} placeholder={created ? "admin.shopify.com/store/…" : "ma-boutique"} className="min-w-0 flex-1 bg-transparent px-3 py-3 text-[15px] focus:outline-none" />
            <span className="pr-3 text-sm text-fg-faint">.myshopify.com</span>
          </div>
          {error && <p role="alert" className="mt-2 text-sm text-bad">{error}</p>}
          <Button type="submit" size="lg" className="mt-3 w-full" disabled={loading}>{loading ? <Spinner /> : <>{cta} <ArrowRight className="h-4 w-4" /></>}</Button>
          <p className="mt-2 text-xs text-fg-faint">Tu peux coller l'adresse complète de ton admin Shopify : on s'occupe du reste.</p>
        </form>
      )}
      <p className="text-center text-xs text-fg-faint">Offre Shopify en ce moment · lien partenaire</p>
    </div>
  );
}

// Shopify s'ouvre dans un nouvel onglet : on explique comment revenir ici et quoi coller.
export function ReturnSteps({ className }: { className?: string }) {
  const steps = [
    <>Crée ton compte dans l'onglet Shopify qui vient de s'ouvrir.</>,
    <>Une fois dans ton admin, <b className="text-fg">copie l'adresse</b> en haut du navigateur (elle ressemble à <span className="text-accent">admin.shopify.com/store/ma-boutique</span>).</>,
    <>Reviens sur <b className="text-fg">cet onglet Vigenia</b> et colle-la juste en dessous.</>,
  ];
  return (
    <ol className={`space-y-2.5 text-left text-sm ${className ?? ""}`}>
      {steps.map((t, i) => (
        <li key={i} className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-[#03140d]">{i + 1}</span><span className="pt-0.5 text-fg-muted">{t}</span></li>
      ))}
    </ol>
  );
}

// Sac Shopify simplifié (couleurs de la marque), pour signaler l'intégration.
export function ShopifyBag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 50" className={className} aria-label="Shopify" role="img">
      <path d="M31.3 9.6c0-.2-.2-.4-.4-.4l-3.4-.3-2.5-2.5c-.3-.3-.8-.2-1-.1l-1.3.4C21.9 4.2 20.6 2.4 18.4 2.4h-.2C17.6 1.6 16.8 1.2 16.1 1.2c-5.2 0-7.7 6.5-8.5 9.8l-3.6 1.1c-1.1.4-1.2.4-1.3 1.4L0 37.6 22.8 42 35.2 39.3 31.3 9.6Z" fill="#95BF47" />
      <path d="M30.9 9.2l-3.4-.3-2.5-2.5c-.1-.1-.2-.1-.3-.2L22.8 42l12.4-2.7L31.3 9.6c0-.2-.2-.4-.4-.4Z" fill="#5E8E3E" />
      <path d="M18.3 16.7l-1.5 4.4s-1.3-.7-2.9-.7c-2.3 0-2.4 1.5-2.4 1.8 0 2 5.2 2.8 5.2 7.5 0 3.7-2.3 6-5.5 6-3.8 0-5.7-2.4-5.7-2.4l1-3.4s2 1.7 3.7 1.7c1.1 0 1.6-.9 1.6-1.5 0-2.6-4.3-2.7-4.3-7 0-3.6 2.6-7.1 7.8-7.1 2 0 3 .6 3 .6Z" fill="#fff" />
    </svg>
  );
}

// Google et e-mail : masqués par défaut (on se connecte avec Shopify), réactivables avec NEXT_PUBLIC_GOOGLE_AUTH=on / NEXT_PUBLIC_EMAIL_AUTH=on.
// Google exige le provider activé dans Supabase ; l'e-mail, un SMTP perso (Resend) pour lever la limite de Supabase.
const GOOGLE_ENABLED = process.env.NEXT_PUBLIC_GOOGLE_AUTH === "on";
const EMAIL_ENABLED = process.env.NEXT_PUBLIC_EMAIL_AUTH === "on";

function GoogleButton({ next }: { next: string }) {
  const router = useRouter();
  async function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (api.API_MODE === "live") return;
    e.preventDefault();
    await api.loginWithGoogleDemo();
    router.push(api.googleAuthUrl(next));
  }
  let ref: string | undefined;
  try { ref = typeof document !== "undefined" ? document.cookie.match(/(?:^|; )ref=([^;]+)/)?.[1] : undefined; } catch { /* cookies indisponibles */ }
  return (
    <a href={api.googleAuthUrl(next, ref)} onClick={onClick} className="flex h-14 w-full items-center justify-center gap-2.5 rounded-[16px] border border-white/15 bg-white/[0.05] text-base font-medium backdrop-blur transition-all hover:-translate-y-0.5 hover:border-[#2ee6a6]/50 hover:bg-white/[0.08]">
      <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
        <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
      </svg>
      Continuer avec Google
    </a>
  );
}

function EmailOption({ next }: { next: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "sent">("idle");
  const [error, setError] = useState("");
  const demo = api.API_MODE !== "live";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setState("loading");
    try {
      await api.sendEmailLink(email, next);
      setState("sent");
    } catch (err) {
      setError((err as Error).message);
      setState("idle");
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="flex h-14 w-full items-center justify-center gap-2.5 rounded-[16px] border border-white/15 bg-white/[0.05] text-base font-medium backdrop-blur transition-all hover:-translate-y-0.5 hover:border-[#2ee6a6]/50 hover:bg-white/[0.08]">
        <Mail className="h-4 w-4 text-fg-muted" /> Continuer avec mon e-mail
      </button>
    );
  }
  if (state === "sent") {
    return (
      <div role="status" className="rounded-card border border-accent/25 bg-accent-deep/25 p-4 text-sm">
        <p className="text-fg">Vérifie ta boîte mail</p>
        <p className="mt-1 text-fg-muted">On a envoyé un lien de connexion à <span className="text-fg">{email}</span>. Clique dessus pour continuer (pense aux spams).</p>
        {demo && (
          <button type="button" onClick={() => router.push(`/connecter-shopify?next=${encodeURIComponent(next)}`)} className="mt-3 text-accent underline underline-offset-4">
            Ouvrir le lien (démo)
          </button>
        )}
      </div>
    );
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <label htmlFor="email" className="block text-sm text-fg-muted">Ton adresse e-mail</label>
      <input id="email" type="email" required autoFocus autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="toi@exemple.com" className="field" />
      {error && <p role="alert" className="text-sm text-bad">{error}</p>}
      <Button type="submit" variant="secondary" size="lg" className="w-full" disabled={state === "loading"}>
        {state === "loading" ? <Spinner /> : "Recevoir mon lien de connexion"}
      </Button>
      <p className="text-xs text-fg-faint">Pas de mot de passe : tu reçois un lien valable une heure.</p>
    </form>
  );
}

// Écran unique de connexion / inscription : Shopify d'abord, puis Google ou e-mail.
export function AuthPanel({ mode }: { mode: "login" | "register" }) {
  const params = useSearchParams();
  const next = nextUrl(params);
  const brief = params.get("brief");
  const error = params.get("error");
  return (
    <>
      {error && ERRORS[error] && <p role="alert" className="mb-6 rounded-card border border-bad/25 bg-bad/5 p-4 text-sm text-fg">{ERRORS[error]}</p>}
      {brief && (
        <div className="mb-6 rounded-card border border-accent/25 bg-accent-deep/25 p-4 text-sm">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-accent">Ton projet</p>
          <p className="mt-1 line-clamp-2 text-fg-muted">« {brief} »</p>
        </div>
      )}
      <ShopifyForm next={next} />
      {(GOOGLE_ENABLED || EMAIL_ENABLED) && (
        <>
          <div className="my-6 flex items-center gap-3 text-xs text-fg-faint"><span className="h-px flex-1 bg-line/10" />ou<span className="h-px flex-1 bg-line/10" /></div>
          <div className="space-y-2.5">
            {GOOGLE_ENABLED && <GoogleButton next={next} />}
            {EMAIL_ENABLED && <EmailOption next={next} />}
          </div>
          <p className="mt-3 text-xs text-fg-faint">On te demandera ensuite de relier ta boutique Shopify.</p>
        </>
      )}
      <p className="mt-8 text-xs leading-relaxed text-fg-faint">
        En continuant, tu acceptes les <Link href="/legal/cgu" className="underline">CGU</Link> et la <Link href="/legal/confidentialite" className="underline">politique de confidentialité</Link>.
      </p>
    </>
  );
}

export function ConnectShopifyPanel() {
  const params = useSearchParams();
  const next = params.get("next")?.startsWith("/") ? params.get("next")! : "/app";
  return <ShopifyForm next={next} />;
}
