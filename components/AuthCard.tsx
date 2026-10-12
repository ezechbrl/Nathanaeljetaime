"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { site } from "@/lib/site";

const input = "mt-1 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand/30";

// Formulaire de connexion / inscription. L'authentification réelle sera branchée plus tard :
// pour l'instant la soumission redirige vers le dashboard.
export function AuthCard({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const isLogin = mode === "login";

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-16">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand text-sm text-white">{site.name[0]}</span>
          {site.name}
        </Link>
        <h1 className="mt-10 text-3xl font-bold">{isLogin ? "Bon retour 👋" : "Crée ton compte"}</h1>
        <p className="mt-2 text-black/60">
          {isLogin ? "Connecte-toi pour retrouver tes boutiques." : "Ta première boutique est offerte, sans carte bancaire."}
        </p>

        <button type="button" className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-black/10 py-3 text-sm font-medium hover:bg-black/[0.02]">
          <span className="font-bold text-[#4285F4]">G</span> Continuer avec Google
        </button>
        <div className="my-6 flex items-center gap-3 text-xs text-black/40"><span className="h-px flex-1 bg-black/10" />ou<span className="h-px flex-1 bg-black/10" /></div>

        <form onSubmit={(e) => { e.preventDefault(); router.push("/dashboard"); }} className="space-y-4">
          {!isLogin && <label className="block text-sm font-medium">Prénom<input required className={input} /></label>}
          <label className="block text-sm font-medium">E-mail<input required type="email" className={input} /></label>
          <label className="block text-sm font-medium">
            Mot de passe
            <input required type="password" minLength={8} className={input} />
          </label>
          {isLogin && <p className="text-right text-xs"><a className="text-brand hover:underline" href="#">Mot de passe oublié ?</a></p>}
          <button className="w-full rounded-2xl bg-ink py-3 text-sm font-semibold text-white hover:bg-black/80">
            {isLogin ? "Se connecter" : "Créer mon compte"}
          </button>
        </form>
        {!isLogin && (
          <p className="mt-4 text-xs text-black/50">
            En créant un compte, tu acceptes les <Link href="/legal/cgu" className="underline">CGU</Link> et la{" "}
            <Link href="/legal/confidentialite" className="underline">politique de confidentialité</Link>.
          </p>
        )}
        <p className="mt-8 text-sm text-black/60">
          {isLogin ? "Pas encore de compte ? " : "Déjà un compte ? "}
          <Link href={isLogin ? "/inscription" : "/connexion"} className="font-semibold text-brand hover:underline">
            {isLogin ? "Créer un compte" : "Se connecter"}
          </Link>
        </p>
      </div>
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand to-indigo-900 lg:block">
        <div className="absolute inset-0 grid place-items-center p-16 text-white">
          <div>
            <p className="text-4xl font-bold leading-tight">Décris ton produit.<br />L'IA construit ta boutique.</p>
            <p className="mt-4 max-w-md text-white/70">Stratégie, textes, fiche produit et SEO, publiés sur Shopify en quelques minutes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
