"use client";

import { ArrowLeft, Check, Download, ExternalLink, Lock, Package, Palette, Store as StoreIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useApp } from "@/components/app/AppContext";
import { useStore } from "@/components/app/StoreContext";
import { normalizeShop, ShopifyBag } from "@/components/auth/AuthForms";
import { API_MODE } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import { shopifyLinks } from "@/lib/shopify-links";
import { site } from "@/lib/site";

const HANDLE_KEY = "vigenia-shop-handle";

// Mise en ligne sans app Shopify : le marchand télécharge 2 fichiers et les importe dans son admin Shopify.
// 1. Le produit (fichier CSV) → Produits → Importer. 2. Le thème (.zip, photos comprises) → Thèmes → Importer.
export default function InstallPage() {
  const { store } = useStore();
  const { user } = useApp();
  const paid = user.plan !== "free";
  const [shop, setShop] = useState("");
  const [saved, setSaved] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const doneKey = `vigenia-install-${store.id}`;

  useEffect(() => {
    try {
      setSaved(localStorage.getItem(HANDLE_KEY));
      setDone(JSON.parse(localStorage.getItem(doneKey) ?? "[]"));
    } catch { /* stockage indisponible */ }
  }, [doneKey]);

  const domain = saved ? `${saved}.myshopify.com` : null;
  const links = shopifyLinks(domain ? `https://${domain}` : null);
  const admin = links?.admin ?? "https://admin.shopify.com";
  const live = API_MODE === "live";

  function saveShop(e: React.FormEvent) {
    e.preventDefault();
    const d = normalizeShop(shop);
    if (!d) return;
    const handle = d.replace(/\.myshopify\.com$/, "");
    try { localStorage.setItem(HANDLE_KEY, handle); } catch { /* stockage indisponible */ }
    setSaved(handle);
  }
  const toggle = (id: string) => setDone((d) => {
    const next = d.includes(id) ? d.filter((x) => x !== id) : [...d, id];
    try { localStorage.setItem(doneKey, JSON.stringify(next)); } catch { /* stockage indisponible */ }
    return next;
  });

  const steps = [
    {
      id: "products", icon: Package, title: "Ajoute ton produit",
      text: <>Télécharge le fichier, puis dans Shopify : <b className="text-fg">Produits</b> → <b className="text-fg">Importer</b> → choisis le fichier → <b className="text-fg">Importer les produits</b>.</>,
      file: `/api/stores/${store.id}/download/products`, fileLabel: "Télécharger le produit",
      open: `${admin}/products`, openLabel: "Ouvrir mes produits Shopify",
    },
    {
      id: "theme", icon: Palette, title: "Installe ton design",
      text: <>Télécharge le thème, puis dans Shopify : <b className="text-fg">Thèmes</b> → <b className="text-fg">Ajouter un thème</b> → <b className="text-fg">Importer un fichier zip</b> → choisis le fichier (sans le décompresser). Ensuite, sur le thème importé : <b className="text-fg">Publier</b>.</>,
      file: `/api/stores/${store.id}/download/theme`, fileLabel: "Télécharger le thème",
      open: links?.themes ?? `${admin}/themes`, openLabel: "Ouvrir mes thèmes Shopify",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl p-5 sm:p-8">
      <Link href={`/app/boutiques/${store.id}`} className="inline-flex items-center gap-2 text-sm text-fg-muted hover:text-fg"><ArrowLeft className="h-4 w-4" /> {store.name}</Link>
      <h1 className="mt-4 text-[clamp(1.7rem,1.3rem+1.5vw,2.3rem)] font-semibold tracking-[-0.03em]">Mettre ta boutique en ligne sur Shopify</h1>
      <p className="mt-2 text-fg-muted">2 fichiers à importer dans ton Shopify, environ 2 minutes. Fais-le sur un ordinateur, c'est plus simple.</p>

      {!paid && (
        <div className="mt-6 flex flex-col gap-3 rounded-card border border-accent/30 bg-accent-deep/25 p-5 sm:flex-row sm:items-center">
          <Lock className="h-5 w-5 shrink-0 text-accent" />
          <p className="flex-1 text-sm text-fg-muted">Choisis ton offre pour télécharger ta boutique et la mettre en ligne.</p>
          <Link href="/app/abonnement" className="inline-flex h-10 items-center justify-center rounded-ctl bg-accent px-4 text-sm font-medium text-[#03140d]">Voir les offres</Link>
        </div>
      )}

      {/* Adresse de la boutique : sert seulement à ouvrir directement les bonnes pages de l'admin Shopify. */}
      <section className="mt-6 rounded-card border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        <p className="flex items-center gap-2 text-sm font-medium"><ShopifyBag className="h-5 w-5" /> Ta boutique Shopify</p>
        {saved ? (
          <p className="mt-2 text-sm text-fg-muted"><span className="text-fg">{domain}</span> · <button type="button" onClick={() => { setSaved(null); setShop(saved); }} className="underline underline-offset-4 hover:text-fg">changer</button></p>
        ) : (
          <form onSubmit={saveShop} className="mt-3 flex flex-col gap-2 sm:flex-row">
            <div className="flex flex-1 items-center rounded-ctl border border-line/15 bg-white/[0.03] focus-within:border-accent">
              <input value={shop} onChange={(e) => setShop(e.target.value)} placeholder="ma-boutique" autoComplete="off" spellCheck={false} className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[15px] focus:outline-none" aria-label="Adresse de ta boutique Shopify" />
              <span className="pr-3 text-sm text-fg-faint">.myshopify.com</span>
            </div>
            <button type="submit" className="h-11 rounded-ctl border border-white/15 px-4 text-sm hover:bg-white/5">Enregistrer</button>
          </form>
        )}
        <p className="mt-2 text-xs text-fg-faint">Pas encore de compte Shopify ? <a href={site.shopifySignupUrl} target="_blank" rel="noreferrer sponsored" className="underline underline-offset-4 hover:text-fg">Crée-le ici</a> ({site.shopifyOffer}), puis reviens sur cette page.</p>
      </section>

      <ol className="mt-6 space-y-4">
        {steps.map((s, i) => {
          const ok = done.includes(s.id);
          return (
            <li key={s.id} className={cn("rounded-card border p-5", ok ? "border-accent/30 bg-accent-deep/15" : "border-white/10 bg-white/[0.03]")}>
              <div className="flex items-start gap-3">
                <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold", ok ? "bg-accent text-[#03140d]" : "bg-accent/15 text-accent")}>{ok ? <Check className="h-4 w-4" /> : i + 1}</span>
                <div className="min-w-0 flex-1">
                  <h2 className="flex items-center gap-2 text-lg font-medium tracking-tight"><s.icon className="h-4 w-4 text-fg-muted" /> {s.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-fg-muted">{s.text}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {paid && live ? (
                      <a href={s.file} download className="inline-flex h-10 items-center gap-2 rounded-ctl bg-[linear-gradient(180deg,#10b07f,#00876a)] px-4 text-sm font-medium text-white"><Download className="h-4 w-4" /> {s.fileLabel}</a>
                    ) : (
                      <span className="inline-flex h-10 items-center gap-2 rounded-ctl border border-white/10 px-4 text-sm text-fg-faint"><Lock className="h-4 w-4" /> {s.fileLabel}</span>
                    )}
                    <a href={s.open} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-ctl border border-white/15 px-4 text-sm text-fg hover:bg-white/5">{s.openLabel} <ExternalLink className="h-4 w-4" /></a>
                    <button type="button" onClick={() => toggle(s.id)} aria-pressed={ok} className="inline-flex h-10 items-center gap-2 rounded-ctl px-3 text-sm text-fg-muted hover:text-fg"><Check className="h-4 w-4" /> {ok ? "Fait" : "C'est fait"}</button>
                  </div>
                  {s.id === "theme" && (
                    <video src="/videos/tuto-theme.mp4" poster="/videos/tuto-theme.jpg" controls muted loop playsInline preload="none"
                      className="mt-4 aspect-video w-full rounded-[14px] border border-white/10 bg-black" aria-label="Vidéo : importer et publier ton thème Vigenia" />
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <section className="mt-6 rounded-card border border-[#95bf47]/30 bg-[#95bf47]/[0.06] p-5">
        <p className="flex items-center gap-2 font-medium"><StoreIcon className="h-4 w-4 text-[#b5d96b]" /> Avant d'ouvrir la vente, dans Shopify</p>
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
