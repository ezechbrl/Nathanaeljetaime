"use client";

import { AlertCircle, Link2, PenLine, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/Button";
import * as api from "@/lib/api/client";
import { ApiClientError } from "@/lib/api/errors";
import { useApi } from "@/lib/api/hooks";
import type { CreationMode } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { useApp } from "./AppContext";

const MODES: { id: CreationMode; label: string; icon: typeof PenLine; placeholder: string; hint: string }[] = [
  { id: "start", label: "Créer", icon: PenLine, placeholder: "Décris ton projet (ex. : bijoux minimalistes en acier doré, cible 25-35 ans, ton chic et accessible)…", hint: "Plus ton brief est précis (produit, cible, prix, ambiance), meilleur est le résultat." },
  { id: "link", label: "Depuis un lien", icon: Link2, placeholder: "Ajoute ce que tu veux changer par rapport à la page d'origine (ton, cible, prix)…", hint: "L'IA lit la page produit et écrit une fiche originale : rien n'est copié." },
  { id: "recraft", label: "Refondre", icon: RefreshCw, placeholder: "Ce qui ne va pas aujourd'hui et ce que tu veux (ex. : ton plus premium, fiche produit plus claire)…", hint: "L'IA lit ta boutique connectée et propose une nouvelle version dans un thème non publié." },
];

export const LANGUAGES = ["français", "anglais", "espagnol", "allemand", "italien", "néerlandais", "portugais", "polonais", "suédois", "danois", "tchèque", "roumain"];

export function CreateStore() {
  const router = useRouter();
  const params = useSearchParams();
  const { setStores, refresh } = useApp();
  const connections = useApi(() => api.listConnections(), []);
  const [mode, setMode] = useState<CreationMode>((params.get("mode") as CreationMode) || "start");
  const [brief, setBrief] = useState(params.get("brief") ?? "");
  const [url, setUrl] = useState(params.get("url") ?? "");
  const [language, setLanguage] = useState("français");
  const [shop, setShop] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiClientError | null>(null);
  const current = MODES.find((m) => m.id === mode)!;
  const shops = connections.data?.connections.filter((c) => c.status === "active") ?? [];

  useEffect(() => {
    if (!shop && shops[0]) setShop(shops[0].id);
  }, [shops, shop]);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (mode === "link" && !/^https?:\/\//.test(url)) return setError(new ApiClientError(400, "invalid_input", "Colle un lien qui commence par https://", "url"));
    if (mode === "recraft" && !shop) return setError(new ApiClientError(400, "no_shop", "Connecte d'abord ta boutique Shopify pour la refondre."));
    if (mode !== "link" && brief.trim().length < 10) return setError(new ApiClientError(400, "invalid_input", "Décris ton projet en une ou deux phrases.", "brief"));
    setLoading(true);
    try {
      const { store } = await api.createStore({ mode, brief: brief.trim() || "Boutique à partir du lien produit", productUrl: mode === "link" ? url : undefined, language, shopConnectionId: shop || undefined });
      setStores((s) => [store, ...s]);
      refresh();
      router.push(`/app/boutiques/${store.id}`);
    } catch (err) {
      setError(err as ApiClientError);
      setLoading(false);
      refresh();
    }
  }

  return (
    <div className="mx-auto w-full max-w-[720px]">
      <form onSubmit={submit} className="rounded-[14px] p-px [background:linear-gradient(180deg,rgb(212_245_156/0.7),rgb(255_255_255/0.2)_45%,rgb(255_255_255/0.12))]">
        <div className="rounded-[13px] bg-[linear-gradient(180deg,#139c77,#0a8a67)] backdrop-blur-md">
          {mode === "link" && (
            <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
              <Link2 className="h-4 w-4 shrink-0 text-accent" />
              <label htmlFor="url" className="sr-only">Lien de la page produit</label>
              <input id="url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://… lien de la page produit" className="w-full bg-transparent text-[15px] placeholder:text-fg-faint focus:outline-none" />
            </div>
          )}
          <label htmlFor="brief" className="sr-only">Ton brief</label>
          <textarea
            id="brief"
            rows={4}
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(); }}
            placeholder={current.placeholder}
            className="block w-full resize-none bg-transparent px-4 pb-2 pt-4 text-[15px] leading-relaxed placeholder:text-fg-faint focus:outline-none"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 pb-3">
            <div className="flex flex-wrap gap-2">
              <label className="sr-only" htmlFor="lang">Langue de la boutique</label>
              <select id="lang" value={language} onChange={(e) => setLanguage(e.target.value)} className="h-8 rounded-[7px] border border-white/10 bg-white/[0.03] px-2 text-xs text-fg-muted">
                {LANGUAGES.map((l) => <option key={l} value={l} className="bg-bg-2">{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
              </select>
              {shops.length > 0 && (
                <>
                  <label className="sr-only" htmlFor="shop">Boutique Shopify</label>
                  <select id="shop" value={shop} onChange={(e) => setShop(e.target.value)} className="h-8 max-w-[200px] rounded-[7px] border border-white/10 bg-white/[0.03] px-2 text-xs text-fg-muted">
                    {shops.map((c) => <option key={c.id} value={c.id} className="bg-bg-2">{c.shopDomain}</option>)}
                  </select>
                </>
              )}
            </div>
            <button type="submit" disabled={loading} className="inline-flex h-9 items-center gap-2 rounded-ctl border border-white/10 bg-[linear-gradient(180deg,#0b3324,#041a13)] px-3.5 text-sm font-medium text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_8px_22px_-8px_rgb(4_26_19/0.8)] transition-shadow hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_10px_28px_-8px_rgb(4_26_19/0.95)] disabled:opacity-60">
              {loading ? <Spinner /> : <Sparkles className="h-4 w-4" />} Générer
            </button>
          </div>
        </div>
      </form>

      <div role="tablist" aria-label="Mode de création" className="surface mx-auto mt-5 flex w-fit gap-1 rounded-ctl p-1">
        {MODES.map((m) => (
          <button key={m.id} role="tab" aria-selected={mode === m.id} onClick={() => setMode(m.id)} className={cn("flex items-center gap-2 rounded-[7px] px-3 py-1.5 text-[13px] transition-colors", mode === m.id ? "border border-accent/30 bg-accent-deep/50 text-fg" : "border border-transparent text-fg-muted hover:text-fg")}>
            <m.icon className="h-3.5 w-3.5" /> {m.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-fg-faint">{current.hint}</p>

      {error && (
        <div role="alert" className="mt-5 flex items-start gap-3 rounded-card border border-bad/25 bg-bad/5 p-4 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-bad" />
          <div className="text-fg-muted">
            {error.message}
            {error.code === "quota_exceeded" && <Link href="/app/abonnement" className="ml-1 text-fg underline underline-offset-4">Voir les offres</Link>}
            {(error.code === "no_shop") && <Link href="/app/parametres#shopify" className="ml-1 text-fg underline underline-offset-4">Connecter Shopify</Link>}
          </div>
        </div>
      )}
    </div>
  );
}
