"use client";

import { Check, Download, ExternalLink, Palette } from "lucide-react";
import { useEffect, useState } from "react";
import { API_MODE } from "@/lib/api/client";
import type { Store } from "@/lib/api/types";
import { shopifyLinks } from "@/lib/shopify-links";

// Shopify n'autorise pas Vigenia à installer le thème tout seul : le marchand l'importe lui-même en 3 étapes (vidéo tuto à l'appui).
const doneKey = (store: Store) => `vitrio-theme-imported-${store.id}-${store.updatedAt}`;

// Le marchand a confirmé l'import du thème depuis la dernière publication.
export function useThemeImported(store: Store) {
  const [done, setDone] = useState(true);
  useEffect(() => { try { setDone(localStorage.getItem(doneKey(store)) === "1"); } catch { setDone(false); } }, [store]);
  const mark = () => { try { localStorage.setItem(doneKey(store), "1"); } catch { /* stockage indisponible */ } setDone(true); };
  return [done, mark] as const;
}

export function ThemeImportCard({ store, compact = false, onDone }: { store: Store; compact?: boolean; onDone?: () => void }) {
  const links = shopifyLinks(store.liveUrl);
  const download = API_MODE === "live" ? `/api/stores/${store.id}/theme` : undefined;
  const steps = [
    { title: "Télécharge ton thème", text: "Un fichier .zip avec ton design, tes couleurs et tes photos.", action: download && <a href={download} download className="inline-flex h-10 items-center gap-2 rounded-ctl border border-accent/40 bg-[linear-gradient(180deg,#10b07f,#00876a)] px-4 text-sm font-medium text-white"><Download className="h-4 w-4" /> Télécharger le thème</a> },
    { title: "Importe-le dans Shopify", text: "Thèmes → « Ajouter un thème » → « Importer un fichier zip » → choisis le fichier .zip, sans le décompresser → « Importer ».", action: links && <a href={links.themes} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-ctl border border-white/15 px-4 text-sm text-fg hover:bg-white/5">Ouvrir mes thèmes Shopify <ExternalLink className="h-4 w-4" /></a> },
    { title: "Publie-le", text: "Sur le thème « Vigenia » importé : « … » → « Publier » → confirme. Ta boutique prend son nouveau design tout de suite.", action: onDone && <button type="button" onClick={onDone} className="inline-flex h-10 items-center gap-2 rounded-ctl border border-white/15 px-4 text-sm text-fg hover:bg-white/5"><Check className="h-4 w-4" /> C'est fait</button> },
  ];
  const video = (
    <video src="/videos/tuto-theme.mp4" poster="/videos/tuto-theme.jpg" controls autoPlay muted loop playsInline preload="metadata"
      className="aspect-video w-full rounded-[14px] border border-white/10 bg-black" aria-label="Vidéo : installer ton thème Vigenia en 3 étapes" />
  );
  if (compact) {
    return (
      <div className="mt-6 text-left">
      {video}
      <ol className="mt-4 space-y-3">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-3 rounded-[14px] border border-white/10 bg-white/[0.04] p-3.5">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-xs font-semibold text-[#062b22]">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{s.title}</p>
              <p className="mt-0.5 text-sm text-fg-muted">{s.text}</p>
              {s.action && <div className="mt-2.5">{s.action}</div>}
            </div>
          </li>
        ))}
      </ol>
      </div>
    );
  }
  return (
    <section className="mx-5 mt-5 rounded-card border border-accent/30 bg-accent-deep/25 p-5 sm:mx-8 sm:p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-accent/15 text-accent"><Palette className="h-5 w-5" /></span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Dernière étape · très importante</p>
          <h2 className="text-lg font-medium tracking-tight">Installe ton design Vigenia (2 minutes)</h2>
          <p className="text-sm text-fg-muted">Ton produit est déjà dans Shopify. Sans cette étape, ta boutique garde le design Shopify de base. Regarde la vidéo, puis suis les 3 étapes.</p>
        </div>
      </div>
      <div className="mt-5 max-w-3xl">{video}</div>
      <ol className="mt-5 grid gap-3 md:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="flex flex-col gap-3 rounded-[14px] border border-white/10 bg-white/[0.03] p-4">
            <p className="flex items-center gap-2 font-medium"><span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-xs font-semibold text-[#062b22]">{i + 1}</span>{s.title}</p>
            <p className="text-sm text-fg-muted">{s.text}</p>
            {s.action && <div className="mt-auto">{s.action}</div>}
          </li>
        ))}
      </ol>
    </section>
  );
}
