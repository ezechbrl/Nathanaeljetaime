"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { useApp } from "@/components/app/AppContext";
import { Spinner } from "@/components/ui/Button";
import { Quiz, takeQuizBrief } from "@/components/site/Quiz";
import * as api from "@/lib/api/client";

// Quiz dans l'espace client ; aussi le retour du quiz fait avant la création du compte (?finish=1).
function QuizInApp() {
  const router = useRouter();
  const params = useSearchParams();
  const { setStores, refresh } = useApp();
  const finishing = params.get("finish") === "1";
  const done = useRef(false);

  async function create(brief: string) {
    try {
      const { store } = await api.createStore({ mode: "start", brief, language: "français" });
      setStores((s) => [store, ...s]);
      refresh();
      router.push(`/app/boutiques/${store.id}`);
    } catch (e) {
      // Aperçu déjà utilisé : on garde la description dans le formulaire habituel.
      if (e instanceof api.ApiClientError && e.code === "subscription_required") return router.push(`/app?${new URLSearchParams({ mode: "start", brief })}`);
      throw e;
    }
  }

  useEffect(() => {
    if (!finishing || done.current) return;
    done.current = true;
    const brief = takeQuizBrief();
    if (!brief) return router.replace("/app/quiz");
    create(brief).catch(() => router.replace(`/app?${new URLSearchParams({ mode: "start", brief })}`));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finishing]);

  if (finishing) return <div className="grid min-h-[60vh] place-items-center text-fg-muted"><span className="flex items-center gap-3"><Spinner /> Ta boutique se prépare…</span></div>;
  return <Quiz onFinish={create} />;
}

export default function Page() {
  return <Suspense><QuizInApp /></Suspense>;
}
