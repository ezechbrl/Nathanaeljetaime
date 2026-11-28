"use client";

import Link from "next/link";
import { CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import * as api from "@/lib/api/client";

// Noms affichés : dans la base, « pro » = Starter, « agency » = Pro, « single » = Ma boutique.
const PLAN: Record<string, string> = { pro: "Starter", agency: "Pro", single: "Ma boutique" };
const PRICE: Record<string, string> = { "pro:month": "29 €/mois", "pro:year": "249 €/an", "agency:month": "59 €/mois", "agency:year": "499 €/an", single: "39 €" };
const HES: Record<string, string> = { price: "trop cher", doubt: "pas sûr que ça marche pour lui", quality: "l'aperçu ne lui plaît pas assez", unclear: "ne comprend pas bien ce qu'il aura", later: "regarde juste pour l'instant", other: "autre chose" };
const PARIS = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", weekday: "short", hour: "2-digit", minute: "2-digit" });

function planLabel(k: string) {
  const [plan, interval] = k.split(":");
  const price = PRICE[k] ?? PRICE[plan] ?? "";
  return `${PLAN[plan] ?? plan}${interval ? (interval === "year" ? " à l'année" : " au mois") : ""}${price ? ` (${price})` : ""}`;
}

// Ventes : les personnes qui ont ouvert la page de paiement (7 jours), l'offre, combien de fois, et s'ils ont payé.
export function Checkouts() {
  const [d, setD] = useState<api.CheckoutPerson[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { api.cachedOwner("checkouts", api.getOwnerCheckouts, (r) => setD(r.people), (e) => setError(e.message)); }, []);
  const totals: Record<string, number> = {};
  for (const p of d ?? []) for (const [k, n] of Object.entries(p.plans)) { const plan = k.split(":")[0]; totals[plan] = (totals[plan] ?? 0) + n; }
  return (
    <section className="min-w-0 overflow-hidden rounded-[18px] bg-white p-4 text-[#111] shadow-[0_10px_30px_-18px_rgb(0_0_0/0.6)] sm:p-5">
      <h2 className="flex items-center gap-2 text-[17px] font-semibold"><span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[#fef3c7] text-[#b45309]"><CreditCard className="h-4 w-4" /></span>Ont voulu payer <span className="font-normal text-[#8a8a8a]">· 7 jours</span></h2>
      {error && <p className="mt-2 text-sm text-[#d72c0d]">{error}</p>}
      {!d && !error && <p className="mt-2 text-sm text-[#8a8a8a]">Chargement…</p>}
      {d && !d.length && <p className="mt-2 text-sm text-[#8a8a8a]">Personne n'a ouvert la page de paiement cette semaine.</p>}
      {d && d.length > 0 && (
        <>
          <p className="mt-2 flex flex-wrap gap-1.5 text-xs">
            {Object.entries(totals).sort((a, b) => b[1] - a[1]).map(([plan, n]) => <span key={plan} className="rounded-full bg-[#f4f4f5] px-2.5 py-1 font-medium">{PLAN[plan] ?? plan} : {n} clic{n > 1 ? "s" : ""}</span>)}
          </p>
          <ul className="mt-3 divide-y divide-[#eee]">
            {d.map((p) => (
              <li key={p.userId} className="py-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 truncate text-[14px] font-semibold">{p.email}</p>
                  <span className={p.paid ? "shrink-0 rounded-full bg-[#d9f7e8] px-2 py-0.5 text-[11px] font-semibold text-[#047857]" : "shrink-0 rounded-full bg-[#fee2e2] px-2 py-0.5 text-[11px] font-semibold text-[#b91c1c]"}>{p.paid ? "A payé ✓" : `${p.opens}× sans payer`}</span>
                </div>
                <p className="mt-1 text-[13px] text-[#444]">{Object.entries(p.plans).map(([k, n]) => `${planLabel(k)}${n > 1 ? ` ×${n}` : ""}`).join(" · ")}</p>
                <p className="mt-0.5 text-xs text-[#8a8a8a]">1ʳᵉ fois {PARIS.format(new Date(p.first))} · dernière {PARIS.format(new Date(p.last))}{p.discount ? ` · réduction −${p.discount} % active` : ""}</p>
                {p.hesitation && <p className="mt-1 text-xs text-[#b45309]">Hésite : {HES[p.hesitation.reason] ?? p.hesitation.reason}{p.hesitation.details ? ` — « ${p.hesitation.details} »` : ""}</p>}
                {p.stores.length > 0 && (
                  <p className="mt-1.5 flex flex-wrap gap-1.5">
                    {p.stores.map((st) => <Link key={st.id} href={`/ventes/boutique/${st.id}`} className="inline-flex items-center rounded-full bg-[#e8f7f0] px-2 py-0.5 text-[11px] font-medium text-[#0a6e4a] hover:bg-[#d3f0e3]">{st.name}</Link>)}
                  </p>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-[#8a8a8a]">Le « au mois / à l'année » n'est connu que depuis le 26 novembre.</p>
        </>
      )}
    </section>
  );
}
