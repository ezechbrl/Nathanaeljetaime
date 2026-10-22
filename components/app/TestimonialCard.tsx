"use client";

import { Star, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Spinner } from "@/components/ui/Button";
import { useApp } from "./AppContext";
import * as api from "@/lib/api/client";
import { cn } from "@/lib/cn";

const KEY = "vg-testimonial";

// Demande d'avis sur Vigenia, une fois la boutique publiée. Masquée après envoi ou fermeture.
export function TestimonialCard() {
  const { user } = useApp();
  const [hidden, setHidden] = useState(true);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  useEffect(() => {
    try { setHidden(!!localStorage.getItem(KEY)); } catch { setHidden(false); }
    setName(user.firstName);
  }, [user]);
  const close = (v: string) => { try { localStorage.setItem(KEY, v); } catch { /* stockage indisponible */ } setHidden(true); };
  if (hidden) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) return setError("Choisis une note.");
    setState("sending"); setError("");
    try {
      await api.sendTestimonial({ rating, text, name });
      setState("sent");
      try { localStorage.setItem(KEY, "sent"); } catch { /* stockage indisponible */ }
    } catch (err) { setError((err as Error).message); setState("idle"); }
  }

  if (state === "sent") return <section className="rounded-card border border-accent/30 bg-accent-deep/20 p-4 text-sm">Merci pour ton avis ! 💚</section>;
  return (
    <section className="relative rounded-card border border-white/10 bg-white/[0.03] p-4">
      <button type="button" onClick={() => close("dismissed")} aria-label="Fermer" className="absolute right-3 top-3 text-fg-faint hover:text-fg"><X className="h-4 w-4" /></button>
      <p className="font-medium">Ton avis sur Vigenia ?</p>
      <p className="mt-0.5 text-xs text-fg-muted">30 secondes. Il pourra apparaître sur notre site, avec ton prénom.</p>
      <form onSubmit={submit} className="mt-3 space-y-2.5">
        <div className="flex gap-1" role="radiogroup" aria-label="Note">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} sur 5`} onClick={() => setRating(n)}>
              <Star className={cn("h-7 w-7 transition-transform hover:scale-110", n <= rating ? "fill-[#f5b301] text-[#f5b301]" : "text-white/25")} />
            </button>
          ))}
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} required minLength={10} maxLength={600} rows={3} placeholder="Ce qui t'a plu, ce que ça t'a fait gagner…" className="field w-full text-sm" />
        <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={60} placeholder="Prénom et initiale (ex. Léa M.)" className="field w-full text-sm" />
        {error && <p role="alert" className="text-xs text-bad">{error}</p>}
        <Button type="submit" size="sm" disabled={state === "sending"}>{state === "sending" ? <Spinner /> : "Envoyer mon avis"}</Button>
      </form>
    </section>
  );
}
