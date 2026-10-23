"use client";

import { ExternalLink, Monitor, Smartphone, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { StorePreview, type PreviewPage } from "@/components/app/StorePreview";
import { useStore } from "@/components/app/StoreContext";
import * as api from "@/lib/api/client";
import { useApi } from "@/lib/api/hooks";
import { cn } from "@/lib/cn";

// La boutique en plein écran, comme un client la verra, sans le mot de passe des boutiques Shopify en essai.
export default function StoreFullPreview() {
  const { store } = useStore();
  const [page, setPage] = useState<PreviewPage>("accueil");
  const [device, setDevice] = useState<"auto" | "mobile">("auto");
  const assets = useApi(() => api.listAssets(store.id), [store.id]);
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => { scroller.current?.scrollTo({ top: 0 }); }, [page]); // chaque page s'ouvre en haut
  const tab = (on: boolean) => cn("rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors", on ? "bg-white text-[#0b1f1b]" : "text-white/70 hover:text-white");
  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-[#0b1f1b]">
      <div className="flex items-center gap-2 px-3 py-2 text-white">
        <Link href={`/app/boutiques/${store.id}`} aria-label="Fermer l'aperçu" className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10"><X className="h-5 w-5" /></Link>
        <div className="flex gap-1 rounded-full bg-white/10 p-1">
          <button type="button" onClick={() => setPage("accueil")} className={tab(page === "accueil")}>Accueil</button>
          <button type="button" onClick={() => setPage("produit")} className={tab(page === "produit")}>Fiche produit</button>
        </div>
        <div className="ml-auto hidden gap-1 rounded-full bg-white/10 p-1 sm:flex">
          <button type="button" aria-label="Ordinateur" onClick={() => setDevice("auto")} className={tab(device === "auto")}><Monitor className="h-4 w-4" /></button>
          <button type="button" aria-label="Téléphone" onClick={() => setDevice("mobile")} className={tab(device === "mobile")}><Smartphone className="h-4 w-4" /></button>
        </div>
        {store.liveUrl && <a href={store.liveUrl} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] text-white/70 hover:bg-white/10 hover:text-white sm:ml-0">Sur Shopify <ExternalLink className="h-3.5 w-3.5" /></a>}
      </div>
      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto bg-white">
        <StorePreview store={store} page={page} device={device} assets={assets.data?.assets} />
      </div>
    </div>
  );
}
