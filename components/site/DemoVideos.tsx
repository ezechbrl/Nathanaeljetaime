"use client";

import { Link2, PenLine } from "lucide-react";
import { useState } from "react";
import { TutorialVideo } from "@/components/ui/TutorialVideo";
import { cn } from "@/lib/cn";

const DEMOS = [
  { id: "start", label: "Décrire", icon: PenLine, title: "vigenia.com · Une phrase, une boutique" },
  { id: "link", label: "Coller un lien", icon: Link2, title: "vigenia.com · Un lien AliExpress, une boutique" },
] as const;

// Deux démos rapides de la vraie app, au choix : décrire son projet ou coller un lien produit.
export function DemoVideos({ className }: { className?: string }) {
  const [demo, setDemo] = useState<(typeof DEMOS)[number]["id"]>("start");
  const cur = DEMOS.find((d) => d.id === demo)!;
  return (
    <div className={className}>
      <div role="tablist" aria-label="Démonstrations" className="mx-auto mb-4 flex w-fit gap-1 rounded-full border border-white/10 bg-black/25 p-1 backdrop-blur">
        {DEMOS.map(({ id, label, icon: I }) => (
          <button key={id} type="button" role="tab" aria-selected={demo === id} onClick={() => setDemo(id)} className={cn("inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all", demo === id ? "bg-[linear-gradient(180deg,#34f0b0,#0fae7c)] text-[#03140d] shadow-[0_0_20px_-4px_rgb(46_230_166/0.7)]" : "text-fg-muted hover:text-fg")}>
            <I className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>
      <TutorialVideo key={demo} name={`demo-${demo}`} title={cur.title} speed="pendant les chargements" className="max-w-none" />
    </div>
  );
}
