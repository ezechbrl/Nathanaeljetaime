"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Spinner } from "@/components/ui/Button";
import { CANCEL_REASONS, CANCEL_WISHES } from "@/lib/content/cancel";
import { cn } from "@/lib/cn";

// Petit questionnaire avant l'arrêt de l'abonnement. Tout est facultatif : on peut arrêter sans répondre.
export function CancelSurvey({ busy, onConfirm, onKeep }: { busy: boolean; onConfirm: (f: { reason?: string; wish?: string; details?: string }) => void; onKeep: () => void }) {
  const [reason, setReason] = useState<string>();
  const [wish, setWish] = useState<string>();
  const [details, setDetails] = useState("");
  const chip = (on: boolean) => cn("rounded-[12px] border px-3 py-2.5 text-left text-sm transition-colors", on ? "border-[#34d399] bg-[#34d399]/15 text-white" : "border-white/10 bg-white/[0.04] text-fg-muted hover:border-white/25");
  return (
    <div className="mt-4 rounded-[16px] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <p className="font-semibold">Avant de partir, 2 petites questions ?</p>
      <p className="mt-1 text-xs text-fg-faint">Facultatif : tu peux arrêter sans répondre. Tes réponses nous aident à améliorer Vigenia.</p>

      <p className="mt-4 text-sm font-medium">1. Pourquoi tu veux arrêter ?</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {CANCEL_REASONS.map((r) => <button key={r.id} type="button" onClick={() => setReason(r.id)} className={chip(reason === r.id)}>{r.label}</button>)}
      </div>
      {reason === "shopify" && (
        <p className="mt-2 rounded-[12px] bg-[#34d399]/10 px-3 py-2 text-sm text-[#a7f3d0]">On peut t'aider gratuitement à la mettre en ligne. Écris-nous depuis la page <Link href="/contact" className="underline">contact</Link>, on te répond vite.</p>
      )}

      <p className="mt-4 text-sm font-medium">2. Qu'est-ce qui t'aurait fait rester ?</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {CANCEL_WISHES.map((w) => <button key={w.id} type="button" onClick={() => setWish(w.id)} className={chip(wish === w.id)}>{w.label}</button>)}
      </div>

      <textarea value={details} onChange={(e) => setDetails(e.target.value)} maxLength={500} rows={2} placeholder="Un mot de plus ? (facultatif)"
        className="mt-4 w-full resize-none rounded-[12px] border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none placeholder:text-fg-faint focus:border-white/30" />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button variant="danger" size="sm" disabled={busy} onClick={() => onConfirm({ reason, wish, details: details.trim() || undefined })}>{busy ? <Spinner /> : "Arrêter mon abonnement"}</Button>
        <Button variant="secondary" size="sm" onClick={onKeep}>Je garde mon abonnement</Button>
      </div>
      <p className="mt-2 text-xs text-fg-faint">L'abonnement s'arrête à la fin de la période déjà payée. Tu gardes l'accès jusque-là.</p>
    </div>
  );
}
