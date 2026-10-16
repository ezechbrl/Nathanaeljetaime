"use client";

import { ArrowUp, Link2, PenLine, Plus, RefreshCw, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export const MODES = [
  { id: "start", label: "Décrire", icon: PenLine, placeholder: "Je vends des chaussons bébé en laine mérinos, pour les jeunes parents qui veulent du fait main…" },
  { id: "link", label: "Coller un lien", icon: Link2, placeholder: "Colle le lien de ton produit : AliExpress, Amazon, Temu, ta propre page…" },
  { id: "recraft", label: "Refaire ma boutique", icon: RefreshCw, placeholder: "Ma boutique ne convertit pas : rends-la plus rassurante et plus haut de gamme…" },
] as const;

const EXAMPLES = [
  "Café de spécialité en abonnement",
  "Harnais pour chien, coloris pastel",
  "Sac à dos cabine pour l'Espagne",
];

export function PromptBox({ target = "/inscription", className, align = "center", inputId = "prompt" }: { target?: string; className?: string; align?: "center" | "left"; inputId?: string }) {
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
    // Un lien collé passe en import par lien, quel que soit l'onglet choisi.
    const isLink = /^https?:\/\/\S+$/.test(value.trim());
    const m = isLink && mode !== "recraft" ? "link" : mode;
    const params = new URLSearchParams({ mode: m });
    if (value.trim()) params.set(m === "link" ? "url" : "brief", value.trim());
    router.push(`${target}?${params}`);
  }

  return (
    <div className={cn("w-full max-w-2xl", align === "center" && "mx-auto", className)}>
      <form onSubmit={submit} className="group relative rounded-[14px] p-px [background:linear-gradient(180deg,rgb(0_166_118/0.45),rgb(0_166_118/0.08)_45%,rgb(255_255_255/0.06))]">
        <div className="rounded-[13px] bg-[linear-gradient(180deg,#123d35,#0c2b26)] shadow-[0_30px_80px_-30px_rgb(0_128_96/0.55)]">
          <label htmlFor={inputId} className="sr-only">Décris ta boutique</label>
          <textarea
            id={inputId}
            rows={3}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(); }}
            placeholder={placeholder}
            className="block w-full resize-none bg-transparent px-4 pb-2 pt-4 text-[15px] leading-relaxed text-fg placeholder:text-fg-faint focus:outline-none sm:text-base"
          />
          <div className="flex items-center justify-between px-3 pb-3">
            <button type="button" aria-label="Ajouter une image" className="grid h-8 w-8 place-items-center rounded-ctl text-fg-faint transition-colors hover:bg-white/5 hover:text-fg">
              <Plus className="h-4 w-4" />
            </button>
            <button type="submit" className="inline-flex h-9 items-center gap-2 rounded-ctl border border-accent/40 bg-[linear-gradient(180deg,#10b07f,#00876a)] px-3.5 text-sm font-medium text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_6px_20px_-6px_rgb(0_166_118/0.6)] transition-shadow hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.3),0_8px_28px_-6px_rgb(0_166_118/0.8)]">
              <Sparkles className="h-4 w-4" /> Générer
            </button>
          </div>
        </div>
      </form>

      <div role="tablist" aria-label="Mode de création" className={cn("surface mt-5 flex w-fit max-w-full gap-1 overflow-x-auto rounded-ctl p-1", align === "center" && "mx-auto")}>
        {MODES.map((m) => (
          <button
            key={m.id}
            role="tab"
            aria-selected={mode === m.id}
            onClick={() => setMode(m.id)}
            className={cn("flex items-center gap-2 shrink-0 rounded-[7px] px-2.5 py-1.5 text-[13px] transition-colors sm:px-3.5 sm:text-sm", mode === m.id ? "border border-accent/30 bg-accent-deep/50 text-fg" : "border border-transparent text-fg-muted hover:text-fg")}
          >
            <m.icon className="hidden h-3.5 w-3.5 sm:block" /> {m.label}
          </button>
        ))}
      </div>

      {mode === "start" && (
        <div className={cn("mt-4 hidden flex-wrap gap-2 sm:flex", align === "center" && "justify-center")}>
          {EXAMPLES.map((ex) => (
            <button key={ex} type="button" onClick={() => setValue(ex)} className="flex items-center gap-1.5 rounded-full border border-white/[0.07] px-3 py-1 text-xs text-fg-faint transition-colors hover:border-white/15 hover:text-fg-muted">
              {ex} <ArrowUp className="h-3 w-3 rotate-45" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
