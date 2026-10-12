"use client";

import { useState } from "react";
import { AFFILIATE } from "@/lib/content/affiliate";
import { PLANS } from "@/lib/content/pricing";

export function AffiliateCalculator() {
  const [referrals, setReferrals] = useState(10);
  const pro = PLANS.find((p) => p.id === "pro")!;
  const monthly = Math.round(referrals * pro.monthly * AFFILIATE.rate);
  const yearly = monthly * AFFILIATE.months;

  return (
    <div className="surface-accent rounded-card p-6 sm:p-8">
      <label htmlFor="refs" className="flex items-baseline justify-between text-sm text-fg-muted">
        Clients Pro parrainés <span className="text-3xl tracking-tight text-fg tabular-nums">{referrals}</span>
      </label>
      <input id="refs" type="range" min={1} max={100} value={referrals} onChange={(e) => setReferrals(+e.target.value)} className="mt-4 w-full accent-[rgb(79_227_207)]" />
      <div className="mt-8 grid grid-cols-2 gap-4 border-t border-black/[0.08] pt-6">
        <div>
          <p className="text-sm text-fg-muted">Par mois</p>
          <p className="mt-1 text-4xl tracking-[-0.04em] tabular-nums">{monthly.toLocaleString("fr-FR")} €</p>
        </div>
        <div>
          <p className="text-sm text-fg-muted">Sur {AFFILIATE.months} mois</p>
          <p className="mt-1 text-4xl tracking-[-0.04em] text-accent tabular-nums">{yearly.toLocaleString("fr-FR")} €</p>
        </div>
      </div>
      <p className="mt-4 text-xs text-fg-faint">Calcul indicatif : {Math.round(AFFILIATE.rate * 100)} % de {pro.monthly} € par client Pro mensuel, pendant {AFFILIATE.months} mois.</p>
    </div>
  );
}
