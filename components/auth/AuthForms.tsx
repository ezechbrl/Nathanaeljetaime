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

// withEmail : connexion à Vigenia avec le nom de la boutique + un lien reçu par e-mail (sans app Shopify).
export function ShopifyForm({ next, cta = "Connecter", onBeforeRedirect, withEmail = false }: { next: string; cta?: string; onBeforeRedirect?: (autostart: boolean) => void; withEmail?: boolean }) {
  const [shop, setShop] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const router = useRouter();

  // Code à 6 chiffres lu sur le téléphone, tapé ici : la session s'ouvre sur cet appareil.
  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setChecking(true);
    try {
      await api.verifyEmailCode(email, code.replace(/\D/g, ""), normalizeShop(shop) ?? undefined);
      window.location.href = next;
    } catch (err) {
      setError((err as Error).message);
      setChecking(false);
    }
  }
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

  const slow = useRef<number | undefined>(undefined);
  // Retour arrière depuis Shopify : la page revient du cache avec le bouton encore « en cours ».
  useEffect(() => {
    const reset = (e: PageTransitionEvent) => { if (e.persisted) { window.clearTimeout(slow.current); setLoading(false); } };
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const domain = normalizeShop(shop);
    if (!domain) return setError("Saisis l'adresse de ta boutique, par exemple ma-boutique.myshopify.com");
    setError("");
    setLoading(true);
    if (withEmail) {
      try {
        const { loggedIn } = await api.sendEmailLink(email, next, domain);
        if (loggedIn) { window.location.href = next; return; } // nouveau compte : connecté, sans code
        setSent(true);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
      return;
    }
    onBeforeRedirect?.(false);
    // Si Shopify ne s'ouvre pas, on ne laisse jamais le bouton tourner indéfiniment.
    window.clearTimeout(slow.current);
    slow.current = window.setTimeout(() => { setLoading(false); setError("Shopify met du temps à répondre. Vérifie l'adresse puis réessaie."); }, 15000);
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
          <span className={`${inner} pt-9 bg-[#111111] sm:pt-10`}>
            <span className="absolute inset-x-0 top-0 bg-white py-1.5 text-center text-[11px] font-bold leading-tight text-[#03140d] sm:text-[12px]">Boutique dès 39 € · offre 24 h</span>
            <span aria-hidden className="absolute -top-10 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-white/[0.06] blur-2xl transition-opacity group-hover:opacity-100" />
            <ShopifyBag className="relative h-14 w-14 drop-shadow-[0_6px_18px_rgb(149_191_71/0.55)] transition-transform group-hover:scale-110 sm:h-16 sm:w-16" />
            <span className="relative text-[15px] font-semibold leading-snug sm:text-[17px]">{withEmail ? "J'ai déjà un compte Shopify" : "Connecter mon compte Shopify"}</span>
            <span className="relative inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full bg-[linear-gradient(180deg,#14b886,#00876a)] glow-hover px-4 text-sm font-semibold text-white">{withEmail ? "Continuer" : "Connexion"} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
          </span>
        </button>
        <a href={site.shopifySignupUrl} target="_blank" rel="noreferrer sponsored" onClick={() => { setCreated(true); setOpen(true); }} className="bg-white/15 group rounded-[22px] p-[1.5px] transition-transform hover:-translate-y-1">
          <span className={`${inner} pt-9 bg-[#111111] sm:pt-10`}>
            <span className="absolute inset-x-0 top-0 bg-white py-1.5 text-center text-[11px] font-bold leading-tight text-black sm:text-[12px]">1 €/mois pendant 3 mois</span>
            <span aria-hidden className="absolute -top-10 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-white/[0.06] blur-2xl" />
            <span className="relative">
              <ShopifyBag className="h-14 w-14 drop-shadow-[0_6px_18px_rgb(149_191_71/0.55)] transition-transform group-hover:scale-110 sm:h-16 sm:w-16" />
              <span className="absolute -bottom-1 -right-2 grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-[#121514]"><Store className="h-4 w-4 text-[#3dff9a]" /></span>
            </span>
            <span className="relative text-[15px] font-semibold leading-snug sm:text-[17px]">Créer mon compte Shopify</span>
            <span className="relative inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full bg-[linear-gradient(180deg,#14b886,#00876a)] px-3.5 text-sm font-semibold text-white glow-hover"><span className="sm:hidden">Création</span><span className="hidden sm:inline">Créer mon compte</span> <ArrowUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" /></span>
          </span>
        </a>
      </div>
      {/* Obligatoire (programme d'affiliation Shopify) : dire que le lien est un lien partenaire rémunéré. */}
      <p className="text-center text-[11.5px] leading-snug text-fg-faint">« Créer mon compte Shopify » est un lien partenaire : Vigenia fait partie du programme d'affiliation Shopify et peut recevoir une commission de Shopify. Ça ne change rien à ton prix.</p>

      {open && sent && (
        <div role="status" className="rounded-card border border-accent/25 bg-accent-deep/25 p-4 text-sm">
          <p className="font-medium text-fg">Vérifie ta boîte mail</p>
          <p className="mt-1 text-fg-muted">On a envoyé un e-mail à <span className="text-fg">{email}</span> (pense aux spams). Tape le code à 6 chiffres qu'il contient, ou clique sur le lien.</p>
          <form onSubmit={submitCode} className="mt-3 flex gap-2">
            <label htmlFor="login-code" className="sr-only">Code reçu par e-mail</label>
            <input id="login-code" autoFocus inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => { setCode(e.target.value); setError(""); }} placeholder="123456" maxLength={10} className="field min-w-0 flex-1 text-center text-lg tracking-[0.3em]" />
            <Button type="submit" disabled={checking || code.replace(/\D/g, "").length < 6}>{checking ? <Spinner /> : "Valider"}</Button>
          </form>
          {error && <p role="alert" className="mt-2 text-sm text-bad">{error}</p>}
          <button type="button" onClick={() => { setSent(false); setCode(""); setError(""); }} className="mt-3 text-xs text-fg-faint underline underline-offset-4 hover:text-fg">Changer d'e-mail ou renvoyer un code</button>
          {api.API_MODE !== "live" && <button type="button" onClick={() => router.push(next)} className="mt-3 block text-accent underline underline-offset-4">Ouvrir le lien (démo)</button>}
        </div>
      )}
      {open && !sent && (
        <form onSubmit={submit} className="rounded-card border border-accent/25 bg-accent-deep/20 p-3">
          {created && <ReturnSteps className="mb-4" />}
          <label htmlFor="shop" className="text-sm font-medium">{created ? "Colle l'adresse de ta boutique" : "Adresse de ta boutique"}</label>
          <div className="mt-2 flex items-center rounded-ctl border border-line/15 bg-white/[0.03] focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent/15">
            <input ref={input} id="shop" autoFocus={!created} value={shop} onChange={(e) => setShop(e.target.value)} autoComplete="off" spellCheck={false} placeholder={created ? "admin.shopify.com/store/…" : "ma-boutique"} className="min-w-0 flex-1 bg-transparent px-3 py-3 text-[15px] focus:outline-none" />
            <span className="pr-3 text-sm text-fg-faint">.myshopify.com</span>
          </div>
          {withEmail && (
            <>
              <label htmlFor="shop-email" className="mt-3 block text-sm font-medium">Ton e-mail</label>
              <input id="shop-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="toi@exemple.com" className="field mt-2" />
            </>
          )}
          {error && <p role="alert" className="mt-2 text-sm text-bad">{error}</p>}
          <Button type="submit" size="lg" className="mt-3 w-full" disabled={loading}>{loading ? <Spinner /> : <>{cta} <ArrowRight className="h-4 w-4" /></>}</Button>
          <p className="mt-2 text-xs text-fg-faint">{withEmail ? "Pas de mot de passe." : "Tu peux coller l'adresse complète de ton admin Shopify : on s'occupe du reste."}</p>
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

// Logo officiel de Shopify (le sac), pour signaler que la boutique part sur Shopify.
export function ShopifyBag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 292" className={className} aria-label="Shopify" role="img">
      <path d="M223.774 57.34c-.201-1.46-1.48-2.268-2.537-2.357-1.055-.088-23.383-1.743-23.383-1.743s-15.507-15.395-17.209-17.099c-1.703-1.703-5.029-1.185-6.32-.805-.19.056-3.388 1.043-8.678 2.68-5.18-14.906-14.322-28.604-30.405-28.604-.444 0-.901.018-1.358.044C129.31 3.407 123.644.779 118.75.779c-37.465 0-55.364 46.835-60.976 70.635-14.558 4.511-24.9 7.718-26.221 8.133-8.126 2.549-8.383 2.805-9.45 10.462C21.3 95.806.038 260.235.038 260.235l165.678 31.042 89.77-19.42S223.973 58.8 223.775 57.34zM156.49 40.848l-14.019 4.339c.005-.988.01-1.96.01-3.023 0-9.264-1.286-16.723-3.349-22.636 8.287 1.04 13.806 10.469 17.358 21.32zm-27.638-19.483c2.304 5.773 3.802 14.058 3.802 25.238 0 .572-.005 1.095-.01 1.624-9.117 2.824-19.024 5.89-28.953 8.966 5.575-21.516 16.025-31.908 25.161-35.828zm-11.131-10.537c1.617 0 3.246.549 4.805 1.622-12.007 5.65-24.877 19.88-30.312 48.297l-22.886 7.088C75.694 46.16 90.81 10.828 117.72 10.828z" fill="#95BF46" />
      <path d="M221.237 54.983c-1.055-.088-23.383-1.743-23.383-1.743s-15.507-15.395-17.209-17.099c-.637-.634-1.496-.959-2.394-1.099l-12.527 256.233 89.762-19.418S223.972 58.8 223.774 57.34c-.201-1.46-1.48-2.268-2.537-2.357" fill="#5E8E3E" />
      <path d="M135.242 104.585l-11.069 32.926s-9.698-5.176-21.586-5.176c-17.428 0-18.305 10.937-18.305 13.693 0 15.038 39.2 20.8 39.2 56.024 0 27.713-17.577 45.558-41.277 45.558-28.44 0-42.984-17.7-42.984-17.7l7.615-25.16s14.95 12.835 27.565 12.835c8.243 0 11.596-6.49 11.596-11.232 0-19.616-32.16-20.491-32.16-52.724 0-27.129 19.472-53.382 58.778-53.382 15.145 0 22.627 4.338 22.627 4.338" fill="#FFF" />
    </svg>
  );
}

// Google et e-mail : masqués par défaut (on se connecte avec Shopify), réactivables avec NEXT_PUBLIC_GOOGLE_AUTH=on / NEXT_PUBLIC_EMAIL_AUTH=on.
// Google exige le provider activé dans Supabase ; l'e-mail, un SMTP perso (Resend) pour lever la limite de Supabase.
const GOOGLE_ENABLED = process.env.NEXT_PUBLIC_GOOGLE_AUTH === "on";

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
    <a href={api.googleAuthUrl(next, ref)} onClick={onClick} className="flex h-14 w-full items-center justify-center gap-2.5 rounded-[16px] border border-white/15 bg-white/[0.05] text-base font-medium backdrop-blur transition-all hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.08]">
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

function EmailOption({ next, startOpen = false, primary = false }: { next: string; startOpen?: boolean; primary?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(startOpen);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "sent" | "checking">("idle");
  const [error, setError] = useState("");
  const demo = api.API_MODE !== "live";

  // Nouvelle adresse : connecté tout de suite. Adresse déjà inscrite : code à 6 chiffres par e-mail.
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setState("loading");
    try {
      const { loggedIn } = await api.sendEmailLink(email, next);
      if (loggedIn) { window.location.href = next; return; }
      setState("sent");
    } catch (err) {
      setError((err as Error).message);
      setState("idle");
    }
  }

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setState("checking");
    try {
      await api.verifyEmailCode(email, code.replace(/\D/g, ""));
      window.location.href = next;
    } catch (err) {
      setError((err as Error).message);
      setState("sent");
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="flex h-14 w-full items-center justify-center gap-2.5 rounded-[16px] border border-white/15 bg-white/[0.05] text-base font-medium backdrop-blur transition-all hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.08]">
        <Mail className="h-4 w-4 text-fg-muted" /> Continuer avec mon e-mail
      </button>
    );
  }
  if (state === "sent" || state === "checking") {
    return (
      <div role="status" className="rounded-card border border-accent/25 bg-accent-deep/25 p-4 text-sm">
        <p className="font-medium text-fg">Tu as déjà un compte</p>
        <p className="mt-1 text-fg-muted">Pour vérifier que c'est bien toi, on a envoyé un code à <span className="text-fg">{email}</span> (pense aux spams).</p>
        <form onSubmit={submitCode} className="mt-3 flex gap-2">
          <label htmlFor="email-code" className="sr-only">Code reçu par e-mail</label>
          <input id="email-code" autoFocus inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => { setCode(e.target.value); setError(""); }} placeholder="123456" maxLength={10} className="field min-w-0 flex-1 text-center text-lg tracking-[0.3em]" />
          <Button type="submit" disabled={state === "checking" || code.replace(/\D/g, "").length < 6}>{state === "checking" ? <Spinner /> : "Valider"}</Button>
        </form>
        {error && <p role="alert" className="mt-2 text-sm text-bad">{error}</p>}
        {demo && <button type="button" onClick={() => router.push(next)} className="mt-3 text-accent underline underline-offset-4">Continuer (démo)</button>}
      </div>
    );
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <label htmlFor="email" className="block text-sm font-medium text-white">Ton adresse e-mail</label>
      <input id="email" type="email" required autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="toi@exemple.com" className="field h-14 text-[16px]" />
      {error && <p role="alert" className="text-sm text-bad">{error}</p>}
      <Button type="submit" variant={primary ? "primary" : "secondary"} size="lg" className="h-14 w-full text-[16px]" disabled={state === "loading"}>
        {state === "loading" ? <Spinner /> : <>Continuer <ArrowRight className="h-4 w-4" /></>}
      </Button>
    </form>
  );
}

// Écran unique de connexion / inscription : par e-mail (lien sans mot de passe), Google en option.
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
      {/* En premier : l'e-mail (le plus simple), puis Google. Shopify vient après, pour ceux qui l'ont déjà. */}
      <EmailOption next={next} startOpen primary />
      {GOOGLE_ENABLED && <div className="mt-3"><GoogleButton next={next} /></div>}
      <ul className="mx-auto mt-4 grid max-w-sm grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-fg-muted">
        {["Sans mot de passe", "Sans carte bancaire", "Ta boutique est gardée", "Prête en 3 minutes"].map((t) => <li key={t} className="flex items-center gap-1.5"><span className="text-accent">✓</span>{t}</li>)}
      </ul>
      <div className="my-7 flex items-center gap-3 text-xs text-fg-faint"><span className="h-px flex-1 bg-line/10" />ou avec Shopify<span className="h-px flex-1 bg-line/10" /></div>
      <ShopifyForm next={next} withEmail cta={mode === "login" ? "Me connecter" : "Continuer"} />
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
