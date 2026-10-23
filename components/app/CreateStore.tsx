"use client";

import { AlertCircle, Check, ImagePlus, Link2, PenLine, Plus, RefreshCw, Sparkles, X } from "lucide-react";
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

const MODES: { id: CreationMode; label: string; sub: string; color: string; icon: typeof PenLine; placeholder: string; hint: string }[] = [
  { id: "link", label: "Coller un lien", sub: "Ton fournisseur, ex. AliExpress", color: "#34d399", icon: Link2, placeholder: "Facultatif : ce que tu veux préciser (cible, prix de vente, ambiance)…", hint: "Le lien du produit que tu vends chez ton fournisseur (AliExpress, CJ…) ou sur ta propre page. L'IA en relève les caractéristiques et écrit une boutique originale." },
  { id: "start", label: "Décrire", sub: "Ton idée en une phrase", color: "#a78bfa", icon: PenLine, placeholder: "Décris ton projet (ex. : bijoux minimalistes en acier doré, cible 25-35 ans, ton chic et accessible)…", hint: "Plus ton brief est précis (produit, cible, prix, ambiance), meilleur est le résultat." },
  { id: "recraft", label: "Refaire ma boutique", sub: "Améliorer l'existante", color: "#fbbf24", icon: RefreshCw, placeholder: "Ce qui ne va pas aujourd'hui et ce que tu veux (ex. : ton plus premium, fiche produit plus claire)…", hint: "L'IA lit ta boutique connectée et propose une nouvelle version dans un thème non publié." },
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

// Capture d'écran réduite dans le navigateur (1600 px, JPEG) avant l'envoi.
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 1600 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * k);
      canvas.height = Math.round(img.height * k);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(img.src);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => reject(new Error("Image illisible."));
    img.src = URL.createObjectURL(file);
  });
}

export const LANGUAGES = ["français", "anglais", "espagnol", "allemand", "italien", "néerlandais", "portugais", "polonais", "suédois", "danois", "tchèque", "roumain"];

export function CreateStore() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, setStores, refresh } = useApp();
  const connections = useApi(() => api.listConnections(), []);
  const [mode, setMode] = useState<CreationMode>((params.get("mode") as CreationMode) || (params.get("brief") ? "start" : "link"));
  const [shots, setShots] = useState<string[]>([]);
  // Vérification du lien dès qu'il est collé (aperçu, ou demande de captures si le site bloque).
  const [link, setLink] = useState<{ state: "idle" | "checking" } | { state: "ok"; title: string; image: string | null } | { state: "blocked"; reason: string; protectedSite: boolean }>({ state: "idle" });
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
    if (pending.screenshots) setShots(pending.screenshots);
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

  useEffect(() => {
    const u = url.trim();
    if (mode !== "link" || !/^https?:\/\/[^\s/]+\.[^\s]+$/.test(u)) { setLink({ state: "idle" }); return; }
    let live = true;
    setLink({ state: "checking" });
    const t = setTimeout(() => {
      api.checkLink(u)
        .then((r) => { if (live) setLink(r.ok ? { state: "ok", title: r.title, image: r.image } : { state: "blocked", reason: r.reason, protectedSite: r.protectedSite }); })
        .catch(() => { if (live) setLink({ state: "idle" }); });
    }, 600);
    return () => { live = false; clearTimeout(t); };
  }, [url, mode]);

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
      setLoading(false);
      refresh();
      // Aperçu gratuit déjà utilisé : on propose directement l'abonnement, le projet est gardé.
      if (err instanceof ApiClientError && err.code === "subscription_required") return setPaywall(input);
      setError(err as ApiClientError);
    }
  }

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (mode === "link" && !shots.length && !/^https?:\/\//.test(url.trim())) return setError(new ApiClientError(400, "invalid_input", "Colle le lien du produit (il commence par https://), ou ajoute simplement une photo du produit.", "url"));
    if (mode === "link" && link.state === "blocked" && !shots.length && brief.trim().length < 25) {
      return setError(new ApiClientError(400, "invalid_input", "Ce site ne laisse pas lire sa page. Ajoute 1 à 3 captures d'écran de la page produit (ou décris le produit en une phrase), puis clique sur Générer.", "url"));
    }
    if (mode === "recraft" && !shop) return setError(new ApiClientError(400, "no_shop", "Connecte d'abord ta boutique Shopify pour la refondre."));
    if (mode !== "link" && !(mode === "start" && shots.length) && brief.trim().length < 10) return setError(new ApiClientError(400, "invalid_input", "Décris ton projet en une ou deux phrases.", "brief"));
    const input: GenerateStoreInput = { mode, brief: brief.trim() || (url.trim() ? "Boutique à partir du lien produit" : "Boutique à partir des photos du produit"), productUrl: mode === "link" && url.trim() ? url.trim() : undefined, screenshots: mode !== "recraft" && shots.length ? shots : undefined, language, shopConnectionId: shop || undefined };
    // Sans abonnement : une boutique d'aperçu gratuite (floutée), puis l'offre pour la débloquer.
    generate(input);
  }

  async function addShots(files: FileList | null) {
    if (!files) return;
    try {
      const list = await Promise.all([...files].filter((f) => f.type.startsWith("image/")).slice(0, 3 - shots.length).map(compressImage));
      setShots((s) => [...s, ...list].slice(0, 3));
    } catch (e) {
      setError(new ApiClientError(400, "invalid_input", (e as Error).message));
    }
  }

  // Un lien collé dans la description bascule tout seul sur l'import par lien.
  function onBriefChange(value: string) {
    const link = value.trim().match(/^https?:\/\/\S+$/);
    if (link && mode !== "recraft") {
      setMode("link");
      setUrl(link[0]);
      setBrief("");
      return;
    }
    setBrief(value);
  }

  // Photos ou captures du produit : utilisables avec ou sans lien, et en mode « Décrire ».
  const shotsRow = (
    <div className="flex flex-wrap items-center gap-2 px-4 pb-3">
      {shots.map((src, i) => (
        <span key={i} className="relative h-12 w-12 overflow-hidden rounded-[8px] border border-white/15">
          <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
          <button type="button" onClick={() => setShots((s) => s.filter((_, j) => j !== i))} aria-label="Retirer la photo" className="absolute right-0.5 top-0.5 grid h-4 w-4 place-items-center rounded-full bg-black/70 text-white"><X className="h-3 w-3" /></button>
        </span>
      ))}
      {shots.length < 3 && (
        <label className={cn("inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-dashed px-2.5 py-1 text-xs transition-colors", link.state === "blocked" && !shots.length ? "border-accent/60 bg-accent-deep/40 text-fg" : "border-white/15 text-fg-muted hover:border-white/30 hover:text-fg")}>
          <ImagePlus className="h-3.5 w-3.5" /> {shots.length ? "Ajouter une photo" : mode === "start" ? "Ajouter une photo du produit (facultatif)" : link.state === "blocked" ? "Ajouter des captures d'écran" : "Pas de lien ? Ajoute juste une photo ou une capture"}
          <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { addShots(e.target.files); e.target.value = ""; }} />
        </label>
      )}
    </div>
  );

  const met = CRITERIA.map((c) => c.test.test(brief));
  const score = met.filter(Boolean).length;

  return (
    <div className="mx-auto w-full max-w-[720px]">
      <form onSubmit={submit} onPaste={(e) => { if (mode !== "recraft" && e.clipboardData.files.length) { e.preventDefault(); addShots(e.clipboardData.files); } }} className="glow-frame rounded-[16px] p-[1.5px]">
        <div className="rounded-[15px] bg-[linear-gradient(180deg,#0d3a2d,#062419)]">
          {mode === "link" && (
            <div className="border-b border-white/[0.06]">
              <div className="flex items-center gap-2 px-4 py-3.5">
                <Link2 className="h-5 w-5 shrink-0 text-accent" />
                <label htmlFor="url" className="sr-only">Lien du produit</label>
                <input id="url" type="url" inputMode="url" autoFocus value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Colle le lien de ton produit chez ton fournisseur (AliExpress, CJ…)" className="w-full bg-transparent text-base placeholder:text-fg-faint focus:outline-none" />
                {url && <button type="button" onClick={() => setUrl("")} aria-label="Effacer le lien" className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-fg-faint hover:bg-white/5 hover:text-fg"><X className="h-4 w-4" /></button>}
              </div>
              {link.state === "checking" && <p className="flex items-center gap-2 px-4 pb-2 text-xs text-fg-muted"><Spinner /> Lecture du lien…</p>}
              {link.state === "ok" && (
                <p className="mx-4 mb-2 flex items-center gap-2.5 rounded-ctl border border-accent/25 bg-accent-deep/25 px-2.5 py-2 text-sm [animation:fade-in_.3s_ease-out]">
                  {link.image ? <img src={link.image} alt="" className="h-9 w-9 shrink-0 rounded-[6px] object-cover" /> : <Check className="h-4 w-4 shrink-0 text-accent" />}
                  <span className="min-w-0 flex-1 truncate">{link.title || "Produit trouvé"}</span>
                  <span className="shrink-0 text-xs text-accent">Produit trouvé ✓</span>
                </p>
              )}
              {link.state === "blocked" && !shots.length && (
                <p role="status" className="mx-4 mb-2 rounded-ctl border border-warn/30 bg-warn/5 px-3 py-2 text-sm text-fg-muted [animation:fade-in_.3s_ease-out]">
                  {link.protectedSite ? "Ce site bloque la lecture automatique." : "Cette page n'a pas pu être lue."} <strong className="text-fg">Ajoute 1 à 3 captures d'écran de la page produit</strong> (photo, titre, caractéristiques), ou colle-les ici avec Ctrl+V : l'IA les lit et crée ta boutique pareil.
                </p>
              )}
              {shotsRow}
            </div>
          )}
          <label htmlFor="brief" className="sr-only">Ton brief</label>
          <textarea
            ref={textarea}
            id="brief"
            rows={mode === "link" ? 2 : 4}
            value={brief}
            onChange={(e) => onBriefChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(); }}
            placeholder={current.placeholder}
            className="block w-full resize-none bg-transparent px-4 pb-2 pt-4 text-[15px] leading-relaxed placeholder:text-fg-faint focus:outline-none"
          />
          {mode === "start" && shotsRow}
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

      <div role="tablist" aria-label="Mode de création" className="mx-auto mt-6 grid max-w-[720px] grid-cols-3 gap-2 sm:gap-3">
        {MODES.map((m) => {
          const on = mode === m.id;
          return (
            <button key={m.id} role="tab" aria-selected={on} onClick={() => setMode(m.id)}
              className={cn("group flex flex-col items-center gap-2 rounded-[14px] border px-2 py-3 text-center transition-all duration-200 sm:flex-row sm:gap-3 sm:px-4 sm:py-3.5 sm:text-left", on ? "-translate-y-0.5 shadow-[0_14px_30px_-14px_var(--c)]" : "border-white/[0.08] bg-white/[0.02] hover:-translate-y-0.5 hover:border-white/20")}
              style={{ ["--c" as string]: m.color, ...(on ? { borderColor: `${m.color}99`, background: `${m.color}1f` } : {}) }}>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full transition-transform group-hover:scale-105" style={{ background: `${m.color}${on ? "33" : "1f"}`, color: m.color }}>
                <m.icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className={cn("block text-[13px] font-semibold sm:text-[15px]", on ? "text-white" : "text-fg")}>{m.label}</span>
                <span className="hidden text-xs text-fg-muted sm:block">{m.sub}</span>
              </span>
            </button>
          );
        })}
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
