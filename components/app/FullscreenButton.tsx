"use client";

import { Maximize2 } from "lucide-react";
import { useEffect, useState } from "react";

// Affiche l'aperçu de la boutique en plein écran (idéal pour filmer des vidéos de présentation).
// Échap pour quitter.
export function FullscreenButton({ target }: { target: React.RefObject<HTMLElement | null> }) {
  const [supported, setSupported] = useState(false);
  useEffect(() => setSupported(typeof document !== "undefined" && !!document.documentElement.requestFullscreen), []);
  if (!supported) return null;
  return (
    <button
      type="button"
      onClick={() => target.current?.requestFullscreen().catch(() => {})}
      className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-ctl px-3 py-1.5 text-[13px] text-fg-muted transition-colors hover:bg-white/[0.06] hover:text-fg"
      title="Plein écran (Échap pour quitter)"
    >
      <Maximize2 className="h-3.5 w-3.5" /> Plein écran
    </button>
  );
}
