"use client";

import { ListChecks } from "lucide-react";
import { useEffect, useState } from "react";
import * as api from "@/lib/api/client";

// Les questions du quiz, dans l'ordre (sans idée de produit), avec la création du compte au milieu.
const STEPS: [string, string][] = [
  ["income", "1. Revenu visé (curseur)"], ["goal", "2. Objectif"], ["level", "3. Niveau en e-commerce"], ["budget", "4. Budget de départ"], ["shopify", "5. A-t-il Shopify ?"],
  ["idea", "6. A-t-il une idée ?"],
  ["account", "Création du compte (e-mail)"],
  ["big", "7. Grande catégorie"], ["sub", "8. Petite catégorie"], ["product", "9. Choix du produit"],
  ["audience", "10. À qui vendre"], ["market", "11. Pays de vente"], ["supply", "12. Livraison + fournisseur"], ["channel", "13. Où trouver ses clients"], ["price", "14. Prix de vente (dernière)"],
  // Anciennes questions (quiz d'avant le 26 novembre) : encore visibles tant qu'elles sont dans les 7 derniers jours.
  ["time", "Ancien : temps disponible"], ["style", "Ancien : cœur / croix"],
];

// Ventes : où les visiteurs s'arrêtent dans le quiz (7 derniers jours).
export function QuizFunnel() {
  const [d, setD] = useState<{ started: number; finished: number; stops: Record<string, number> } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { api.getOwnerQuiz().then(setD, (e) => setError((e as Error).message)); }, []);
  const max = d ? Math.max(1, ...Object.values(d.stops)) : 1;
  return (
    <section className="min-w-0 overflow-hidden rounded-[18px] bg-white p-4 text-[#111] shadow-[0_10px_30px_-18px_rgb(0_0_0/0.6)] sm:p-5">
      <h2 className="flex items-center gap-2 text-[17px] font-semibold"><span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[#d9f7e8] text-[#047857]"><ListChecks className="h-4 w-4" /></span>Quiz (7 derniers jours)</h2>
      {error && <p className="mt-2 text-sm text-[#d72c0d]">{error}</p>}
      {!d && !error && <p className="mt-2 text-sm text-[#8a8a8a]">Chargement…</p>}
      {d && (d.started ? (
        <>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-[12px] bg-[#f7f7f8] p-3"><p className="text-xl font-bold tabular-nums">{d.started}</p><p className="text-xs text-[#616161]">ont commencé</p></div>
            <div className="rounded-[12px] bg-[#d9f7e8] p-3"><p className="text-xl font-bold tabular-nums text-[#047857]">{d.finished}</p><p className="text-xs text-[#047857]">ont fini</p></div>
            <div className="rounded-[12px] bg-[#f7f7f8] p-3"><p className="text-xl font-bold tabular-nums">{Math.round((d.finished / d.started) * 100)} %</p><p className="text-xs text-[#616161]">vont au bout</p></div>
          </div>
          <p className="mt-4 text-[13px] font-semibold">Où s&apos;arrêtent ceux qui ne finissent pas</p>
          <div className="mt-2 space-y-1.5">
            {STEPS.map(([k, label]) => {
              const n = d.stops[k] ?? 0;
              return (
                <div key={k} className="flex items-center gap-2 text-[13px]">
                  <span className="w-[170px] shrink-0 truncate">{label}</span>
                  <span className="h-3 flex-1 overflow-hidden rounded-full bg-[#f1f1f1]"><span className="block h-full rounded-full bg-[#f87171]" style={{ width: `${(n / max) * 100}%` }} /></span>
                  <span className="w-6 text-right font-semibold tabular-nums">{n}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-[#8a8a8a]">Avec une idée de produit, le quiz saute les questions 7 à 9.</p>
        </>
      ) : <p className="mt-2 text-sm text-[#8a8a8a]">Personne n&apos;a encore commencé le quiz depuis la mise en place du suivi.</p>)}
    </section>
  );
}
