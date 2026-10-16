"use client";

import { Check, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import type { Store } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { shopifyLinks } from "@/lib/shopify-links";

// Réglages à faire par le marchand dans SON admin Shopify (pas dans Vitrio) avant d'ouvrir la vente.
// Il coche au fur et à mesure ; l'état reste dans son navigateur.
export function ShopifySetupCard({ store }: { store: Store }) {
  const links = shopifyLinks(store.liveUrl);
  const key = `vitrio-shopify-setup-${store.id}`;
  const [done, setDone] = useState<string[]>([]);
  useEffect(() => { try { setDone(JSON.parse(localStorage.getItem(key) ?? "[]")); } catch { /* stockage indisponible */ } }, [key]);
  if (!links) return null;

  const steps = [
    { id: "payments", title: "Active les paiements", text: "Shopify Payments : ton compte bancaire et ta pièce d'identité, pour recevoir l'argent des ventes.", href: links.payments },
    { id: "shipping", title: "Règle la livraison", text: "Tes tarifs et délais, par exemple la livraison offerte à partir d'un certain montant.", href: links.shipping },
    { id: "policies", title: "Ajoute tes pages légales", text: "CGV, retours, confidentialité : Shopify te donne des modèles à compléter.", href: links.policies },
    { id: "orders", title: "Prépare l'envoi des commandes", text: "En dropshipping, une app comme DSers commande le produit chez ton fournisseur, qui l'envoie au client.", href: "https://apps.shopify.com/dsers" },
    { id: "password", title: "Ouvre ta boutique au public", text: "Retire le mot de passe : tes clients peuvent acheter.", href: links.password },
  ];
  const toggle = (id: string) => setDone((d) => {
    const next = d.includes(id) ? d.filter((x) => x !== id) : [...d, id];
    try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* stockage indisponible */ }
    return next;
  });
  const count = steps.filter((s) => done.includes(s.id)).length;

  return (
    <section className="rounded-card border border-[#95bf47]/30 bg-[#95bf47]/[0.06] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[#b5d96b]">
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden fill="currentColor"><path d="M15.3 3.6c-.1 0-1.7.1-1.7.1s-1.1-1.1-1.3-1.2c-.1-.1-.3-.1-.4 0l-.6.2C10.9 1.8 10.4 1.4 9.8 1.4c-1.7 0-2.6 2.2-2.8 3.3l-1.4.4c-.4.1-.4.1-.5.6L3.5 19.9 14.6 22l6-1.3S15.5 3.7 15.4 3.6h-.1zm-3.1.9-1.4.4c0-.8-.1-1.9-.5-2.9 1.1.2 1.6 1.5 1.9 2.5zM9.9 2.3c.2 0 .4.1.6.3-.9.4-1.8 1.5-2.2 3.4l-1.7.5c.5-1.6 1.6-4.2 3.3-4.2z" /></svg>
            À faire dans Shopify
          </p>
          <h2 className="mt-1.5 font-medium">Ta boutique est prête, ouvre la vente</h2>
          <p className="mt-1 text-sm text-fg-muted">Ces réglages se font une seule fois dans ton admin Shopify, pas dans Vitrio. Compte 30 minutes.</p>
        </div>
        <span className="shrink-0 rounded-full bg-white/[0.06] px-2 py-0.5 text-xs tabular-nums text-fg-muted">{count}/{steps.length}</span>
      </div>
      <ol className="mt-4 space-y-2">
        {steps.map((s) => {
          const ok = done.includes(s.id);
          return (
            <li key={s.id} className="flex gap-3 rounded-[12px] border border-white/[0.07] bg-black/10 p-3">
              <button type="button" onClick={() => toggle(s.id)} aria-pressed={ok} aria-label={ok ? `Décocher : ${s.title}` : `Marquer comme fait : ${s.title}`} className={cn("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors", ok ? "border-[#95bf47] bg-[#95bf47] text-[#10230a]" : "border-white/25 hover:border-white/50")}>
                {ok && <Check className="h-3 w-3" />}
              </button>
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm font-medium", ok && "text-fg-muted line-through decoration-white/20")}>{s.title}</p>
                {!ok && <p className="mt-0.5 text-xs leading-relaxed text-fg-muted">{s.text}</p>}
                {!ok && <a href={s.href} target="_blank" rel="noreferrer" className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-[#b5d96b] hover:underline">Ouvrir dans Shopify <ExternalLink className="h-3 w-3" /></a>}
              </div>
            </li>
          );
        })}
      </ol>
      {count === steps.length && <p className="mt-3 text-sm text-[#b5d96b]">🎉 Tout est prêt : ta boutique peut vendre !</p>}
    </section>
  );
}
