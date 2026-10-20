"use client";

import { ArrowRight, ArrowUp, Gift, HelpCircle, Monitor, Palette, Smartphone, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/components/app/AppContext";
import { FullscreenButton } from "@/components/app/FullscreenButton";
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

const SUGGESTIONS = ["Ajoute un lot de 3 à −20 %", "Raccourcis le titre produit", "Ajoute une question à la FAQ", "Rends le ton plus premium", "Change la couleur principale"];
// Grandes cartes de départ, quand la discussion ne fait que commencer.
const STARTERS = [
  { icon: Sparkles, text: "Rends le ton plus premium" },
  { icon: Palette, text: "Change la couleur principale" },
  { icon: Gift, text: "Ajoute une offre 2 achetés = 1 offert" },
  { icon: HelpCircle, text: "Réécris la FAQ" },
];
const PAGES: { id: PreviewPage; label: string }[] = [
  { id: "accueil", label: "Accueil" }, { id: "produit", label: "Produit" },
];

function pageFor(path: string): PreviewPage | null {
  if (path.startsWith("product") || path.startsWith("strategy.offers")) return "produit";
  if (path.startsWith("faq")) return "accueil";
  if (path.startsWith("aboutPage")) return "accueil";
  if (path.startsWith("homepage") || path.startsWith("theme")) return "accueil";
  return null;
}

export default function EditorPage() {
  const { store, setStore, activeJob } = useStore();
  const { refresh, usage, user } = useApp();
  const [upsell, setUpsell] = useState<string | null>(null);
  const weekLeft = Math.max(0, usage.aiBudget.limitEur - usage.aiBudget.spentEur);
  const sessionLeft = Math.max(0, usage.aiBudget.session.limitEur - usage.aiBudget.session.spentEur);
  const lowCredit = !usage.aiBudget.blockedUntil && !usage.aiBudget.session.blockedUntil && (sessionLeft <= usage.aiBudget.session.limitEur * 0.2 || weekLeft <= usage.aiBudget.limitEur * 0.2);
  const toast = useToast();
  const history = useApi(() => api.listMessages(store.id), [store.id]);
  const assets = useApi(() => api.listAssets(store.id), [store.id, store.status, store.updatedAt]); // rechargé quand la génération se termine
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  // Demande préparée depuis le tableau de bord (« Idées pour vendre plus ») : on la pré-remplit.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setDraft(q);
  }, []);
  const [sending, setSending] = useState(false);
  const started = messages.some((m) => m.role === "user");
  const [page, setPage] = useState<PreviewPage>("accueil");
  const [device, setDevice] = useState<"auto" | "mobile">("auto");
  const [flash, setFlash] = useState(false);
  // Sur téléphone : une seule vue à la fois (discussion ou aperçu), en plein écran.
  const [view, setView] = useState<"chat" | "preview">("chat");
  const previewRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (history.data) setMessages(history.data.messages); }, [history.data]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, sending]);
  // Le champ s'agrandit avec le texte (2 à 8 lignes).
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 216)}px`;
  }, [draft]);

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
      const limit = e instanceof ApiClientError && ["quota_exceeded", "ai_session_blocked", "ai_budget_blocked", "subscription_required"].includes(e.code);
      if (limit) setUpsell(e.code === "quota_exceeded" ? "Tu as utilisé tous tes messages à l'IA ce mois-ci." : (e as Error).message);
      else toast((e as Error).message, "error");
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

      <div className="flex border-b border-white/[0.06] lg:hidden" role="tablist" aria-label="Vue">
        {([["chat", "Discussion"], ["preview", "Aperçu"]] as const).map(([v, label]) => (
          <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)} className={cn("relative flex-1 py-2.5 text-sm transition-colors", view === v ? "font-medium text-white" : "text-fg-muted")}>
            {label}
            {v === "preview" && flash && <span className="absolute right-[30%] top-2 h-2 w-2 rounded-full bg-accent" />}
            {view === v && <span className="absolute inset-x-6 bottom-0 h-0.5 rounded-full bg-accent" />}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <section aria-label="Conversation avec l'IA" className={cn("min-h-0 w-full flex-1 flex-col lg:flex lg:w-[52%] lg:min-w-[560px] lg:flex-none lg:border-r lg:border-white/[0.06]", view === "chat" ? "flex" : "hidden")}>
          <div className="flex items-center gap-3 border-b border-white/[0.06] bg-black/15 px-5 py-3.5">
            <LogoMark className="h-10 w-10 shrink-0" />
            <div className="leading-tight">
              <p className="text-[15.5px] font-semibold">Assistant IA Vitrio</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-fg-muted">
                <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" /><span className="relative h-2 w-2 rounded-full bg-accent" /></span>
                En ligne · modifie ta boutique en direct
              </p>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6" aria-live="polite">
            <div className="mx-auto max-w-[760px] space-y-6">
              {messages.map((m) => (
                <div key={m.id} className={cn("flex items-end gap-3", m.role === "user" && "flex-row-reverse")}>
                  {m.role === "assistant"
                    ? <LogoMark className="mb-1 h-9 w-9 shrink-0" />
                    : <span className="mb-1 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent-deep text-[14px] font-semibold text-accent">{user.firstName.charAt(0).toUpperCase() || "M"}</span>}
                  <div className={cn(
                    "max-w-[82%] px-4 py-3 text-[16px] leading-relaxed",
                    m.role === "user"
                      ? "rounded-[20px] rounded-br-[6px] bg-[linear-gradient(180deg,#1fd197,#0fa877)] text-[#03140d] shadow-[0_8px_24px_-12px_rgb(46_230_166/0.7)]"
                      : "rounded-[20px] rounded-bl-[6px] border border-accent/20 bg-white/[0.04] text-fg/90 backdrop-blur",
                  )}>
                    {m.content}
                    {m.changes.length > 0 && (
                      <div className="mt-3 space-y-2.5 rounded-[14px] border border-accent/25 bg-accent-deep/25 p-3.5">
                        {m.changes.map((c) => (
                          <div key={c.path} className="text-[13px]">
                            <p className="font-medium text-accent">{c.label}</p>
                            <p className="mt-1 flex flex-wrap items-center gap-1.5">
                              <span className="text-fg-faint line-through">{c.before.startsWith("#") ? <Swatch c={c.before} /> : c.before}</span>
                              <ArrowRight className="h-3.5 w-3.5 text-fg-faint" />
                              <span className="text-fg">{c.after.startsWith("#") ? <Swatch c={c.after} /> : c.after}</span>
                            </p>
                          </div>
                        ))}
                        <button type="button" onClick={() => setView("preview")} className="mt-1 inline-flex items-center gap-1 text-[13px] font-medium text-accent lg:hidden">Voir dans l'aperçu <ArrowRight className="h-3.5 w-3.5" /></button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {!started && !sending && (
                <div className="grid grid-cols-2 gap-2 pt-2 sm:gap-3">
                  {STARTERS.map(({ icon: I, text }) => (
                    <button key={text} type="button" onClick={() => send(text)} className="group flex items-center gap-2.5 rounded-[14px] border border-white/10 bg-white/[0.03] p-2.5 text-left text-[13px] leading-snug transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:bg-accent/[0.06] sm:gap-3 sm:rounded-[18px] sm:p-4 sm:text-[15px]">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] border border-accent/30 bg-accent/10 text-accent transition-transform group-hover:scale-105 sm:h-10 sm:w-10 sm:rounded-[12px]"><I className="h-4 w-4 sm:h-5 sm:w-5" /></span>
                      {text}
                    </button>
                  ))}
                </div>
              )}

              {sending && (
                <div className="flex items-end gap-3" role="status">
                  <LogoMark className="mb-1 h-9 w-9 shrink-0 animate-pulse" />
                  <div className="flex items-center gap-2 rounded-[20px] rounded-bl-[6px] border border-accent/20 bg-white/[0.04] px-4 py-3.5 text-[14px] text-fg-muted">
                    <span className="flex gap-1" aria-hidden>
                      {[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-accent" style={{ animationDelay: `${i * 0.15}s` }} />)}
                    </span>
                    L'IA écrit…
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          </div>

          <div className="border-t border-white/[0.06] bg-black/15 px-4 pb-4 pt-3 sm:px-6">
            <div className="mx-auto max-w-[760px]">
              {upsell && (
                <div role="status" className="mb-3 rounded-[14px] border border-accent/30 bg-accent-deep/30 px-4 py-3 text-[13px] leading-relaxed text-fg-muted">
                  <p>{upsell}</p>
                  {user.plan === "free" && (
                    <Link href="/app/abonnement?plan=pro" className="mt-2 inline-flex items-center gap-1 rounded-ctl bg-accent-strong px-3 py-1.5 text-[13px] font-medium text-white hover:brightness-110">
                      Choisir mon offre <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              )}
              {lowCredit && !upsell && (
                <p role="status" className="mb-3 rounded-[14px] border border-warn/30 bg-warn/5 px-4 py-2.5 text-[13px] text-fg-muted">
                  Ton crédit d'IA est presque épuisé (environ {Math.max(1, Math.floor(Math.min(weekLeft, sessionLeft) / 0.07))} messages restants).
                  {sessionLeft <= weekLeft && usage.aiBudget.session.resetsAt ? " Il se recharge bientôt." : ""}
                  {user.plan === "pro" && <> <Link href="/app/abonnement" className="text-accent underline underline-offset-2">Passe à l'offre Pro</Link> pour 2× plus de crédit.</>}
                </p>
              )}
              {/* Les suggestions n'apparaissent qu'une fois : en grandes cartes au départ, puis en petites pastilles. */}
              {started && <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} disabled={sending} className="shrink-0 rounded-full border border-white/[0.1] bg-white/[0.02] px-3.5 py-1.5 text-[13.5px] text-fg-muted transition-colors hover:border-accent/40 hover:text-fg disabled:opacity-50">{s}</button>
                ))}
              </div>}
              <div className="glow-frame rounded-[23px] p-[1.5px]"><form onSubmit={(e) => { e.preventDefault(); send(draft); }} className="flex items-end gap-2 rounded-[22px] bg-[linear-gradient(180deg,#0d3a2d,#062419)] p-2.5">
                <label htmlFor="msg" className="sr-only">Ta demande</label>
                <textarea
                  ref={inputRef}
                  id="msg"
                  rows={2}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(draft); } }}
                  placeholder="Demande une modification à l'IA… (ex. « mets un ton plus premium »)"
                  className="max-h-[216px] min-h-[60px] flex-1 resize-none bg-transparent px-3 py-2 text-[16px] leading-6 placeholder:text-fg-faint focus:outline-none"
                />
                <button type="submit" disabled={sending || !draft.trim()} aria-label="Envoyer" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[linear-gradient(180deg,#34f0b0,#0fae7c)] text-[#03140d] shadow-[0_0_20px_rgb(46_230_166/0.55)] transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"><ArrowUp className="h-5 w-5" /></button>
              </form></div>
              <p className="mt-2 hidden text-center text-[12px] text-fg-faint sm:block">Entrée pour envoyer · Maj+Entrée pour aller à la ligne</p>
            </div>
          </div>
        </section>

        <section aria-label="Aperçu de la boutique" className={cn("min-h-0 flex-1 flex-col bg-bg-2 lg:flex", view === "preview" ? "flex" : "hidden")}>
          <div className="flex gap-1 overflow-x-auto px-4 pt-3">
            {PAGES.map((p) => (
              <button key={p.id} onClick={() => setPage(p.id)} aria-pressed={page === p.id} className={cn("shrink-0 rounded-t-ctl px-4 py-2 text-[13px] transition-colors", page === p.id ? "bg-white/[0.06] text-fg" : "text-fg-faint hover:text-fg")}>{p.label}</button>
            ))}
            <FullscreenButton target={previewRef} />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
            <div ref={previewRef} className={cn("preview-fs overflow-hidden rounded-b-card rounded-tr-card ring-1 ring-white/10 transition-shadow duration-700", flash && "shadow-[0_0_0_3px_rgb(0_166_118/0.5)]")}>
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
