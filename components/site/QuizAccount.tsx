"use client";

import { ArrowRight, Check, Lock } from "lucide-react";
import { useState } from "react";
import { Spinner } from "@/components/ui/Button";
import * as api from "@/lib/api/client";

// Étape « compte » du quiz : l'e-mail suffit, sans code. Nouvelle adresse : le compte est créé et connecté
// tout de suite. Adresse déjà inscrite sur un autre appareil : on ne demande rien ici, le quiz continue
// (la connexion se fera à la fin, pour protéger le compte de cette personne).
export function QuizAccount({ onDone }: { onDone: (loggedIn: boolean) => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { loggedIn } = await api.sendEmailLink(email.trim(), "/quiz?resume=1");
      onDone(loggedIn);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[460px] rounded-[22px] border border-white/15 bg-white/[0.04] p-5 sm:p-6">
      <ul className="mb-5 space-y-1.5 text-[14px] text-white/80">
        {["Tes réponses sont gardées", "Ton aperçu de boutique est gratuit", "Sans carte bancaire"].map((t) => (
          <li key={t} className="flex items-center gap-2"><Check className="h-4 w-4 text-[#3dff9a]" />{t}</li>
        ))}
      </ul>
      <form onSubmit={submit}>
        <label htmlFor="quiz-email" className="block text-sm font-semibold text-white">Ton adresse e-mail</label>
        <input id="quiz-email" type="email" required autoFocus autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="toi@exemple.com" className="field mt-2 h-14 text-[16px]" />
        <button type="submit" disabled={loading} className="mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,#14b886,#00876a)] glow-hover text-[16px] font-semibold text-white disabled:opacity-60">
          {loading ? <Spinner /> : <>Continuer le quiz <ArrowRight className="h-5 w-5" /></>}
        </button>
      </form>
      {error && <p role="alert" className="mt-2 text-sm text-bad">{error}</p>}
      <p className="mt-3 text-center text-[11.5px] leading-snug text-fg-faint"><Lock className="mr-1 inline h-3 w-3 align-[-1px]" />En continuant, tu acceptes les <a href="/legal/cgu" className="underline underline-offset-2">CGU</a> et la <a href="/legal/confidentialite" className="underline underline-offset-2">politique de confidentialité</a>.</p>
    </div>
  );
}
