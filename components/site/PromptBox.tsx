"use client";

import { ArrowUp, Link2, PenLine, Plus, RefreshCw, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export const MODES = [
  { id: "start", label: "Créer", icon: PenLine, placeholder: "Crée une boutique premium pour ma marque de baumes à lèvres naturels…" },
  { id: "link", label: "Depuis un lien", icon: Link2, placeholder: "Colle le lien d'une page produit (fournisseur, marketplace, concurrent)…" },
  { id: "recraft", label: "Refondre", icon: RefreshCw, placeholder: "Refais ma boutique : ton plus premium, fiche produit plus claire…" },
] as const;

const EXAMPLES = [
  "Boutique premium pour des baumes à lèvres naturels",
  "Enceinte portable étanche pour le marché américain",
  "Matcha bio d'Uji avec un kit de préparation",
];

export function PromptBox({ target = "/inscription", className }: { target?: string; className?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<(typeof MODES)[number]["id"]>("start");
  const [value, setValue] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const current = MODES.find((m) => m.id === mode)!;

  // Placeholder qui s'écrit lettre par lettre.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPlaceholder(current.placeholder);
      return;
    }
    let i = 0;
    setPlaceholder("");
    const id = setInterval(() => {
      i++;
      setPlaceholder(current.placeholder.slice(0, i));
      if (i >= current.placeholder.length) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  }, [current.placeholder]);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const params = new URLSearchParams({ mode });
    if (value.trim()) params.set(mode === "link" ? "url" : "brief", value.trim());
    router.push(`${target}?${params}`);
  }

  return (
    <div className={cn("mx-auto w-full max-w-2xl", className)}>
      <form onSubmit={submit} className="group relative rounded-[14px] p-px [background:linear-gradient(180deg,rgb(79_227_207/0.45),rgb(79_227_207/0.08)_45%,rgb(255_255_255/0.06))]">
        <div className="rounded-[13px] bg-white shadow-[0_30px_80px_-30px_rgb(22_170_156/0.5)]">
          <label htmlFor="prompt" className="sr-only">Décris ta boutique</label>
          <textarea
            id="prompt"
            rows={3}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(); }}
            placeholder={placeholder}
            className="block w-full resize-none bg-transparent px-4 pb-2 pt-4 text-[15px] leading-relaxed text-fg placeholder:text-fg-faint focus:outline-none sm:text-base"
          />
          <div className="flex items-center justify-between px-3 pb-3">
            <button type="button" aria-label="Ajouter une image" className="grid h-8 w-8 place-items-center rounded-ctl text-fg-faint transition-colors hover:bg-black/5 hover:text-fg">
              <Plus className="h-4 w-4" />
            </button>
            <button type="submit" className="inline-flex h-9 items-center gap-2 rounded-ctl border border-accent/40 bg-[linear-gradient(180deg,#008060,#006e52)] px-3.5 text-sm font-medium text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_6px_20px_-6px_rgb(79_227_207/0.6)] transition-shadow hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.3),0_8px_28px_-6px_rgb(79_227_207/0.8)]">
              <Sparkles className="h-4 w-4" /> Générer
            </button>
          </div>
        </div>
      </form>

      <div role="tablist" aria-label="Mode de création" className="surface mx-auto mt-5 flex w-fit gap-1 rounded-ctl p-1">
        {MODES.map((m) => (
          <button
            key={m.id}
            role="tab"
            aria-selected={mode === m.id}
            onClick={() => setMode(m.id)}
            className={cn("flex items-center gap-2 rounded-[7px] px-3 py-1.5 text-[13px] transition-colors sm:px-3.5 sm:text-sm", mode === m.id ? "border border-accent/30 bg-accent-deep/50 text-fg" : "border border-transparent text-fg-muted hover:text-fg")}
          >
            <m.icon className="h-3.5 w-3.5" /> {m.label}
          </button>
        ))}
      </div>

      {mode === "start" && (
        <div className="mt-4 hidden flex-wrap justify-center gap-2 sm:flex">
          {EXAMPLES.map((ex) => (
            <button key={ex} type="button" onClick={() => setValue(ex)} className="flex items-center gap-1.5 rounded-full border border-black/[0.07] px-3 py-1 text-xs text-fg-faint transition-colors hover:border-black/15 hover:text-fg-muted">
              {ex} <ArrowUp className="h-3 w-3 rotate-45" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
