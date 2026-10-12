"use client";

import { useState } from "react";

const input = "mt-1 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand/30";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="grid place-items-center rounded-3xl border border-black/10 p-10 text-center">
        <p className="text-3xl">✉️</p>
        <p className="mt-3 font-semibold">Message envoyé !</p>
        <p className="mt-1 text-sm text-black/60">On revient vers toi très vite.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); setSent(true); }}
      className="space-y-4 rounded-3xl border border-black/10 p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">Nom<input required className={input} /></label>
        <label className="block text-sm font-medium">E-mail<input required type="email" className={input} /></label>
      </div>
      <label className="block text-sm font-medium">
        Sujet
        <select className={input}><option>Support</option><option>Partenariats & agences</option><option>Presse</option><option>Autre</option></select>
      </label>
      <label className="block text-sm font-medium">Message<textarea required rows={5} className={input} /></label>
      <button className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand/90">Envoyer</button>
    </form>
  );
}
