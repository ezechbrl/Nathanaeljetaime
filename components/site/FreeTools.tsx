"use client";

import { Copy, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button, ButtonLink, Spinner } from "@/components/ui/Button";
import { runTool } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import { sanitizeHtml } from "@/lib/sanitize";

type ToolId = "product-description" | "store-name" | "slogan" | "faq";

const TOOLS: { id: ToolId; label: string; description: string; fields: { name: string; label: string; placeholder: string; textarea?: boolean }[] }[] = [
  { id: "store-name", label: "Nom de boutique", description: "Des idées de noms courts et mémorables pour ta marque.", fields: [
    { name: "niche", label: "Ce que tu vends", placeholder: "Bougies parfumées artisanales" },
    { name: "vibe", label: "Ambiance", placeholder: "Douce, naturelle, haut de gamme" },
  ] },
  { id: "slogan", label: "Slogan", description: "Une phrase qui résume ta promesse.", fields: [
    { name: "brandName", label: "Nom de la marque", placeholder: "Maison Lune" },
    { name: "niche", label: "Ce que tu vends", placeholder: "Bougies parfumées artisanales" },
  ] },
  { id: "product-description", label: "Description produit", description: "Une description orientée bénéfices, prête à coller dans Shopify.", fields: [
    { name: "productName", label: "Nom du produit", placeholder: "Bougie Figue & Cèdre" },
    { name: "details", label: "Caractéristiques", placeholder: "Cire de soja, 50 h de combustion, mèche en coton", textarea: true },
  ] },
  { id: "faq", label: "FAQ produit", description: "Les questions que tes clients se posent, avec les réponses.", fields: [
    { name: "productName", label: "Nom du produit", placeholder: "Bougie Figue & Cèdre" },
    { name: "details", label: "Caractéristiques", placeholder: "Cire de soja, 50 h de combustion", textarea: true },
  ] },
];

type Result = { names?: string[]; slogans?: string[]; html?: string; items?: { question: string; answer: string }[] };

export function FreeTools() {
  const [toolId, setToolId] = useState<ToolId>("store-name");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const tool = TOOLS.find((t) => t.id === toolId)!;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const { result } = await runTool<Result>(toolId, { ...data, language: "français" });
      setResult(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const copy = (text: string) => navigator.clipboard?.writeText(text).catch(() => {});

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <div role="tablist" aria-label="Outils" className="flex gap-2 overflow-x-auto lg:flex-col">
        {TOOLS.map((t) => (
          <button key={t.id} role="tab" aria-selected={t.id === toolId} onClick={() => { setToolId(t.id); setResult(null); }} className={cn("shrink-0 rounded-card border px-4 py-3 text-left transition-colors", t.id === toolId ? "border-accent/30 bg-accent-deep/25" : "border-black/[0.07] hover:border-black/15")}>
            <span className="block text-[15px]">{t.label}</span>
            <span className="hidden text-xs text-fg-faint lg:block">{t.description}</span>
          </button>
        ))}
      </div>
      <div className="surface rounded-card p-6 sm:p-8">
        <form key={toolId} onSubmit={submit} className="space-y-4">
          {tool.fields.map((f) => (
            <label key={f.name} className="block text-sm">
              {f.label}
              {f.textarea
                ? <textarea name={f.name} required rows={3} placeholder={f.placeholder} className="field mt-1.5 resize-y" />
                : <input name={f.name} required placeholder={f.placeholder} className="field mt-1.5" />}
            </label>
          ))}
          <Button type="submit" disabled={loading}>{loading ? <><Spinner /> Génération…</> : <><Sparkles className="h-4 w-4" /> Générer</>}</Button>
        </form>

        {error && <p role="alert" className="mt-5 text-sm text-bad">{error}</p>}
        {result && (
          <div className="mt-8 border-t border-black/[0.07] pt-6" aria-live="polite">
            {(result.names ?? result.slogans)?.map((x) => (
              <div key={x} className="flex items-center justify-between border-b border-black/[0.05] py-2.5">
                <span className="text-lg tracking-tight">{x}</span>
                <button onClick={() => copy(x)} aria-label={`Copier ${x}`} className="text-fg-faint hover:text-fg"><Copy className="h-4 w-4" /></button>
              </div>
            ))}
            {result.html && <div className="prose-store text-[15px] text-fg-muted" dangerouslySetInnerHTML={{ __html: sanitizeHtml(result.html) }} />}
            {result.items?.map((x) => (
              <div key={x.question} className="border-b border-black/[0.05] py-3"><p>{x.question}</p><p className="mt-1 text-sm text-fg-muted">{x.answer}</p></div>
            ))}
            <div className="mt-6 rounded-ctl border border-accent/20 bg-accent-deep/20 p-4 text-sm text-fg-muted">
              Envie de la boutique entière, pas seulement d'un texte ? <ButtonLink href="/inscription" variant="ghost" size="sm" className="ml-1 text-accent">Créer ma boutique →</ButtonLink>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
