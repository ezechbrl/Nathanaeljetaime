"use client";

import { BarChart3, Home, Image as ImageIcon, LayoutGrid, MessageSquare, Plus, Settings, Sparkles, Store } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { useScrollProgress } from "@/components/ui/useScrollProgress";
import { site } from "@/lib/site";

const NAV = [
  { icon: Home, label: "Accueil", active: true },
  { icon: LayoutGrid, label: "Tableau de bord" },
  { icon: MessageSquare, label: "Éditeur IA" },
  { icon: ImageIcon, label: "Studio" },
  { icon: BarChart3, label: "Pilotage" },
];

// Capture « vivante » de l'application, qui se redresse en perspective au défilement.
export function AppPreview() {
  const ref = useScrollProgress<HTMLDivElement>(0.45);
  return (
    <div ref={ref} className="mx-auto mt-16 max-w-[1100px] [perspective:1600px] sm:mt-20" style={{ "--p": 0 } as React.CSSProperties}>
      <div
        className="relative origin-top rounded-[14px] border border-white/10 bg-bg-2 shadow-[0_60px_120px_-40px_rgb(0_0_0/0.8),0_0_0_1px_rgb(0_0_0/0.3)] transition-transform duration-100 ease-out will-change-transform"
        style={{ transform: "rotateX(calc((1 - var(--p)) * 14deg)) scale(calc(0.94 + var(--p) * 0.06))" }}
      >
        <div className="absolute inset-x-10 -top-px h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
        <div className="flex h-[300px] overflow-hidden rounded-[14px] sm:h-[460px] lg:h-[520px]">
          <aside className="hidden w-52 shrink-0 flex-col border-r border-white/[0.06] bg-black/20 p-3 sm:flex">
            <div className="flex items-center gap-2 px-1 text-sm"><LogoMark className="h-5 w-5" />{site.name}</div>
            <p className="mt-6 px-2 text-[10px] uppercase tracking-[0.14em] text-fg-faint">Ma boutique</p>
            <div className="mt-2 flex items-center gap-2 rounded-ctl px-2 py-1.5 text-xs text-fg"><Store className="h-3.5 w-3.5 text-accent" /> Aurore</div>
            <nav className="mt-1 space-y-0.5">
              {NAV.map((n) => (
                <div key={n.label} className={`flex items-center gap-2 rounded-ctl px-2 py-1.5 text-xs ${n.active ? "bg-white/[0.06] text-fg" : "text-fg-muted"}`}>
                  <n.icon className="h-3.5 w-3.5" /> {n.label}
                </div>
              ))}
            </nav>
            <div className="mt-3 flex items-center gap-2 rounded-ctl px-2 py-1.5 text-xs text-fg-muted"><Plus className="h-3.5 w-3.5" /> Nouvelle boutique</div>
            <div className="mt-auto space-y-2 rounded-ctl border border-white/[0.06] p-2.5 text-[10px] text-fg-muted">
              <div><div className="flex justify-between"><span>Messages IA</span><span>14 / 20</span></div><div className="mt-1 h-1 rounded bg-white/5"><div className="h-full w-[70%] rounded bg-accent/70" /></div></div>
              <div><div className="flex justify-between"><span>Images</span><span>3 / 10</span></div><div className="mt-1 h-1 rounded bg-white/5"><div className="h-full w-[30%] rounded bg-accent/70" /></div></div>
            </div>
            <div className="mt-2 flex items-center gap-2 px-1 text-[11px] text-fg-muted"><Settings className="h-3.5 w-3.5" /> Paramètres</div>
          </aside>
          <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6">
            <div aria-hidden className="absolute inset-0 [background:radial-gradient(ellipse_60%_50%_at_50%_0%,rgb(22_170_156/0.18),transparent)]" />
            <p className="relative text-center text-2xl tracking-tight sm:text-4xl">
              Qu'est-ce qu'on <span className="serif-accent">construit</span> aujourd'hui ?
            </p>
            <div className="relative mt-6 w-full max-w-lg rounded-[11px] border border-accent/25 bg-black/20 p-3 text-left">
              <p className="h-10 text-xs text-fg-faint sm:h-14 sm:text-sm">Décris ton projet (ex. : bijoux minimalistes en acier doré, cible 25-35 ans)…</p>
              <div className="flex items-center justify-between">
                <Plus className="h-4 w-4 text-fg-faint" />
                <span className="inline-flex items-center gap-1.5 rounded-[7px] border border-accent/40 bg-accent-strong/70 px-2.5 py-1 text-[11px] text-white"><Sparkles className="h-3 w-3" /> Générer</span>
              </div>
            </div>
            <div className="relative mt-4 flex gap-2 text-[11px] text-fg-muted">
              {["Créer", "Depuis un lien", "Refondre"].map((t, i) => (
                <span key={t} className={`rounded-[7px] border px-2.5 py-1 ${i === 0 ? "border-accent/30 bg-accent-deep/50 text-fg" : "border-white/[0.06]"}`}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
