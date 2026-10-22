"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { isStaleBuildError, reloadOnce } from "@/lib/recover";
import { Button } from "./Button";
import { LogoMark } from "./Logo";

// Écran affiché quand une page plante. On tente d'abord de se réparer tout seul
// (nouvelle version du site → rechargement, sinon un nouvel essai discret).
export function ErrorScreen({ error, retry }: { error: unknown; retry: () => void }) {
  const tried = useRef(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    console.error(error);
    if (isStaleBuildError(error) && reloadOnce()) return;
    if (!tried.current) {
      tried.current = true;
      const t = setTimeout(retry, 400);
      const v = setTimeout(() => setVisible(true), 1500);
      return () => { clearTimeout(t); clearTimeout(v); };
    }
    setVisible(true);
  }, [error, retry]);

  if (!visible) return <div className="grid min-h-[60dvh] place-items-center"><LogoMark className="h-10 w-10 animate-pulse" /></div>;
  return (
    <div className="grid min-h-[60dvh] place-items-center px-5 text-center">
      <div>
        <LogoMark className="mx-auto h-10 w-10" />
        <h1 className="mt-6 text-xl font-medium">Petit souci d'affichage</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-fg-muted">Ton travail est bien enregistré. Recharge la page pour continuer.</p>
        <Button size="lg" className="mt-6" onClick={() => window.location.reload()}><RotateCcw className="h-4 w-4" /> Recharger</Button>
      </div>
    </div>
  );
}
