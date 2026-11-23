"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Quiz, saveQuizBrief } from "@/components/site/Quiz";
import * as api from "@/lib/api/client";

// Quiz avant le compte (onboarding) : tout le monde y passe, même avec une description ou un lien déjà donnés
// sur l'accueil. Les réponses sont gardées, puis création du compte, puis la boutique se crée.
// Déjà connecté : on passe directement à la création.
export function PublicQuiz() {
  const router = useRouter();
  const params = useSearchParams();
  const url = params.get("url")?.trim() || "";
  const brief = params.get("brief")?.trim() || "";
  const isLink = /^https?:\/\//.test(url);
  const preset = isLink ? { text: url, isLink: true } : brief.length >= 3 ? { text: brief, isLink: false } : undefined;
  return (
    <Quiz preset={preset} skipHref={preset ? undefined : "/#creer"} onFinish={async (quizBrief) => {
      saveQuizBrief(quizBrief, isLink ? { mode: "link", url } : {});
      const logged = await api.getMe().then(() => true, () => false);
      router.push(logged ? "/app/quiz?finish=1" : `/inscription?${new URLSearchParams({ next: "/app/quiz?finish=1" })}`);
    }} />
  );
}
