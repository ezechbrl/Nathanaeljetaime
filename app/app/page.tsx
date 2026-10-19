"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useApp } from "@/components/app/AppContext";
import { CreateStore } from "@/components/app/CreateStore";
import { StoreCard } from "@/components/app/StoreCard";
import { useToast } from "@/components/ui/Toast";
import { LightRays } from "@/components/ui/LightRays";
import { TutorialVideo } from "@/components/ui/TutorialVideo";

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? "Bonsoir" : h < 18 ? "Bonjour" : "Bonsoir";
}

function Welcome() {
  const params = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const { refresh } = useApp();
  useEffect(() => {
    if (params.get("checkout") !== "success") return;
    refresh();
    toast("Ton abonnement est activé. À toi de jouer !");
    router.replace("/app");
  }, [params, refresh, router, toast]);
  return null;
}


export default function AppHome() {
  const { user, stores } = useApp();
  return (
    <div>
      <section className="relative px-5 pb-16 pt-16 sm:px-8 sm:pt-24">
        <LightRays className="opacity-70" />
        <div className="relative text-center">
          <p className="text-[clamp(1.35rem,1rem+1.2vw,1.9rem)] font-medium tracking-tight text-fg [animation:fade-in_.6s_ease-out_both]">
            {greeting()}{user.firstName ? <> <span className="serif-accent">{user.firstName}</span></> : null} <span className="inline-block origin-[70%_70%] [animation:wave_1.6s_.4s_ease-in-out_2]">👋</span>
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl font-sans text-[clamp(2.6rem,1.4rem+3.6vw,4.4rem)] font-semibold leading-[1.04] tracking-[-0.04em] [animation:rise_.7s_.1s_cubic-bezier(.2,.8,.2,1)_both]">
            {stores.length ? <>Qu'est-ce qu'on <span className="serif-accent font-medium">construit</span> aujourd'hui ?</> : <>Ta boutique en <span className="serif-accent font-medium">3 minutes</span></>}
          </h1>
          {!stores.length && <p className="mx-auto mt-3 max-w-md text-fg-muted">Colle le lien du produit que tu veux vendre. Vitrio s'occupe du reste.</p>}
        </div>
        <div className="relative mt-10">
          <Suspense><Welcome /><CreateStore /></Suspense>
          <div className="mx-auto mt-14 max-w-[1100px]">
            <p className="mb-4 text-center text-[15px] font-medium text-fg-muted">Comment ça marche, en 15 secondes</p>
            <div className="rounded-[17px] bg-[linear-gradient(160deg,#2ee6a6,rgb(255_255_255/0.08)_40%,rgb(46_230_166/0.5))] p-px shadow-[0_0_60px_-20px_rgb(46_230_166/0.55)]">
              <TutorialVideo name="tuto-lien" title="Créer sa boutique à partir d'un lien" speed="×2,5" className="max-w-none" />
            </div>
          </div>
        </div>
      </section>

      {stores.length === 0 && (
        <section aria-label="Comment ça marche" className="px-5 pb-16 sm:px-8">
          <ol className="mx-auto grid max-w-[880px] gap-3 sm:grid-cols-3">
            {[
              ["Colle ton lien", "Un produit trouvé sur AliExpress, Amazon ou ailleurs. Ou décris-le en une phrase."],
              ["L'IA crée ta boutique", "Textes, offres, design et photos du produit, en 3 minutes environ."],
              ["Publie sur Shopify", "Un clic, et ta boutique est en ligne, prête à vendre."],
            ].map(([title, text], i) => (
              <li key={title} className="surface flex gap-3 rounded-card p-4 [animation:fade-in_.5s_ease-out_both]" style={{ animationDelay: `${150 + i * 120}ms` }}>
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent text-sm font-semibold text-[#062b22]">{i + 1}</span>
                <div><p className="font-medium">{title}</p><p className="mt-1 text-sm text-fg-muted">{text}</p></div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {stores.length > 0 && (
        <section className="px-5 pb-16 sm:px-8">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg tracking-tight">Boutiques récentes</h2>
            <Link href="/app/boutiques" className="flex items-center gap-1 text-sm text-fg-muted hover:text-fg">Tout voir <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {stores.slice(0, 3).map((s) => <StoreCard key={s.id} store={s} />)}
          </div>
        </section>
      )}
    </div>
  );
}
