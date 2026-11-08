"use client";

import { Check, Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ApiClientError, joinWaitlist } from "@/lib/api/client";
import { PLANS, WAITLIST_PRICES, euro, withOffer } from "@/lib/content/pricing";

const STARTER = PLANS.find((p) => p.id === "pro")!;

// Formulaire de liste d'attente (mode NEXT_PUBLIC_LAUNCH_MODE=waitlist).
export function WaitlistForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [brief, setBrief] = useState(params.get("brief") ?? "");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const [hp, setHp] = useState(""); // piège à robots, invisible pour les vrais visiteurs
  const shownAt = useRef(0);
  useEffect(() => { shownAt.current = Date.now(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setState("sending");
    try {
      await joinWaitlist(email.trim(), brief.trim() || undefined, { ms: Date.now() - shownAt.current, hp });
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
        <p className="mt-2 text-[15px] leading-relaxed text-fg-muted">On t'écrit à <span className="text-fg">{email}</span> dès l'ouverture, avec ton prix réservé : <span className="text-fg">{euro(WAITLIST_PRICES.pro.monthly)}/mois à vie</span>.</p>
        <Link href="/" className="mt-4 inline-block text-sm text-accent underline-offset-4 hover:underline">Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="relative space-y-4">
      {/* Ce qu'on gagne à s'inscrire maintenant */}
      <div className="rounded-card border border-accent/40 bg-accent-deep/25 p-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-accent">Prix réservé aux inscrits</p>
        <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
          <span className="text-fg-faint line-through decoration-[#ef4444] decoration-2">{euro(withOffer(STARTER.monthly))}</span>
          <span className="text-[1.9rem] font-semibold leading-none tracking-[-0.03em] text-fg">{euro(WAITLIST_PRICES.pro.monthly)}</span>
          <span className="text-sm text-fg-muted">/ mois, à vie</span>
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">Les autres paieront {euro(withOffer(STARTER.monthly))}/mois. À prendre dans les 24 h après la création de ton compte, à l&apos;ouverture. Sans engagement.</p>
      </div>
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
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="wl-site">Site web</label>
        <input id="wl-site" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
      </div>
      {error && <p role="alert" className="text-sm text-bad">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={state === "sending"}>
        {state === "sending" ? "Envoi…" : "Réserver ma place"}
      </Button>
      <p className="text-xs leading-relaxed text-fg-faint">Un seul e-mail à l'ouverture, pas de spam. Tu peux te désinscrire à tout moment.</p>
    </form>
  );
}
