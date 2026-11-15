"use client";

import { useRouter } from "next/navigation";
import { Quiz, saveQuizBrief } from "@/components/site/Quiz";
import * as api from "@/lib/api/client";

// Quiz avant le compte : les réponses sont gardées, puis création du compte, puis la boutique se crée.
// Déjà connecté : on passe directement à la création.
export function PublicQuiz() {
  const router = useRouter();
  return (
    <Quiz onFinish={async (brief) => {
      saveQuizBrief(brief);
      const logged = await api.getMe().then(() => true, () => false);
      router.push(logged ? "/app/quiz?finish=1" : `/inscription?${new URLSearchParams({ next: "/app/quiz?finish=1" })}`);
    }} />
  );
}
