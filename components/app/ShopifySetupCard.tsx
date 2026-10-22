"use client";

import { Check, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import type { Store } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { shopifyLinks } from "@/lib/shopify-links";

// Réglages à faire par le marchand dans SON admin Shopify (pas dans Vigenia) avant d'ouvrir la vente.
// Il coche au fur et à mesure ; l'état reste dans son navigateur.
export function ShopifySetupCard({ store }: { store: Store }) {
  const links = shopifyLinks(store.liveUrl);
  const key = `vitrio-shopify-setup-${store.id}`;
  const [done, setDone] = useState<string[]>([]);
  useEffect(() => { try { setDone(JSON.parse(localStorage.getItem(key) ?? "[]")); } catch { /* stockage indisponible */ } }, [key]);
  if (!links) return null;

  const steps = [
    { id: "payments", title: "Paiements", hint: "Shopify Payments", href: links.payments },
    { id: "shipping", title: "Livraison", hint: "Tarifs et délais", href: links.shipping },
    { id: "policies", title: "Pages légales", hint: "CGV, retours", href: links.policies },
    { id: "orders", title: "Envoi des commandes", hint: "Ex. DSers", href: "https://apps.shopify.com/dsers" },
    { id: "password", title: "Ouvrir au public", hint: "Retirer le mot de passe", href: links.password },
  ];
  const toggle = (id: string) => setDone((d) => {
    const next = d.includes(id) ? d.filter((x) => x !== id) : [...d, id];
    try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* stockage indisponible */ }
    return next;
  });
  const count = steps.filter((s) => done.includes(s.id)).length;

  return (
    <section className="rounded-card border border-[#95bf47]/30 bg-[#95bf47]/[0.06] p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3 px-1">
        <p className="text-sm font-medium"><span className="text-[#b5d96b]">À faire dans Shopify</span> <span className="text-fg-muted">· pour ouvrir la vente</span></p>
        <span className="shrink-0 rounded-full bg-white/[0.06] px-2 py-0.5 text-xs tabular-nums text-fg-muted">{count}/{steps.length}</span>
      </div>
      <ol className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {steps.map((s, i) => {
          const ok = done.includes(s.id);
          return (
            <li key={s.id} className={cn("flex items-center gap-2 rounded-[10px] border border-white/[0.07] bg-black/10 p-2", ok && "opacity-60")}>
              <button type="button" onClick={() => toggle(s.id)} aria-pressed={ok} aria-label={ok ? `Décocher : ${s.title}` : `Marquer comme fait : ${s.title}`} className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] font-semibold transition-colors", ok ? "border-[#95bf47] bg-[#95bf47] text-[#10230a]" : "border-white/25 text-fg-muted hover:border-white/50")}>
                {ok ? <Check className="h-3 w-3" /> : i + 1}
              </button>
              <a href={s.href} target="_blank" rel="noreferrer" className="group min-w-0 flex-1">
                <span className={cn("flex items-center gap-1 truncate text-[13px] font-medium group-hover:text-[#b5d96b]", ok && "line-through decoration-white/30")}>{s.title} <ExternalLink className="h-3 w-3 shrink-0 opacity-50" /></span>
                <span className="block truncate text-[11px] text-fg-faint">{s.hint}</span>
              </a>
            </li>
          );
        })}
      </ol>
      {count === steps.length && <p className="mt-2 px-1 text-sm text-[#b5d96b]">🎉 Tout est prêt : ta boutique peut vendre !</p>}
    </section>
  );
}
