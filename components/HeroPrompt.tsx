"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const MODES = [
  { id: "start", label: "Décrire mon projet", placeholder: "Crée une boutique premium pour ma marque de baumes à lèvres…" },
  { id: "link", label: "Coller un lien produit", placeholder: "https://… (page produit d'un fournisseur ou concurrent)" },
] as const;

export function HeroPrompt() {
  const router = useRouter();
  const [mode, setMode] = useState<(typeof MODES)[number]["id"]>("start");
  const [value, setValue] = useState("");
  const current = MODES.find((m) => m.id === mode)!;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (value.trim()) params.set(mode === "link" ? "url" : "brief", value.trim());
    router.push(`/generer?${params.toString()}`);
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-10 w-full max-w-2xl rounded-3xl border border-black/10 bg-white p-3 text-left shadow-xl shadow-brand/10">
      <div className="mb-2 flex gap-1">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${mode === m.id ? "bg-brand-soft text-brand" : "text-black/50 hover:text-black"}`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={current.placeholder}
          rows={2}
          className="min-h-[56px] flex-1 resize-none rounded-2xl bg-black/[0.03] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand/30"
        />
        <button type="submit" className="rounded-2xl bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand/90">
          Générer
        </button>
      </div>
    </form>
  );
}
