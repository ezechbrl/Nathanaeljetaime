"use client";

import { Check, Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ApiClientError, joinWaitlist } from "@/lib/api/client";

// Formulaire de liste d'attente (mode NEXT_PUBLIC_LAUNCH_MODE=waitlist).
export function WaitlistForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [brief, setBrief] = useState(params.get("brief") ?? "");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setState("sending");
    try {
      await joinWaitlist(email.trim(), brief.trim() || undefined);
      setState("done");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Une erreur est survenue. Réessaie.");
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-card border border-accent/30 bg-accent-deep/25 p-5">
        <p className="flex items-center gap-2 text-lg text-fg"><Check className="h-5 w-5 text-accent" /> Ta place est réservée</p>
        <p className="mt-2 text-[15px] leading-relaxed text-fg-muted">On t'écrit à <span className="text-fg">{email}</span> dès l'ouverture.</p>
        <Link href="/" className="mt-4 inline-block text-sm text-accent underline-offset-4 hover:underline">Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="wl-email" className="text-sm text-fg-muted">Ton e-mail</label>
        <div className="relative mt-1.5">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-faint" />
          <input id="wl-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="toi@exemple.fr" className="field pl-10" />
        </div>
      </div>
      <div>
        <label htmlFor="wl-brief" className="text-sm text-fg-muted">Ce que tu veux vendre <span className="text-fg-faint">(facultatif)</span></label>
        <textarea id="wl-brief" rows={3} maxLength={500} value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="Ex. : bougies parfumées artisanales, cible 30-45 ans" className="field mt-1.5 resize-none" />
      </div>
      {error && <p role="alert" className="text-sm text-bad">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={state === "sending"}>
        {state === "sending" ? "Envoi…" : "Réserver ma place"}
      </Button>
      <p className="text-xs leading-relaxed text-fg-faint">Un seul e-mail à l'ouverture, pas de spam. Tu peux te désinscrire à tout moment.</p>
    </form>
  );
}
