"use client";

import { Receipt, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import * as api from "@/lib/api/client";

const PERIOD: Record<api.OwnerCost["period"], string> = { month: "par mois", year: "par an", usage: "à l'usage", once: "une fois" };
const money = (cents: number, cur: string) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: cur, minimumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);
type Draft = { id?: string; name: string; what: string; amount: string; currency: "EUR" | "USD"; period: api.OwnerCost["period"]; method: string; essential: boolean };

// Ventes : ce que tu paies pour faire tourner Vigenia, avec le moyen de paiement. Modifiable ici.
export function Costs({ mrr }: { mrr: number }) {
  const [list, setList] = useState<api.OwnerCost[] | null>(null);
  const [error, setError] = useState("");
  const [edit, setEdit] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { api.cachedOwner("costs", api.getOwnerCosts, (r) => setList(r.costs), (e) => setError(e.message)); }, []);

  // Total fixe par mois, par devise (l'année est divisée par 12 ; « à l'usage » n'est pas compté).
  const fixed: Record<string, number> = {};
  for (const c of list ?? []) if (c.amount_cents && (c.period === "month" || c.period === "year")) fixed[c.currency] = (fixed[c.currency] ?? 0) + (c.period === "year" ? c.amount_cents / 12 : c.amount_cents);

  async function save() {
    if (!edit || !edit.name.trim()) return;
    setBusy(true);
    try {
      const amount = edit.amount.trim() ? Math.round(Number(edit.amount.replace(",", ".")) * 100) : null;
      const { cost } = await api.saveOwnerCost({ id: edit.id, name: edit.name, what: edit.what || null, amount_cents: Number.isFinite(amount) ? amount : null, currency: edit.currency, period: edit.period, method: edit.method || null, essential: edit.essential });
      setList((l) => (l ?? []).some((x) => x.id === cost.id) ? (l ?? []).map((x) => (x.id === cost.id ? cost : x)) : [...(l ?? []), cost]);
      setEdit(null);
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function remove(id: string) {
    if (!window.confirm("Retirer cette dépense de la liste ?")) return;
    await api.deleteOwnerCost(id).catch((e) => setError((e as Error).message));
    setList((l) => (l ?? []).filter((x) => x.id !== id));
    setEdit(null);
  }

  const input = "w-full rounded-[10px] border border-[#ddd] px-2.5 py-2 text-[14px] outline-none focus:border-[#0a8f5f]";
  return (
    <section className="min-w-0 overflow-hidden rounded-[18px] bg-white p-4 text-[#111] shadow-[0_10px_30px_-18px_rgb(0_0_0/0.6)] sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold"><span className="grid h-7 w-7 place-items-center rounded-[9px] bg-[#fee2e2] text-[#b91c1c]"><Receipt className="h-3.5 w-3.5" /></span>Ce que tu paies</h2>
      </div>
      {error && <p className="mt-2 text-sm text-[#d72c0d]">{error}</p>}
      {!list && !error && <p className="mt-2 text-sm text-[#8a8a8a]">Chargement…</p>}
      {list && (
        <>
          <p className="mt-2 text-[12.5px] text-[#616161]">Fixe par mois : <b className="text-[#d72c0d]">{Object.keys(fixed).length ? Object.entries(fixed).map(([cur, c]) => `−${money(Math.round(c), cur)}`).join(" ") : "—"}</b> · ton MRR : <b className="text-[#0a8f5f]">{money(mrr, "EUR")}</b></p>
          <ul className="mt-2 divide-y divide-[#eee]">
            {list.map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => setEdit({ id: c.id, name: c.name, what: c.what ?? "", amount: c.amount_cents != null ? String(c.amount_cents / 100).replace(".", ",") : "", currency: c.currency, period: c.period, method: c.method ?? "", essential: c.essential })} className="flex w-full items-center gap-3 py-2 text-left">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-semibold">{c.name}</span>
                    <span className="block truncate text-[11.5px] text-[#8a8a8a]">
                      {c.last_cents != null && c.last_at ? `dernier : −${money(c.last_cents, c.last_currency || c.currency)} le ${new Date(c.last_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}` : "pas encore de paiement vu"}
                      {c.method ? ` · ${c.method.replace("Carte se terminant par ", "carte ")}` : ""}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-[14px] font-bold tabular-nums text-[#d72c0d]">{c.amount_cents != null ? `−${money(c.amount_cents, c.currency)}` : c.period === "usage" ? "à l'usage" : "?"}</span>
                    <span className="block text-[10.5px] text-[#8a8a8a]">{c.amount_cents != null ? PERIOD[c.period] : ""}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

        </>
      )}
      {edit && (
        <div className="mt-3 space-y-2 rounded-[14px] border border-[#eee] bg-[#fafafa] p-3">
          <input className={input} placeholder="Nom (ex. Vercel Pro)" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
          <input className={input} placeholder="À quoi ça sert" value={edit.what} onChange={(e) => setEdit({ ...edit, what: e.target.value })} />
          <div className="grid grid-cols-3 gap-2">
            <input className={input} inputMode="decimal" placeholder="Montant" value={edit.amount} onChange={(e) => setEdit({ ...edit, amount: e.target.value })} />
            <select className={input} value={edit.currency} onChange={(e) => setEdit({ ...edit, currency: e.target.value as Draft["currency"] })}><option value="EUR">€</option><option value="USD">$</option></select>
            <select className={input} value={edit.period} onChange={(e) => setEdit({ ...edit, period: e.target.value as Draft["period"] })}>{Object.entries(PERIOD).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          </div>
          <input className={input} placeholder="Payé avec (ex. carte de maman, carte Visa…)" value={edit.method} onChange={(e) => setEdit({ ...edit, method: e.target.value })} />
          <div className="flex items-center gap-2">
            <button type="button" disabled={busy} onClick={save} className="rounded-full bg-[#0a8f5f] px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-60">Enregistrer</button>
            <button type="button" onClick={() => setEdit(null)} className="rounded-full px-3 py-2 text-[13px] text-[#616161]">Annuler</button>
            {edit.id && <button type="button" onClick={() => remove(edit.id!)} className="ml-auto inline-flex items-center gap-1 text-[12px] text-[#b91c1c]"><Trash2 className="h-3.5 w-3.5" /> Retirer</button>}
          </div>
        </div>
      )}
    </section>
  );
}
