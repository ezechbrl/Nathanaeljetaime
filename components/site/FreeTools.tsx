"use client";

import { Check, Clapperboard, Copy, FileText, HelpCircle, Megaphone, Quote, RefreshCw, Sparkles, Store, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { Button, ButtonLink, Spinner } from "@/components/ui/Button";
import { runTool } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import { sanitizeHtml } from "@/lib/sanitize";

type ToolId = "store-name" | "slogan" | "product-description" | "faq" | "tiktok-ideas" | "instagram-caption";
type Field = { name: string; label: string; placeholder: string; textarea?: boolean };

const TOOLS: { id: ToolId; icon: LucideIcon; label: string; description: string; fields: Field[] }[] = [
  { id: "store-name", icon: Store, label: "Nom de boutique", description: "Des noms courts et mémorables pour ta marque.", fields: [
    { name: "niche", label: "Ce que tu vends", placeholder: "Bougies parfumées artisanales" },
    { name: "vibe", label: "Ambiance", placeholder: "Douce, naturelle, haut de gamme" },
  ] },
  { id: "slogan", icon: Quote, label: "Slogan", description: "Une phrase qui résume ta promesse, pour le haut de ta boutique.", fields: [
    { name: "brandName", label: "Nom de la marque", placeholder: "Maison Lune" },
    { name: "niche", label: "Ce que tu vends", placeholder: "Bougies parfumées artisanales" },
  ] },
  { id: "product-description", icon: FileText, label: "Description produit", description: "Une description qui donne envie, prête à coller dans Shopify.", fields: [
    { name: "productName", label: "Nom du produit", placeholder: "Bougie Figue & Cèdre" },
    { name: "details", label: "Caractéristiques", placeholder: "Cire de soja, 50 h de combustion, mèche en coton", textarea: true },
  ] },
  { id: "faq", icon: HelpCircle, label: "FAQ produit", description: "Les questions que tes clients se posent avant d'acheter, avec les réponses.", fields: [
    { name: "productName", label: "Nom du produit", placeholder: "Bougie Figue & Cèdre" },
    { name: "details", label: "Caractéristiques", placeholder: "Cire de soja, 50 h de combustion", textarea: true },
  ] },
  { id: "tiktok-ideas", icon: Clapperboard, label: "Idées de vidéos TikTok", description: "5 vidéos à tourner avec ton téléphone : l'accroche, quoi filmer, la légende.", fields: [
    { name: "productName", label: "Nom du produit", placeholder: "Bougie Figue & Cèdre" },
    { name: "details", label: "Pour qui, et pourquoi c'est bien", placeholder: "Pour les soirées cocooning, parfum boisé qui tient toute la soirée", textarea: true },
  ] },
  { id: "instagram-caption", icon: Megaphone, label: "Légende Instagram", description: "Des légendes courtes avec emojis et hashtags, pour tes posts et stories.", fields: [
    { name: "productName", label: "Nom du produit", placeholder: "Bougie Figue & Cèdre" },
    { name: "details", label: "Ce que tu veux mettre en avant", placeholder: "Nouvelle collection d'automne, livraison offerte ce week-end", textarea: true },
  ] },
];

type Result = {
  names?: string[];
  slogans?: string[];
  captions?: string[];
  html?: string;
  items?: { question: string; answer: string }[];
  ideas?: { hook: string; scene: string; caption: string }[];
};

// Texte brut d'une description HTML, pour la copie lisible.
const plain = (html: string) => html.replace(/<li>/g, "• ").replace(/<\/(p|h3|li)>/g, "\n").replace(/<[^>]+>/g, "").replace(/\n{2,}/g, "\n").trim();

function CopyButton({ text, label = "Copier" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  function copy() {
    navigator.clipboard?.writeText(text).then(() => { setDone(true); window.setTimeout(() => setDone(false), 1600); }).catch(() => {});
  }
  return (
    <button type="button" onClick={copy} className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors", done ? "border-accent/50 bg-accent/15 text-accent" : "border-white/10 text-fg-muted hover:border-accent/40 hover:text-fg")}>
      {done ? <><Check className="h-3.5 w-3.5" /> Copié ✓</> : <><Copy className="h-3.5 w-3.5" /> {label}</>}
    </button>
  );
}

function ResultCard({ children, copy, copyLabel }: { children: React.ReactNode; copy: string; copyLabel?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-card border border-white/[0.08] bg-white/[0.03] p-4 transition-colors hover:border-accent/25">
      <div className="min-w-0 flex-1">{children}</div>
      <CopyButton text={copy} label={copyLabel} />
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-14 animate-pulse rounded-card bg-white/[0.05]" style={{ animationDelay: `${i * 120}ms` }} />
      ))}
    </div>
  );
}

// Outils IA : sur le site (gratuits) et dans l'app (champs pré-remplis avec la boutique active).
export function FreeTools({ inApp = false, defaults = {} }: { inApp?: boolean; defaults?: Record<string, string> }) {
  const [toolId, setToolId] = useState<ToolId>("store-name");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [lastInput, setLastInput] = useState<Record<string, string> | null>(null);
  const tool = TOOLS.find((t) => t.id === toolId)!;

  async function run(data: Record<string, string>) {
    setLoading(true);
    setError("");
    setResult(null);
    setLastInput(data);
    try {
      const { result } = await runTool<Result>(toolId, { ...data, language: "français" });
      setResult(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    run(Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>);
  }

  function pick(id: ToolId) {
    setToolId(id);
    setResult(null);
    setError("");
    setLastInput(null);
  }

  const list = result?.names ?? result?.slogans ?? result?.captions;

  return (
    <div>
      <div role="tablist" aria-label="Outils" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map(({ id, icon: Icon, label, description }) => {
          const active = id === toolId;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={active}
              onClick={() => pick(id)}
              className={cn(
                "group flex items-start gap-3.5 rounded-[18px] border p-4 text-left backdrop-blur transition-all duration-300",
                active
                  ? "border-accent/50 bg-[linear-gradient(160deg,rgb(16_176_127/0.22),rgb(0_0_0/0.25))] shadow-[0_0_28px_-10px_rgb(46_230_166/0.55)]"
                  : "border-white/[0.08] bg-black/20 hover:-translate-y-0.5 hover:border-accent/35 hover:shadow-[0_0_24px_-12px_rgb(46_230_166/0.5)]",
              )}
            >
              <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-shadow", active ? "border-accent/50 bg-accent/15 text-accent shadow-[0_0_18px_rgb(46_230_166/0.45)]" : "border-white/10 bg-white/[0.04] text-fg-muted group-hover:text-accent")}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[15.5px] font-medium">{label}</span>
                <span className="mt-0.5 block text-[13px] leading-snug text-fg-faint">{description}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 rounded-[20px] border border-white/[0.08] bg-black/25 p-5 backdrop-blur sm:p-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <form key={toolId} onSubmit={submit} className="space-y-4">
          <p className="flex items-center gap-2 text-lg tracking-tight"><tool.icon className="h-5 w-5 text-accent" /> {tool.label}</p>
          {tool.fields.map((f) => (
            <label key={f.name} className="block text-sm">
              {f.label}
              {f.textarea
                ? <textarea name={f.name} required rows={3} placeholder={f.placeholder} defaultValue={defaults[f.name]} className="field mt-1.5 resize-y" />
                : <input name={f.name} required placeholder={f.placeholder} defaultValue={defaults[f.name]} className="field mt-1.5" />}
            </label>
          ))}
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">{loading ? <><Spinner /> Génération…</> : <><Sparkles className="h-4 w-4" /> Générer</>}</Button>
        </form>

        <div aria-live="polite" className="min-w-0">
          {loading && <Skeleton />}
          {error && <p role="alert" className="rounded-card border border-bad/30 bg-bad/5 p-4 text-sm text-bad">{error}</p>}
          {!loading && !result && !error && (
            <div className="grid h-full min-h-[180px] place-items-center rounded-card border border-dashed border-white/10 p-6 text-center text-sm text-fg-faint">
              Remplis les champs et clique sur « Générer » : les résultats s'affichent ici, prêts à copier.
            </div>
          )}
          {result && (
            <div className="space-y-3">
              {list?.map((x) => (
                <ResultCard key={x} copy={x}><p className="whitespace-pre-line text-[16px] leading-snug tracking-tight">{x}</p></ResultCard>
              ))}
              {result.html && (
                <ResultCard copy={plain(result.html)}>
                  <div className="prose-store text-[15px] text-fg-muted" dangerouslySetInnerHTML={{ __html: sanitizeHtml(result.html) }} />
                  <div className="mt-3"><CopyButton text={result.html} label="Copier le HTML pour Shopify" /></div>
                </ResultCard>
              )}
              {result.items?.map((x) => (
                <ResultCard key={x.question} copy={`${x.question}\n${x.answer}`}>
                  <p className="font-medium">{x.question}</p>
                  <p className="mt-1 text-sm text-fg-muted">{x.answer}</p>
                </ResultCard>
              ))}
              {result.ideas?.map((x, i) => (
                <ResultCard key={x.hook} copy={`Accroche : ${x.hook}\nÀ filmer : ${x.scene}\nLégende : ${x.caption}`}>
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-accent">Vidéo {i + 1}</p>
                  <p className="mt-1 font-medium">« {x.hook} »</p>
                  <p className="mt-1.5 text-sm text-fg-muted"><span className="text-fg-faint">À filmer : </span>{x.scene}</p>
                  <p className="mt-1 text-sm text-fg-muted"><span className="text-fg-faint">Légende : </span>{x.caption}</p>
                </ResultCard>
              ))}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {lastInput && (
                  <button type="button" onClick={() => run(lastInput)} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-2 text-sm text-fg-muted transition-colors hover:border-accent/40 hover:text-fg">
                    <RefreshCw className="h-4 w-4" /> Régénérer
                  </button>
                )}
              </div>
              {inApp ? (
                <p className="rounded-ctl border border-accent/20 bg-accent-deep/20 p-4 text-sm text-fg-muted">Copie ce qui te plaît, puis demande à l'éditeur IA de l'utiliser dans ta boutique (ex. « renomme la boutique en … »).</p>
              ) : (
                <div className="rounded-ctl border border-accent/20 bg-accent-deep/20 p-4 text-sm text-fg-muted">
                  Envie de la boutique entière, pas seulement d'un texte ? <ButtonLink href="/inscription" variant="ghost" size="sm" className="ml-1 text-accent">Créer ma boutique →</ButtonLink>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
