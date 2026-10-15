"use client";

import { AlertCircle, Check, Link2, PenLine, Plus, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/ui/Button";
import * as api from "@/lib/api/client";
import { ApiClientError } from "@/lib/api/errors";
import { useApi } from "@/lib/api/hooks";
import type { CreationMode, GenerateStoreInput } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { useApp } from "./AppContext";
import { PaywallDialog, readPendingDraft } from "./Paywall";

const MODES: { id: CreationMode; label: string; icon: typeof PenLine; placeholder: string; hint: string }[] = [
  { id: "start", label: "Décrire", icon: PenLine, placeholder: "Décris ton projet (ex. : bijoux minimalistes en acier doré, cible 25-35 ans, ton chic et accessible)…", hint: "Plus ton brief est précis (produit, cible, prix, ambiance), meilleur est le résultat." },
  { id: "link", label: "Importer un lien", icon: Link2, placeholder: "Ajoute ce que tu veux changer par rapport à la page d'origine (ton, cible, prix)…", hint: "Uniquement un produit que tu vends : ta propre page ou celle de ton fournisseur. L'IA en tire les caractéristiques et écrit une fiche originale." },
  { id: "recraft", label: "Refaire ma boutique", icon: RefreshCw, placeholder: "Ce qui ne va pas aujourd'hui et ce que tu veux (ex. : ton plus premium, fiche produit plus claire)…", hint: "L'IA lit ta boutique connectée et propose une nouvelle version dans un thème non publié." },
];

// Ce qui rend un brief bon : chaque critère détecté s'allume, un clic ajoute une amorce.
const CRITERIA: { label: string; test: RegExp; add: string }[] = [
  { label: "Produit", test: /\b(vend|bijou|bougie|vêtement|t-shirt|sneaker|savon|café|thé|sac|montre|lunette|cosmétique|crème|accessoire|produit|collection|déco|lampe|jouet|coque)/i, add: "Je vends " },
  { label: "Cible", test: /\b(cible|pour (les |des )?(femmes|hommes|enfants|ados|jeunes|parents|sportifs|étudiants|mamans|actifs)|\d{2}\s?-\s?\d{2} ans|ans\b|clientèle)/i, add: "Cible : " },
  { label: "Prix", test: /(\d+\s?(€|euros?)|prix|haut de gamme|abordable|accessible|premium|luxe|petit prix)/i, add: "Prix autour de  €" },
  { label: "Ambiance", test: /\b(ton|ambiance|style|minimal|chic|fun|naturel|élégant|moderne|vintage|coloré|doux|audacieux|zen|rétro)/i, add: "Ambiance : " },
];

const EXAMPLES = [
  "Bougies parfumées artisanales en cire de soja, pour les 25-40 ans qui aiment la déco, prix autour de 25 €, ambiance chaleureuse et naturelle.",
  "Sneakers éco-conçues en matières recyclées, pour les actifs urbains de 20-35 ans, prix autour de 120 €, style minimal et moderne.",
  "Bijoux minimalistes en acier doré, pour les femmes de 25-35 ans, prix entre 20 et 50 €, ton chic et accessible.",
];

export const LANGUAGES = ["français", "anglais", "espagnol", "allemand", "italien", "néerlandais", "portugais", "polonais", "suédois", "danois", "tchèque", "roumain"];

export function CreateStore() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, setStores, refresh } = useApp();
  const connections = useApi(() => api.listConnections(), []);
  const [mode, setMode] = useState<CreationMode>((params.get("mode") as CreationMode) || "start");
  const [brief, setBrief] = useState(params.get("brief") ?? "");
  const [url, setUrl] = useState(params.get("url") ?? "");
  const [language, setLanguage] = useState("français");
  const [shop, setShop] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [paywall, setPaywall] = useState<GenerateStoreInput | null>(null);
  const [autostart, setAutostart] = useState<GenerateStoreInput | null>(null);
  const started = useRef(false);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const current = MODES.find((m) => m.id === mode)!;
  const shops = connections.data?.connections.filter((c) => c.status === "active") ?? [];

  useEffect(() => {
    if (!shop && shops[0]) setShop(shops[0].id);
  }, [shops, shop]);

  // Projet saisi avant l'activation de l'abonnement : on le remet en place, et on le lance s'il était validé.
  useEffect(() => {
    const pending = readPendingDraft();
    if (!pending) return;
    setMode(pending.mode);
    setBrief(pending.brief);
    if (pending.productUrl) setUrl(pending.productUrl);
    setLanguage(pending.language);
    if (pending.shopConnectionId) setShop(pending.shopConnectionId);
    if (pending.autostart) setAutostart(pending);
  }, []);

  useEffect(() => {
    if (!autostart || started.current || user.plan === "free") return;
    started.current = true;
    generate(autostart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autostart, user.plan]);

  function addHint(text: string) {
    setBrief((b) => (b.trim() ? `${b.trim().replace(/[.,;]?$/, ".")} ${text}` : text));
    requestAnimationFrame(() => {
      const el = textarea.current;
      if (!el) return;
      el.focus();
      const at = el.value.endsWith(" €") ? el.value.length - 2 : el.value.length;
      el.setSelectionRange(at, at);
    });
  }

  async function generate(input: GenerateStoreInput) {
    setLoading(true);
    try {
      const { store } = await api.createStore(input);
      setStores((s) => [store, ...s]);
      refresh();
      router.push(`/app/boutiques/${store.id}`);
    } catch (err) {
      setError(err as ApiClientError);
      setLoading(false);
      refresh();
    }
  }

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (mode === "link" && !/^https?:\/\//.test(url)) return setError(new ApiClientError(400, "invalid_input", "Colle un lien qui commence par https://", "url"));
    if (mode === "recraft" && !shop) return setError(new ApiClientError(400, "no_shop", "Connecte d'abord ta boutique Shopify pour la refondre."));
    if (mode !== "link" && brief.trim().length < 10) return setError(new ApiClientError(400, "invalid_input", "Décris ton projet en une ou deux phrases.", "brief"));
    const input: GenerateStoreInput = { mode, brief: brief.trim() || "Boutique à partir du lien produit", productUrl: mode === "link" ? url : undefined, language, shopConnectionId: shop || undefined };
    // Sans abonnement, rien n'est envoyé à l'IA : on propose Pro au moment où le projet est prêt.
    if (user.plan === "free") return setPaywall(input);
    generate(input);
  }

  const met = CRITERIA.map((c) => c.test.test(brief));
  const score = met.filter(Boolean).length;

  return (
    <div className="mx-auto w-full max-w-[720px]">
      <form onSubmit={submit} className="rounded-[14px] p-px [background:linear-gradient(180deg,rgb(0_166_118/0.45),rgb(0_166_118/0.08)_45%,rgb(255_255_255/0.06))]">
        <div className="rounded-[13px] bg-[linear-gradient(180deg,#123d35,#0c2b26)]">
          {mode === "link" && (
            <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
              <Link2 className="h-4 w-4 shrink-0 text-accent" />
              <label htmlFor="url" className="sr-only">Lien de la page produit</label>
              <input id="url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://… ta page produit ou celle de ton fournisseur" className="w-full bg-transparent text-[15px] placeholder:text-fg-faint focus:outline-none" />
            </div>
          )}
          <label htmlFor="brief" className="sr-only">Ton brief</label>
          <textarea
            ref={textarea}
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
            <button type="submit" disabled={loading} className="inline-flex h-9 items-center gap-2 rounded-ctl border border-accent/40 bg-[linear-gradient(180deg,#10b07f,#00876a)] px-3.5 text-sm font-medium text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_6px_20px_-6px_rgb(0_166_118/0.6)] disabled:opacity-60">
              {loading ? <Spinner /> : <Sparkles className="h-4 w-4" />} Générer
            </button>
          </div>
        </div>
      </form>

      {mode !== "link" && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2" aria-live="polite">
          <span className="flex items-center gap-2 text-xs text-fg-faint">
            <span className="flex gap-0.5" aria-hidden>{CRITERIA.map((c, i) => <span key={c.label} className={cn("h-1.5 w-4 rounded-full transition-colors duration-300", i < score ? "bg-accent" : "bg-white/10")} />)}</span>
            {score === 4 ? "Brief au top" : score >= 2 ? "Bon début" : "Ton brief"}
          </span>
          {CRITERIA.map((c, i) => (
            <button key={c.label} type="button" onClick={() => !met[i] && addHint(c.add)} aria-pressed={met[i]} className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-all duration-300", met[i] ? "border-accent/40 bg-accent-deep/40 text-fg [animation:pop-in_.3s_ease-out]" : "border-dashed border-white/15 text-fg-muted hover:border-white/30 hover:text-fg")}>
              {met[i] ? <Check className="h-3 w-3 text-accent" /> : <Plus className="h-3 w-3" />} {c.label}
            </button>
          ))}
        </div>
      )}
      {mode === "start" && !brief.trim() && (
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <span className="text-xs text-fg-faint">Besoin d'idée ?</span>
          {EXAMPLES.map((ex) => (
            <button key={ex} type="button" onClick={() => setBrief(ex)} className="rounded-full bg-white/[0.04] px-2.5 py-1 text-xs text-fg-muted transition-colors hover:bg-white/[0.08] hover:text-fg">{ex.split(" ").slice(0, 2).join(" ")}</button>
          ))}
        </div>
      )}

      <div role="tablist" aria-label="Mode de création" className="surface mx-auto mt-5 flex w-fit gap-1 rounded-ctl p-1">
        {MODES.map((m) => (
          <button key={m.id} role="tab" aria-selected={mode === m.id} onClick={() => setMode(m.id)} className={cn("flex items-center gap-2 rounded-[7px] px-3 py-1.5 text-[13px] transition-colors", mode === m.id ? "border border-accent/30 bg-accent-deep/50 text-fg" : "border border-transparent text-fg-muted hover:text-fg")}>
            <m.icon className="h-3.5 w-3.5" /> {m.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-fg-faint">{current.hint}</p>

      {paywall && <PaywallDialog draft={paywall} onClose={() => setPaywall(null)} />}

      {error && (
        <div role="alert" className="mt-5 flex items-start gap-3 rounded-card border border-bad/25 bg-bad/5 p-4 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-bad" />
          <div className="text-fg-muted">
            {error.message}
            {(error.code === "quota_exceeded" || error.code === "subscription_required") && <Link href="/app/abonnement" className="ml-1 text-fg underline underline-offset-4">Voir les offres</Link>}
            {(error.code === "no_shop") && <Link href="/app/parametres#shopify" className="ml-1 text-fg underline underline-offset-4">Connecter Shopify</Link>}
          </div>
        </div>
      )}
    </div>
  );
}
