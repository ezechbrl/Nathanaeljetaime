"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { Button, Spinner } from "@/components/ui/Button";
import { sendContact } from "@/lib/api/client";

const TOPICS = ["Question sur le produit", "Support technique", "Facturation", "Agences et partenariats", "Presse", "Autre"];

export function ContactForm() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("loading");
    try {
      await sendContact({
        name: String(f.get("name")),
        email: String(f.get("email")),
        topic: String(f.get("topic")),
        message: String(f.get("message")),
        website: String(f.get("website") ?? ""),
      });
      setState("done");
    } catch (err) {
      setError((err as Error).message);
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="surface grid min-h-[420px] place-items-center rounded-card p-10 text-center">
        <div>
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-accent/40 bg-accent-deep/50"><Check className="h-5 w-5 text-accent" /></span>
          <p className="mt-5 text-xl tracking-tight">Message envoyé</p>
          <p className="mt-2 text-fg-muted">On te répond sous 24 h ouvrées.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="surface space-y-5 rounded-card p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm">Nom<input name="name" required autoComplete="name" className="field mt-1.5" /></label>
        <label className="block text-sm">E-mail<input name="email" required type="email" autoComplete="email" className="field mt-1.5" /></label>
      </div>
      <label className="block text-sm">
        Sujet
        <select name="topic" className="field mt-1.5" defaultValue={TOPICS[0]}>
          {TOPICS.map((t) => <option key={t} className="bg-bg-2">{t}</option>)}
        </select>
      </label>
      <label className="block text-sm">Message<textarea name="message" required minLength={10} rows={6} className="field mt-1.5 resize-y" /></label>
      {/* Champ piège pour les robots : invisible pour les humains. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute left-[-9999px] h-0 w-0 opacity-0" />
      {state === "error" && <p role="alert" className="text-sm text-bad">{error}</p>}
      <Button type="submit" size="lg" disabled={state === "loading"} className="w-full sm:w-auto">
        {state === "loading" ? <><Spinner /> Envoi…</> : "Envoyer le message"}
      </Button>
    </form>
  );
}
