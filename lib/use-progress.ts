"use client";

import { useEffect, useRef, useState } from "react";

// Barre de progression fidèle au travail réel : elle suit la progression envoyée par le serveur
// (photos terminées, étapes de l'IA…) et avance doucement entre deux mises à jour, sans jamais
// dépasser de plus de quelques points le réel ni atteindre 100 % avant la vraie fin.
export function useLiveProgress(real: number | undefined, done = false) {
  const [shown, setShown] = useState(real ?? 0);
  const target = useRef(real ?? 0);
  const since = useRef(Date.now());
  useEffect(() => {
    if ((real ?? 0) !== target.current) { target.current = real ?? 0; since.current = Date.now(); }
  }, [real]);
  useEffect(() => {
    if (done) { setShown(100); return; }
    const id = setInterval(() => {
      const base = target.current;
      // Petit glissement entre deux mises à jour : +4 points au plus, en ralentissant.
      const drift = 4 * (1 - Math.exp(-(Date.now() - since.current) / 20_000));
      const goal = Math.min(99, base + drift);
      setShown((s) => (s < goal ? s + Math.max(0.15, (goal - s) * 0.15) : s));
    }, 200);
    return () => clearInterval(id);
  }, [done]);
  return Math.min(done ? 100 : 99, Math.round(shown));
}

// Temps restant estimé à partir de la vitesse réelle observée (null tant qu'on ne sait pas).
export function useRemaining(progress: number) {
  const t0 = useRef(Date.now());
  if (progress < 8) return null;
  const elapsed = Date.now() - t0.current;
  return Math.max(0, Math.round(((elapsed / progress) * (100 - progress)) / 1000));
}
