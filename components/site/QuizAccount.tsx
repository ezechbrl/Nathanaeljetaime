"use client";

import { ArrowRight, Check, Lock } from "lucide-react";
import { useState } from "react";
import { Spinner } from "@/components/ui/Button";
import * as api from "@/lib/api/client";

// Étape « compte » au milieu du quiz : l'e-mail suffit. Nouvelle adresse : connecté tout de suite.
// Adresse déjà inscrite : un code à 6 chiffres par e-mail (le lien de l'e-mail ramène au quiz, réponses gardées).
export function QuizAccount({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "sent" | "checking">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setState("loading");
    try {
      const { loggedIn } = await api.sendEmailLink(email.trim(), "/quiz?resume=1");
      if (loggedIn) return onDone();
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
      await api.verifyEmailCode(email.trim(), code.replace(/\D/g, ""));
      onDone();
    } catch (err) {
      setError((err as Error).message);
      setState("sent");
    }
  }

  return (
    <div className="mx-auto max-w-[460px] rounded-[22px] border border-[#3dff9a]/35 bg-[#3dff9a]/[0.06] p-5 shadow-[0_0_40px_-18px_rgb(61_255_154/0.7)] sm:p-6">
      <ul className="mb-5 space-y-1.5 text-[14px] text-[#c8ffe2]">
        {["Tes réponses sont gardées", "Ton aperçu de boutique est gratuit", "Sans carte bancaire"].map((t) => (
          <li key={t} className="flex items-center gap-2"><Check className="h-4 w-4 text-[#3dff9a]" />{t}</li>
        ))}
      </ul>
      {state === "sent" || state === "checking" ? (
        <form onSubmit={submitCode}>
          <p className="text-sm text-fg-muted">Tu as déjà un compte : on a envoyé un code à <span className="text-white">{email}</span> (pense aux spams).</p>
          <div className="mt-3 flex gap-2">
            <label htmlFor="quiz-code" className="sr-only">Code reçu par e-mail</label>
            <input id="quiz-code" autoFocus inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => { setCode(e.target.value); setError(""); }} placeholder="123456" maxLength={10} className="field min-w-0 flex-1 text-center text-lg tracking-[0.3em]" />
            <button type="submit" disabled={state === "checking" || code.replace(/\D/g, "").length < 6} className="rounded-full bg-[linear-gradient(180deg,#34f0b0,#0fae7c)] px-5 text-sm font-semibold text-[#03140d] disabled:opacity-40">{state === "checking" ? <Spinner /> : "Valider"}</button>
          </div>
          <button type="button" onClick={() => { setState("idle"); setCode(""); }} className="mt-3 text-xs text-fg-faint underline underline-offset-4 hover:text-fg">Changer d'e-mail</button>
        </form>
      ) : (
        <form onSubmit={submit}>
          <label htmlFor="quiz-email" className="block text-sm font-semibold text-white">Ton adresse e-mail</label>
          <input id="quiz-email" type="email" required autoFocus autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="toi@exemple.com" className="field mt-2 h-14 text-[16px]" />
          <button type="submit" disabled={state === "loading"} className="mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,#34f0b0,#0fae7c)] text-[16px] font-semibold text-[#03140d] shadow-[0_12px_40px_-10px_rgb(46_230_166/0.8)] disabled:opacity-60">
            {state === "loading" ? <Spinner /> : <>Continuer le quiz <ArrowRight className="h-5 w-5" /></>}
          </button>
        </form>
      )}
      {error && <p role="alert" className="mt-2 text-sm text-bad">{error}</p>}
      <p className="mt-3 text-center text-[11.5px] leading-snug text-fg-faint"><Lock className="mr-1 inline h-3 w-3 align-[-1px]" />En continuant, tu acceptes les <a href="/legal/cgu" className="underline underline-offset-2">CGU</a> et la <a href="/legal/confidentialite" className="underline underline-offset-2">politique de confidentialité</a>.</p>
    </div>
  );
}
