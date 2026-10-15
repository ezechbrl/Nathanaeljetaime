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
    toast("Vitrio Pro est activé. À toi de jouer !");
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
          <p className="text-sm text-fg-muted">{greeting()} {user.firstName}</p>
          <h1 className="mx-auto mt-3 max-w-2xl text-h1">Qu'est-ce qu'on <span className="serif-accent">construit</span> aujourd'hui ?</h1>
        </div>
        <div className="relative mt-10">
          <Suspense><Welcome /><CreateStore /></Suspense>
        </div>
      </section>

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
