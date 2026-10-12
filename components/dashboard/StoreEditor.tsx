"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { MockStore } from "@/lib/mock";

type Message = { role: "user" | "assistant"; text: string };
type Tab = "accueil" | "produit" | "faq";

const SUGGESTIONS = ["Rends le ton plus premium", "Change la couleur principale", "Ajoute un bundle -20 %", "Raccourcis le titre"];

const ACCENTS = ["#d9576f", "#2f5bea", "#6aa84f", "#c08a4a", "#7c5cff"];

export function StoreEditor({ store }: { store: MockStore }) {
  const [tab, setTab] = useState<Tab>("accueil");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [accent, setAccent] = useState(store.colors.accent);
  const [heroTitle, setHeroTitle] = useState(`${store.niche} : la qualité que tu mérites`);
  const [bundle, setBundle] = useState(false);
  const [published, setPublished] = useState(store.status === "publiée");
  const [thinking, setThinking] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: `Ta boutique ${store.name} est prête. Dis-moi ce que tu veux modifier : textes, couleurs, offres, sections…` },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, thinking]);

  // Réponses simulées : seront remplacées par l'appel à l'IA côté serveur.
  function applyEdit(text: string): string {
    const t = text.toLowerCase();
    if (t.includes("couleur")) {
      const next = ACCENTS[(ACCENTS.indexOf(accent) + 1) % ACCENTS.length];
      setAccent(next);
      return `C'est fait : nouvelle couleur principale ${next}. Elle s'applique aux boutons et aux accents.`;
    }
    if (t.includes("bundle") || t.includes("offre")) {
      setBundle(true);
      setTab("produit");
      return "J'ai ajouté un bundle « Lot de 3 à −20 % » sur la fiche produit, juste au-dessus du bouton d'achat.";
    }
    if (t.includes("premium")) {
      setHeroTitle(`L'art du ${store.niche.toLowerCase()}, réinventé`);
      return "J'ai réécrit le titre d'accueil avec un ton plus premium et épuré.";
    }
    if (t.includes("titre") || t.includes("court")) {
      setHeroTitle(store.name);
      return "Titre raccourci au nom de la marque, plus mémorable.";
    }
    return "Bien noté. Dans la version complète, j'appliquerai ce changement directement à ta boutique.";
  }

  function send(text: string) {
    if (!text.trim() || thinking) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setDraft("");
    setThinking(true);
    setTimeout(() => {
      const reply = applyEdit(text);
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
      setThinking(false);
    }, 900);
  }

  const { primary, background } = store.colors;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col lg:h-screen">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-black/50 hover:text-black">← Boutiques</Link>
          <span className="font-semibold">{store.name}</span>
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${published ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
            {published ? "publiée" : "brouillon"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden rounded-full bg-black/5 p-1 text-xs sm:flex">
            {(["desktop", "mobile"] as const).map((d) => (
              <button key={d} onClick={() => setDevice(d)} className={`rounded-full px-3 py-1 ${device === d ? "bg-white shadow-sm" : "text-black/50"}`}>
                {d === "desktop" ? "🖥 Ordinateur" : "📱 Mobile"}
              </button>
            ))}
          </div>
          <button onClick={() => setPublished(true)} className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-black/80">
            {published ? "Republier" : "Publier sur Shopify"}
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <section className="flex max-h-[45vh] w-full flex-col border-b border-black/5 lg:max-h-none lg:w-96 lg:border-b-0 lg:border-r">
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <p
                key={i}
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${m.role === "user" ? "ml-auto rounded-br-sm bg-ink text-white" : "rounded-bl-sm bg-black/[0.04]"}`}
              >
                {m.text}
              </p>
            ))}
            {thinking && <p className="w-fit rounded-2xl bg-black/[0.04] px-3.5 py-2.5 text-sm text-black/50">L'IA modifie ta boutique…</p>}
            <div ref={endRef} />
          </div>
          <div className="border-t border-black/5 p-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-full border border-black/10 px-2.5 py-1 text-xs text-black/60 hover:border-brand hover:text-brand">
                  {s}
                </button>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); send(draft); }} className="flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Demande une modification…"
                className="flex-1 rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/30"
              />
              <button className="rounded-xl bg-brand px-4 text-sm font-semibold text-white disabled:opacity-50" disabled={thinking}>↑</button>
            </form>
          </div>
        </section>

        <section className="flex min-h-0 flex-1 flex-col bg-black/[0.03]">
          <div className="flex gap-1 px-4 pt-3 text-sm">
            {(["accueil", "produit", "faq"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`rounded-t-xl px-4 py-2 capitalize ${tab === t ? "bg-white font-semibold" : "text-black/50"}`}>
                {t === "faq" ? "FAQ" : t}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4 pt-0">
            <div
              className={`mx-auto overflow-hidden rounded-b-2xl rounded-tr-2xl shadow-sm transition-all ${device === "mobile" ? "max-w-sm" : "max-w-4xl"}`}
              style={{ background, color: primary }}
            >
              <div className="flex items-center justify-between border-b border-black/5 px-6 py-4 text-sm">
                <span className="text-lg font-bold">{store.name}</span>
                <span className="flex gap-4 opacity-60"><span>Boutique</span><span>À propos</span><span>Panier (0)</span></span>
              </div>

              {tab === "accueil" && (
                <>
                  <div className="px-6 py-16 text-center">
                    <h2 className="mx-auto max-w-2xl text-3xl font-bold sm:text-4xl">{heroTitle}</h2>
                    <p className="mx-auto mt-4 max-w-lg opacity-70">Des produits pensés pour toi, livrés en 48 h, satisfait ou remboursé 30 jours.</p>
                    <span className="mt-8 inline-block rounded-full px-6 py-3 text-sm font-semibold text-white" style={{ background: accent }}>
                      Découvrir la collection
                    </span>
                  </div>
                  <div className="grid gap-4 px-6 pb-12 sm:grid-cols-3">
                    {["Ingrédients naturels", "Livraison offerte dès 39 €", "Satisfait ou remboursé"].map((b) => (
                      <div key={b} className="rounded-2xl bg-black/[0.04] p-4 text-sm font-medium">{b}</div>
                    ))}
                  </div>
                </>
              )}

              {tab === "produit" && (
                <div className="grid gap-8 p-6 sm:grid-cols-2">
                  <div className="aspect-square rounded-2xl" style={{ background: `linear-gradient(135deg, ${accent}33, ${accent}99)` }} />
                  <div>
                    <h2 className="text-2xl font-bold">{store.niche} — édition signature</h2>
                    <p className="mt-2 text-xl font-semibold">24,90 € <s className="text-base font-normal opacity-40">32,00 €</s></p>
                    <ul className="mt-4 list-disc space-y-1 pl-5 text-sm opacity-80">
                      <li>Formule testée et approuvée</li>
                      <li>Fabriqué en France</li>
                      <li>Expédié sous 24 h</li>
                    </ul>
                    {bundle && (
                      <div className="mt-4 rounded-2xl border-2 p-3 text-sm" style={{ borderColor: accent }}>
                        <p className="font-semibold">Lot de 3 — économise 20 %</p>
                        <p className="opacity-60">59,76 € au lieu de 74,70 €</p>
                      </div>
                    )}
                    <span className="mt-6 block rounded-full py-3 text-center text-sm font-semibold text-white" style={{ background: accent }}>
                      Ajouter au panier
                    </span>
                  </div>
                </div>
              )}

              {tab === "faq" && (
                <div className="space-y-4 p-6 text-sm">
                  {["Quels sont les délais de livraison ?", "Puis-je retourner mon produit ?", "Le produit convient-il aux peaux sensibles ?"].map((q) => (
                    <div key={q} className="rounded-2xl bg-black/[0.04] p-4"><p className="font-semibold">{q}</p><p className="mt-1 opacity-70">Réponse générée par l'IA à partir de ta stratégie.</p></div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
