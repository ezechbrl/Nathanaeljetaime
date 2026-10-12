"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { StorePlan } from "@/lib/store-schema";
import { StorePreview } from "./StorePreview";

const LANGUAGES = ["français", "anglais", "espagnol", "allemand", "italien", "néerlandais", "portugais"];

type PublishState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; productAdminUrl: string }
  | { status: "error"; message: string };

export function Generator() {
  const params = useSearchParams();
  const [brief, setBrief] = useState(params.get("brief") ?? "");
  const [productUrl, setProductUrl] = useState(params.get("url") ?? "");
  const [language, setLanguage] = useState("français");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<StorePlan | null>(null);
  const [publish, setPublish] = useState<PublishState>({ status: "idle" });

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPlan(null);
    setPublish({ status: "idle" });
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ brief, productUrl, language }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erreur inconnue");
      setPlan(json.plan);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function publishToShopify() {
    if (!plan) return;
    setPublish({ status: "loading" });
    try {
      const res = await fetch("/api/shopify/publish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erreur inconnue");
      setPublish({ status: "done", productAdminUrl: json.productAdminUrl });
    } catch (err) {
      setPublish({ status: "error", message: (err as Error).message });
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Crée ta boutique</h1>
        <p className="mt-2 text-black/60">Décris ton projet, l'IA pose la stratégie puis construit ta boutique.</p>
      </div>

      <form onSubmit={generate} className="space-y-4 rounded-3xl border border-black/10 p-6">
        <label className="block">
          <span className="text-sm font-medium">Ton brief</span>
          <textarea
            required
            minLength={10}
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={4}
            placeholder="Ex. : Marque de baumes à lèvres naturels, cible femmes 25-40 ans, positionnement premium, prix autour de 15 €."
            className="mt-1 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand/30"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
          <label className="block">
            <span className="text-sm font-medium">Lien produit (optionnel)</span>
            <input
              type="url"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              placeholder="https://…"
              className="mt-1 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand/30"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Langue</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
            >
              {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
            </select>
          </label>
        </div>
        <button
          disabled={loading}
          className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-50"
        >
          {loading ? "L'IA compose ta boutique… (1 à 2 min)" : "Générer ma boutique"}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      {plan && (
        <>
          <StorePreview plan={plan} />
          <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-black/10 p-6">
            <button
              onClick={publishToShopify}
              disabled={publish.status === "loading" || publish.status === "done"}
              className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {publish.status === "loading" ? "Publication…" : "Publier sur Shopify (brouillon)"}
            </button>
            {publish.status === "done" && (
              <a href={publish.productAdminUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-brand underline">
                Voir le produit dans Shopify ↗
              </a>
            )}
            {publish.status === "error" && <p className="text-sm text-red-600">{publish.message}</p>}
          </div>
        </>
      )}
    </div>
  );
}
