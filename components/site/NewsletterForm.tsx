"use client";

import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { subscribeNewsletter } from "@/lib/api/client";
import { Spinner } from "@/components/ui/Button";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      await subscribeNewsletter(email);
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return <p className="flex items-center gap-2 text-sm text-accent"><Check className="h-4 w-4" /> C'est noté, à très vite.</p>;
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <label className="sr-only" htmlFor="nl-email">E-mail</label>
      <input id="nl-email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ton@email.com" className="field" />
      <button aria-label="S'inscrire" className="grid h-[42px] w-11 shrink-0 place-items-center rounded-ctl border border-black/10 bg-black/[0.04] text-fg transition-colors hover:border-accent/50 hover:text-accent">
        {state === "loading" ? <Spinner /> : <ArrowRight className="h-4 w-4" />}
      </button>
      {state === "error" && <p role="alert" className="sr-only">Erreur, réessaie.</p>}
    </form>
  );
}
