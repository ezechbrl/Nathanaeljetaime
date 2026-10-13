"use client";

import { ArrowRight, ArrowUp, Monitor, Smartphone } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/components/app/AppContext";
import { GenerationProgress } from "@/components/app/GenerationProgress";
import { PublishButton } from "@/components/app/PublishButton";
import { StorePreview, type PreviewPage } from "@/components/app/StorePreview";
import { useStore } from "@/components/app/StoreContext";
import { LogoMark } from "@/components/ui/Logo";
import { StatusBadge } from "@/components/ui/Feedback";
import { useToast } from "@/components/ui/Toast";
import * as api from "@/lib/api/client";
import { ApiClientError } from "@/lib/api/errors";
import { useApi } from "@/lib/api/hooks";
import type { ChatMessage } from "@/lib/api/types";
import { cn } from "@/lib/cn";

const SUGGESTIONS = ["Rends le ton plus premium", "Change la couleur principale", "Ajoute un lot de 3 à −20 %", "Raccourcis le titre produit", "Ajoute une question à la FAQ"];
const PAGES: { id: PreviewPage; label: string }[] = [
  { id: "accueil", label: "Accueil" }, { id: "produit", label: "Produit" }, { id: "faq", label: "FAQ" }, { id: "a-propos", label: "À propos" },
];

function pageFor(path: string): PreviewPage | null {
  if (path.startsWith("product") || path.startsWith("strategy.offers")) return "produit";
  if (path.startsWith("faq")) return "faq";
  if (path.startsWith("aboutPage")) return "a-propos";
  if (path.startsWith("homepage") || path.startsWith("theme")) return "accueil";
  return null;
}

export default function EditorPage() {
  const { store, setStore, activeJob } = useStore();
  const { refresh, usage } = useApp();
  const weekLeft = Math.max(0, usage.aiBudget.limitEur - usage.aiBudget.spentEur);
  const sessionLeft = Math.max(0, usage.aiBudget.session.limitEur - usage.aiBudget.session.spentEur);
  const lowCredit = !usage.aiBudget.blockedUntil && !usage.aiBudget.session.blockedUntil && (sessionLeft <= usage.aiBudget.session.limitEur * 0.2 || weekLeft <= usage.aiBudget.limitEur * 0.2);
  const toast = useToast();
  const history = useApi(() => api.listMessages(store.id), [store.id]);
  const assets = useApi(() => api.listAssets(store.id), [store.id]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState<PreviewPage>("accueil");
  const [device, setDevice] = useState<"auto" | "mobile">("auto");
  const [flash, setFlash] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (history.data) setMessages(history.data.messages); }, [history.data]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, sending]);

  if (store.status === "generating") return <GenerationProgress store={store} job={activeJob} />;

  async function send(text: string) {
    const content = text.trim();
    if (!content || sending) return;
    setDraft("");
    setSending(true);
    const optimistic: ChatMessage = { id: `tmp-${Date.now()}`, storeId: store.id, role: "user", content, changes: [], createdAt: new Date().toISOString() };
    setMessages((m) => [...m, optimistic]);
    try {
      const res = await api.sendMessage(store.id, content);
      setMessages((m) => [...m.filter((x) => x.id !== optimistic.id), res.userMessage, res.assistantMessage]);
      setStore(res.store);
      const target = res.assistantMessage.changes.map((c) => pageFor(c.path)).find(Boolean);
      if (target) setPage(target);
      if (res.assistantMessage.changes.length) {
        setFlash(true);
        setTimeout(() => setFlash(false), 900);
      }
      refresh();
    } catch (e) {
      setMessages((m) => m.filter((x) => x.id !== optimistic.id));
      setDraft(content);
      toast(e instanceof ApiClientError && e.code === "quota_exceeded" ? "Limite de messages atteinte. Passe à Pro pour continuer." : (e as Error).message, "error");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col lg:h-dvh">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="truncate text-lg tracking-tight">{store.name}</h1>
          <StatusBadge status={store.status} />
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden rounded-ctl border border-white/[0.07] p-0.5 sm:flex" role="group" aria-label="Taille d'aperçu">
            {([["auto", Monitor, "Ordinateur"], ["mobile", Smartphone, "Mobile"]] as const).map(([d, Icon, label]) => (
              <button key={d} onClick={() => setDevice(d)} aria-pressed={device === d} aria-label={label} className={cn("grid h-8 w-9 place-items-center rounded-[7px]", device === d ? "bg-white/[0.08] text-fg" : "text-fg-faint hover:text-fg")}><Icon className="h-4 w-4" /></button>
            ))}
          </div>
          <PublishButton size="sm" />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <section aria-label="Conversation avec l'IA" className="flex max-h-[48dvh] min-h-0 w-full flex-col border-b border-white/[0.06] lg:max-h-none lg:w-[400px] lg:border-b-0 lg:border-r">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
            {messages.map((m) => (
              <div key={m.id} className={cn("flex gap-2.5", m.role === "user" && "justify-end")}>
                {m.role === "assistant" && <LogoMark className="mt-0.5 h-6 w-6 shrink-0" />}
                <div className={cn("max-w-[85%] text-[14px] leading-relaxed", m.role === "user" ? "rounded-[12px] rounded-br-[4px] bg-white/[0.08] px-3.5 py-2.5" : "text-fg-muted")}>
                  {m.content}
                  {m.changes.length > 0 && (
                    <div className="mt-3 space-y-2 rounded-card border border-accent/20 bg-accent-deep/20 p-3">
                      {m.changes.map((c) => (
                        <div key={c.path} className="text-xs">
                          <p className="text-accent">{c.label}</p>
                          <p className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span className="text-fg-faint line-through">{c.before.startsWith("#") ? <Swatch c={c.before} /> : c.before}</span>
                            <ArrowRight className="h-3 w-3 text-fg-faint" />
                            <span className="text-fg">{c.after.startsWith("#") ? <Swatch c={c.after} /> : c.after}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex items-center gap-2.5 text-sm text-fg-faint">
                <LogoMark className="h-6 w-6 animate-pulse" /> L'IA modifie ta boutique…
              </div>
            )}
            <div ref={endRef} />
          </div>
          <div className="border-t border-white/[0.06] p-3">
            {lowCredit && (
              <p role="status" className="mb-2 rounded-ctl border border-warn/30 bg-warn/5 px-3 py-2 text-xs text-fg-muted">
                Ton crédit d'IA est presque épuisé (environ {Math.max(1, Math.floor(Math.min(weekLeft, sessionLeft) / 0.07))} messages restants).
                {sessionLeft <= weekLeft && usage.aiBudget.session.resetsAt ? " Il se recharge bientôt." : ""}
              </p>
            )}
            <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} disabled={sending} className="shrink-0 rounded-full border border-white/[0.08] px-2.5 py-1 text-xs text-fg-muted transition-colors hover:border-accent/40 hover:text-fg disabled:opacity-50">{s}</button>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); send(draft); }} className="flex items-end gap-2 rounded-card border border-white/10 bg-white/[0.03] p-1.5 focus-within:border-accent/50">
              <label htmlFor="msg" className="sr-only">Ta demande</label>
              <textarea
                id="msg"
                rows={1}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(draft); } }}
                placeholder="Demande une modification…"
                className="max-h-32 min-h-[36px] flex-1 resize-none bg-transparent px-2 py-2 text-sm placeholder:text-fg-faint focus:outline-none"
              />
              <button type="submit" disabled={sending || !draft.trim()} aria-label="Envoyer" className="grid h-9 w-9 shrink-0 place-items-center rounded-ctl bg-accent-strong text-white transition-opacity disabled:opacity-40"><ArrowUp className="h-4 w-4" /></button>
            </form>
          </div>
        </section>

        <section aria-label="Aperçu de la boutique" className="flex min-h-0 flex-1 flex-col bg-bg-2">
          <div className="flex gap-1 overflow-x-auto px-4 pt-3">
            {PAGES.map((p) => (
              <button key={p.id} onClick={() => setPage(p.id)} aria-pressed={page === p.id} className={cn("shrink-0 rounded-t-ctl px-4 py-2 text-[13px] transition-colors", page === p.id ? "bg-white/[0.06] text-fg" : "text-fg-faint hover:text-fg")}>{p.label}</button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
            <div className={cn("overflow-hidden rounded-b-card rounded-tr-card ring-1 ring-white/10 transition-shadow duration-700", flash && "shadow-[0_0_0_3px_rgb(212_245_156/0.7)]")}>
              <StorePreview store={store} page={page} device={device} assets={assets.data?.assets} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Swatch({ c }: { c: string }) {
  return <span className="inline-flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-full border border-white/20" style={{ background: c }} />{c}</span>;
}
