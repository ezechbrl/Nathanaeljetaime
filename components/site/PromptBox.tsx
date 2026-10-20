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
      <form onSubmit={submit} className="glow-frame group relative rounded-[16px] p-[1.5px]">
        <div className="rounded-[14.5px] bg-[linear-gradient(180deg,#123d35,#0b2823)] shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]">
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
            <button type="submit" className="inline-flex h-9 items-center gap-2 rounded-full border border-[#6ee7b7]/50 bg-[linear-gradient(180deg,#34f0b0,#0fae7c)] px-4 text-sm font-semibold text-[#03140d] shadow-[inset_0_1px_0_rgb(255_255_255/0.45),0_0_18px_rgb(46_230_166/0.55)] transition-all hover:-translate-y-px hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.5),0_0_28px_rgb(46_230_166/0.8)]">
              <Sparkles className="h-4 w-4" /> Générer
            </button>
          </div>
        </div>
      </form>

      <div role="tablist" aria-label="Mode de création" className={cn("mt-5 grid w-full grid-cols-3 gap-1 rounded-[18px] border border-white/10 bg-black/25 p-1 backdrop-blur sm:flex sm:w-fit sm:max-w-full sm:gap-1.5 sm:rounded-full sm:p-1.5", align === "center" && "mx-auto")}>
        {MODES.map((m) => (
          <button
            key={m.id}
            role="tab"
            aria-selected={mode === m.id}
            onClick={() => setMode(m.id)}
            className={cn("flex items-center justify-center gap-2 rounded-[14px] px-2 py-2.5 text-center text-[13px] font-medium leading-tight transition-all sm:shrink-0 sm:rounded-full sm:px-5 sm:text-[15.5px]", mode === m.id ? "border border-[#6ee7b7]/60 bg-[#2ee6a6]/15 text-white shadow-[0_0_16px_rgb(46_230_166/0.45),inset_0_0_10px_rgb(46_230_166/0.15)]" : "border border-transparent text-fg-muted hover:text-fg")}
          >
            <m.icon className="hidden h-4 w-4 sm:block" /> {m.label}
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
