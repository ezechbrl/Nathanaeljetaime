"use client";

import { Check, ExternalLink, Pencil, Truck } from "lucide-react";
import { useState } from "react";
import { Spinner } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import * as api from "@/lib/api/client";
import type { Store } from "@/lib/api/types";
import { normalizeProductUrl } from "@/lib/product-url";

// Le fournisseur de la boutique : relié automatiquement quand la boutique vient d'un lien fournisseur,
// sinon recherche du produit chez les fournisseurs et lien à enregistrer. Quand une commande arrive,
// on sait tout de suite où commander le produit.
export function SupplierCard({ store, onSaved }: { store: Store; onSaved?: (s: Store) => void }) {
  const toast = useToast();
  const [url, setUrl] = useState(store.supplierUrl ?? "");
  const [editing, setEditing] = useState(!store.supplierUrl);
  const [busy, setBusy] = useState(false);
  const name = (store.plan?.product?.title || store.teaser?.productTitle || store.niche || "").slice(0, 60);
  const q = encodeURIComponent(name);
  const host = (() => { try { return new URL(store.supplierUrl ?? "").hostname.replace(/^www\.|^fr\./, ""); } catch { return ""; } })();

  async function save() {
    const clean = url.trim();
    if (!/^https?:\/\/\S+\.\S+/.test(clean)) return toast("Colle un lien qui commence par https://", "error");
    setBusy(true);
    try {
      const { store: s } = await api.updateStore(store.id, { supplierUrl: normalizeProductUrl(clean) });
      onSaved?.(s);
      setEditing(false);
      toast("Fournisseur relié à ta boutique ✓", "ok");
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="surface rounded-card p-5">
      <h2 className="flex items-center gap-2 text-sm text-fg-muted"><Truck className="h-4 w-4" /> Ton fournisseur</h2>
      {store.supplierUrl && !editing ? (
        <>
          <p className="mt-3 flex items-center gap-2 text-[15px] font-semibold"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#14b886]"><Check className="h-3 w-3 text-white" strokeWidth={3} /></span> Fournisseur relié</p>
          <p className="mt-1 text-sm text-fg-muted">Quand tu as une commande, tu commandes le produit ici et tu le fais livrer à ton client.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href={store.supplierUrl} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-ctl border border-white/15 px-3 text-sm font-medium hover:border-[#14b886]">Voir chez {host || "le fournisseur"} <ExternalLink className="h-3.5 w-3.5" /></a>
            <button type="button" onClick={() => setEditing(true)} className="inline-flex h-9 items-center gap-1.5 rounded-ctl px-2 text-sm text-fg-muted hover:text-fg"><Pencil className="h-3.5 w-3.5" /> Changer</button>
          </div>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-fg-muted">Trouve qui fabrique et envoie ton produit{name ? <> (« {name} »)</> : null}, puis colle le lien ici : ta boutique sera reliée à ce fournisseur.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href={`https://www.aliexpress.com/wholesale?SearchText=${q}`} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-ctl border border-white/15 px-3 text-sm font-medium hover:border-[#14b886]">Chercher sur AliExpress <ExternalLink className="h-3.5 w-3.5" /></a>
            <a href={`https://www.alibaba.com/trade/search?SearchText=${q}`} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-ctl border border-white/15 px-3 text-sm font-medium hover:border-[#14b886]">Chercher sur Alibaba <ExternalLink className="h-3.5 w-3.5" /></a>
          </div>
          <div className="mt-3 flex gap-2">
            <input type="url" inputMode="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://fr.aliexpress.com/item/…" aria-label="Lien du produit chez le fournisseur" className="field h-10 min-w-0 flex-1 py-0 text-sm" />
            <button type="button" onClick={save} disabled={busy || !url.trim()} className="inline-flex h-10 shrink-0 items-center rounded-ctl border border-[#14b886]/60 bg-[linear-gradient(180deg,#14b886,#00876a)] px-3.5 text-sm font-semibold text-white glow-hover disabled:opacity-50">{busy ? <Spinner /> : "Relier"}</button>
          </div>
          <p className="mt-2 text-xs text-fg-faint">Conseil : choisis un produit avec beaucoup de ventes, de bons avis et une livraison en France.</p>
        </>
      )}
    </section>
  );
}
