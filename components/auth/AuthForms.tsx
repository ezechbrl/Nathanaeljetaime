"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button, Spinner } from "@/components/ui/Button";
import * as api from "@/lib/api/client";

function GoogleButton() {
  const params = useSearchParams();
  return (
    <a href={api.googleAuthUrl(params.get("ref") ?? undefined)} className="flex h-11 w-full items-center justify-center gap-2.5 rounded-ctl border border-white/10 bg-white/[0.03] text-sm transition-colors hover:border-white/20 hover:bg-white/[0.06]">
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
        <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.3 12 2.3 6.6 2.3 2.3 6.6 2.3 12s4.3 9.7 9.7 9.7c5.6 0 9.3-3.9 9.3-9.5 0-.6-.1-1.1-.2-1.6H12Z" />
      </svg>
      Continuer avec Google
    </a>
  );
}

function Divider() {
  return <div className="my-6 flex items-center gap-3 text-xs text-fg-faint"><span className="h-px flex-1 bg-white/[0.08]" />ou avec ton e-mail<span className="h-px flex-1 bg-white/[0.08]" /></div>;
}

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

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setLoading(true);
    setError("");
    try {
      await api.login({ email: String(f.get("email")), password: String(f.get("password")) });
      router.push(nextUrl(params));
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <>
      <GoogleButton />
      <Divider />
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm">E-mail<input name="email" type="email" required autoComplete="email" className="field mt-1.5" /></label>
        <label className="block text-sm">
          <span className="flex justify-between">Mot de passe <Link href="/mot-de-passe-oublie" className="text-fg-muted hover:text-fg">Oublié ?</Link></span>
          <input name="password" type="password" required minLength={8} autoComplete="current-password" className="field mt-1.5" />
        </label>
        {error && <p role="alert" className="text-sm text-bad">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading ? <Spinner /> : "Se connecter"}</Button>
      </form>
      <p className="mt-8 text-center text-sm text-fg-muted">
        Pas encore de compte ? <Link href={`/inscription?${params}`} className="text-fg underline underline-offset-4">Créer un compte</Link>
      </p>
    </>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const brief = params.get("brief");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setLoading(true);
    setError("");
    try {
      let ref: string | undefined;
      try { ref = document.cookie.match(/(?:^|; )ref=([^;]+)/)?.[1]; } catch { /* cookies indisponibles */ }
      await api.register({ firstName: String(f.get("firstName")), email: String(f.get("email")), password: String(f.get("password")), ref });
      router.push(nextUrl(params));
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <>
      {brief && (
        <div className="mb-6 rounded-card border border-accent/20 bg-accent-deep/20 p-4 text-sm">
          <p className="text-xs uppercase tracking-[0.14em] text-accent">Ton projet</p>
          <p className="mt-1 line-clamp-2 text-fg-muted">« {brief} »</p>
        </div>
      )}
      <GoogleButton />
      <Divider />
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm">Prénom<input name="firstName" required autoComplete="given-name" className="field mt-1.5" /></label>
        <label className="block text-sm">E-mail<input name="email" type="email" required autoComplete="email" className="field mt-1.5" /></label>
        <label className="block text-sm">Mot de passe<input name="password" type="password" required minLength={8} autoComplete="new-password" className="field mt-1.5" /><span className="mt-1 block text-xs text-fg-faint">8 caractères minimum</span></label>
        {error && <p role="alert" className="text-sm text-bad">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading ? <Spinner /> : brief ? "Créer mon compte et ma boutique" : "Créer mon compte"}</Button>
      </form>
      <p className="mt-5 text-xs leading-relaxed text-fg-faint">
        En continuant, tu acceptes les <Link href="/legal/cgu" className="underline">CGU</Link> et la <Link href="/legal/confidentialite" className="underline">politique de confidentialité</Link>.
      </p>
      <p className="mt-8 text-center text-sm text-fg-muted">
        Déjà un compte ? <Link href={`/connexion?${params}`} className="text-fg underline underline-offset-4">Se connecter</Link>
      </p>
    </>
  );
}

export function ForgotForm() {
  const [state, setState] = useState<"idle" | "loading" | "sent">("idle");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    await api.forgotPassword(String(new FormData(e.currentTarget).get("email"))).catch(() => {});
    setState("sent");
  }
  if (state === "sent") {
    return <p className="rounded-card border border-accent/20 bg-accent-deep/20 p-4 text-sm text-fg-muted">Si un compte existe avec cette adresse, tu vas recevoir un lien pour choisir un nouveau mot de passe.</p>;
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-sm">E-mail<input name="email" type="email" required autoComplete="email" className="field mt-1.5" /></label>
      <Button type="submit" size="lg" className="w-full" disabled={state === "loading"}>{state === "loading" ? <Spinner /> : "Envoyer le lien"}</Button>
      <p className="text-center text-sm"><Link href="/connexion" className="text-fg-muted hover:text-fg">Retour à la connexion</Link></p>
    </form>
  );
}

export function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (f.get("password") !== f.get("confirm")) return setError("Les deux mots de passe ne correspondent pas.");
    setLoading(true);
    try {
      await api.resetPassword(params.get("token") ?? "", String(f.get("password")));
      router.push("/connexion?reset=1");
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-sm">Nouveau mot de passe<input name="password" type="password" required minLength={8} autoComplete="new-password" className="field mt-1.5" /></label>
      <label className="block text-sm">Confirmation<input name="confirm" type="password" required minLength={8} autoComplete="new-password" className="field mt-1.5" /></label>
      {error && <p role="alert" className="text-sm text-bad">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading ? <Spinner /> : "Enregistrer"}</Button>
    </form>
  );
}
