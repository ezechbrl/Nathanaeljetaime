"use client";

import { ArrowLeft, ArrowRight, Check, ExternalLink, Lock, PartyPopper, Play, Store } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useApp } from "@/components/app/AppContext";
import { useStore } from "@/components/app/StoreContext";
import { normalizeShop, ShopifyBag } from "@/components/auth/AuthForms";
import { API_MODE } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import { shopifyLinks } from "@/lib/shopify-links";
import * as api from "@/lib/api/client";

// Mise en ligne sans app Shopify : la boutique du client est connue depuis l'inscription.
// 1. un clic = le produit se télécharge + Shopify s'ouvre au bon endroit, 2. pareil pour le design.
// Chaque étape dit exactement sur quel bouton cliquer dans Shopify.
export default function InstallPage() {
  const { store } = useStore();
  const { user, refresh } = useApp();
  const paid = user.plan !== "free";
  const live = API_MODE === "live";
  const [editShop, setEditShop] = useState(false);
  const [done, setDone] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const doneKey = `vigenia-install-${store.id}`;

  useEffect(() => {
    try {
      setDone(JSON.parse(localStorage.getItem(doneKey) ?? "[]"));
    } catch { /* stockage indisponible */ }
    setReady(true);
  }, [doneKey]);

  const domain = user.shopDomain ?? null;
  const links = shopifyLinks(domain ? `https://${domain}` : null);
  const admin = links?.admin ?? "https://admin.shopify.com";

  const markDone = (id: string, value = true) => setDone((d) => {
    const next = value ? [...new Set([...d, id])] : d.filter((x) => x !== id);
    try { localStorage.setItem(doneKey, JSON.stringify(next)); } catch { /* stockage indisponible */ }
    return next;
  });

  async function saveShop(shopDomain: string) {
    await api.updateMe({ shopDomain });
    await refresh();
    setEditShop(false);
  }

  // Un seul clic : le fichier se télécharge et Shopify s'ouvre dans un nouvel onglet, à la bonne page.
  function sendTo(file: string, open: string) {
    const a = document.createElement("a");
    a.href = file;
    a.download = "";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.open(open, "_blank", "noopener");
  }

  const steps = [
    {
      id: "products",
      title: "Ajoute ton produit",
      button: "Envoyer mon produit dans Shopify",
      file: `/api/stores/${store.id}/download/products`,
      open: `${admin}/products`,
      how: ["Clique sur « Importer » (en haut à droite)", "Choisis le fichier qui vient de se télécharger, et coche la case qui remplace les produits ayant la même ancre (utile si tu l'avais déjà importé)", "Clique sur « Importer les produits »"],
    },
    {
      id: "theme",
      title: "Installe ton design",
      button: "Envoyer mon design dans Shopify",
      file: `/api/stores/${store.id}/download/theme`,
      open: links?.themes ?? `${admin}/themes`,
      how: ["Clique sur « Ajouter un thème » → « Importer un fichier zip »", "Choisis le fichier qui vient de se télécharger", "Sur ton nouveau thème, clique sur « Publier »"],
    },
  ];
  const current = steps.find((s) => !done.includes(s.id))?.id ?? "finished";
  const position = current === "products" ? 0 : current === "theme" ? 1 : 2;

  return (
    <div className="mx-auto max-w-3xl p-5 sm:p-8">
      <Link href={`/app/boutiques/${store.id}`} className="inline-flex items-center gap-2 text-sm text-fg-muted hover:text-fg"><ArrowLeft className="h-4 w-4" /> {store.name}</Link>
      <h1 className="mt-4 text-[clamp(1.8rem,1.3rem+1.8vw,2.5rem)] font-semibold tracking-[-0.03em]">Mets ta boutique en ligne</h1>
      <p className="mt-2 text-fg-muted">2 étapes, environ 2 minutes. On te dit exactement où cliquer. Fais-le sur un ordinateur.</p>

      {/* Avancement */}
      <div className="mt-6 flex items-center gap-2" aria-label={`Étape ${Math.min(position + 1, 2)} sur 2`}>
        {[0, 1].map((i) => (
          <span key={i} className={cn("h-2 flex-1 rounded-full transition-colors", i < position ? "bg-accent" : i === position ? "bg-accent/50" : "bg-white/10")} />
        ))}
      </div>

      {!paid && (
        <div className="mt-6 flex flex-col gap-3 rounded-card border border-accent/30 bg-accent-deep/25 p-5 sm:flex-row sm:items-center">
          <Lock className="h-5 w-5 shrink-0 text-accent" />
          <p className="flex-1 text-sm text-fg-muted">Choisis ton offre pour envoyer ta boutique dans Shopify.</p>
          <Link href="/app/abonnement" className="inline-flex h-11 items-center justify-center rounded-ctl bg-accent px-5 text-sm font-semibold text-[#03140d]">Voir les offres</Link>
        </div>
      )}

      {/* Boutique Shopify du client (saisie à l'inscription) : les boutons ouvrent directement son admin. */}
      {ready && (
        <div className="mt-6 rounded-card border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
          {domain && !editShop ? (
            <p className="flex flex-wrap items-center gap-2 text-fg-muted"><ShopifyBag className="h-5 w-5" /> Ta boutique : <span className="text-fg">{domain}</span> · <button type="button" onClick={() => setEditShop(true)} className="underline underline-offset-4 hover:text-fg">changer</button></p>
          ) : (
            <ShopInput initial={domain} onSave={saveShop} onCancel={domain ? () => setEditShop(false) : undefined} />
          )}
        </div>
      )}

      <ol className="mt-4 space-y-4">
        {steps.map((s, i) => {
          const ok = done.includes(s.id);
          const active = current === s.id;
          return (
            <li key={s.id} className={cn("rounded-card border p-5 sm:p-6 transition-opacity", active ? "border-accent/40 bg-white/[0.04]" : ok ? "border-accent/20 bg-accent-deep/10" : "border-white/10 bg-white/[0.02] opacity-60")}>
              <StepTitle n={i + 1} ok={ok} title={s.title} />
              {ok && !active ? (
                <p className="mt-2 pl-12 text-sm text-fg-muted">Fait. <button type="button" onClick={() => markDone(s.id, false)} className="underline underline-offset-4 hover:text-fg">Refaire cette étape</button></p>
              ) : active ? (
                <div className="mt-4 sm:pl-12">
                  {paid && live ? (
                    <button type="button" onClick={() => sendTo(s.file, s.open)} className="group flex w-full items-center justify-center gap-3 rounded-[16px] bg-[linear-gradient(180deg,#34f0b0,#0fae7c)] px-5 py-4 text-base font-semibold text-[#03140d] shadow-[inset_0_1px_0_rgb(255_255_255/0.45),0_10px_30px_-8px_rgb(46_230_166/0.7)] transition-transform hover:-translate-y-0.5 sm:text-lg">
                      <ShopifyBag className="h-7 w-7" /> {s.button} <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </button>
                  ) : (
                    <span className="flex w-full items-center justify-center gap-3 rounded-[16px] border border-white/10 px-5 py-4 text-base text-fg-faint"><Lock className="h-5 w-5" /> {s.button}</span>
                  )}
                  <p className="mt-3 text-center text-xs text-fg-faint">Le fichier se télécharge et Shopify s'ouvre au bon endroit.</p>

                  <p className="mt-5 text-sm font-medium">Puis dans Shopify :</p>
                  <ol className="mt-2 space-y-2">
                    {s.how.map((h, k) => (
                      <li key={h} className="flex items-center gap-3 rounded-ctl border border-white/[0.08] bg-black/20 px-3 py-2.5 text-sm">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/15 text-xs font-semibold text-accent">{k + 1}</span>
                        <span className="text-fg">{h}</span>
                      </li>
                    ))}
                  </ol>

                  {s.id === "theme" && (
                    <details className="group mt-3">
                      <summary className="inline-flex cursor-pointer list-none items-center gap-2 text-sm text-fg-muted hover:text-fg"><Play className="h-4 w-4" /> Voir comment faire en vidéo</summary>
                      <video src="/videos/tuto-theme.mp4" poster="/videos/tuto-theme.jpg" controls muted loop playsInline preload="none"
                        className="mt-3 aspect-video w-full rounded-[14px] border border-white/10 bg-black" aria-label="Vidéo : importer et publier ton design" />
                    </details>
                  )}

                  <button type="button" onClick={() => markDone(s.id)} className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-ctl border border-white/15 text-sm font-medium hover:bg-white/5 sm:w-auto sm:px-5">
                    <Check className="h-4 w-4" /> C'est fait, étape suivante
                  </button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      {current === "finished" && (
        <section className="mt-6 rounded-card border border-accent/40 bg-accent-deep/25 p-6 text-center">
          <PartyPopper className="mx-auto h-8 w-8 text-accent" />
          <h2 className="mt-3 text-xl font-semibold">Ta boutique est dans ton Shopify</h2>
          {domain && (
            <a href={`https://${domain}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex h-11 items-center gap-2 rounded-ctl bg-accent px-5 text-sm font-semibold text-[#03140d]">Voir ma boutique <ExternalLink className="h-4 w-4" /></a>
          )}
        </section>
      )}

      <section className="mt-6 rounded-card border border-[#95bf47]/30 bg-[#95bf47]/[0.06] p-5">
        <p className="flex items-center gap-2 font-medium"><Store className="h-4 w-4 text-[#b5d96b]" /> Avant d'ouvrir la vente, dans Shopify</p>
        <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          {[
            ["Activer les paiements", links?.payments ?? `${admin}/settings/payments`],
            ["Régler la livraison", links?.shipping ?? `${admin}/settings/shipping`],
            ["Ajouter les pages légales (CGV, retours)", links?.policies ?? `${admin}/settings/legal`],
            ["Retirer le mot de passe de la boutique", links?.password ?? `${admin}/online_store/preferences`],
          ].map(([label, href]) => (
            <li key={label}><a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-fg-muted hover:text-[#b5d96b]">{label} <ExternalLink className="h-3.5 w-3.5 opacity-60" /></a></li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function StepTitle({ n, ok, title }: { n: number; ok: boolean; title: string }) {
  return (
    <h2 className="flex items-center gap-3 text-lg font-semibold tracking-tight sm:text-xl">
      <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold", ok ? "bg-accent text-[#03140d]" : "bg-accent/15 text-accent")}>{ok ? <Check className="h-4 w-4" /> : n}</span>
      {title}
    </h2>
  );
}

// Adresse de la boutique (si elle manque, ou pour la changer).
function ShopInput({ initial, onSave, onCancel }: { initial: string | null; onSave: (domain: string) => Promise<void>; onCancel?: () => void }) {
  const [shop, setShop] = useState(initial?.replace(/\.myshopify\.com$/, "") ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const d = normalizeShop(shop);
    if (!d) return setError("Tape l'adresse de ta boutique, par exemple ma-boutique");
    setSaving(true);
    try { await onSave(d); } catch (err) { setError((err as Error).message); } finally { setSaving(false); }
  }

  return (
    <form onSubmit={submit}>
      <label htmlFor="shop-handle" className="flex items-center gap-2 font-medium"><ShopifyBag className="h-5 w-5" /> L'adresse de ta boutique Shopify</label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <div className="flex flex-1 items-center rounded-ctl border border-line/15 bg-white/[0.03] focus-within:border-accent">
          <input id="shop-handle" value={shop} onChange={(e) => { setShop(e.target.value); setError(""); }} placeholder="ma-boutique" autoComplete="off" spellCheck={false} className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[15px] focus:outline-none" />
          <span className="pr-3 text-sm text-fg-faint">.myshopify.com</span>
        </div>
        <button type="submit" disabled={saving} className="inline-flex h-11 items-center justify-center gap-2 rounded-ctl bg-accent px-5 text-sm font-semibold text-[#03140d]">Enregistrer</button>
        {onCancel && <button type="button" onClick={onCancel} className="h-11 px-3 text-sm text-fg-muted hover:text-fg">Annuler</button>}
      </div>
      {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : <p className="mt-2 text-xs text-fg-faint">Tu peux aussi coller le lien de ton admin Shopify (admin.shopify.com/store/…).</p>}
    </form>
  );
}
