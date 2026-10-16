"use client";

import { Download, ExternalLink, Palette } from "lucide-react";
import { API_MODE } from "@/lib/api/client";
import type { Store } from "@/lib/api/types";
import { shopifyLinks } from "@/lib/shopify-links";

// Shopify n'autorise pas encore Vitrio à installer le thème tout seul : le marchand l'importe en 3 clics.
export function ThemeImportCard({ store }: { store: Store }) {
  const links = shopifyLinks(store.liveUrl);
  const download = API_MODE === "live" ? `/api/stores/${store.id}/theme` : undefined;
  const steps = [
    { title: "Télécharge ton thème", text: "Un fichier .zip avec ton design, tes couleurs et tes photos.", action: download && <a href={download} download className="inline-flex h-10 items-center gap-2 rounded-ctl border border-accent/40 bg-[linear-gradient(180deg,#10b07f,#00876a)] px-4 text-sm font-medium text-white"><Download className="h-4 w-4" /> Télécharger le thème</a> },
    { title: "Importe-le dans Shopify", text: "Thèmes → bouton « Importer » (ou « … » → Importer) → choisis le fichier .zip, sans le décompresser.", action: links && <a href={links.themes} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-ctl border border-white/15 px-4 text-sm text-fg hover:bg-white/5">Ouvrir mes thèmes Shopify <ExternalLink className="h-4 w-4" /></a> },
    { title: "Publie-le", text: "Sur le thème « Vitrio » importé : « … » → Publier. Ta boutique prend son nouveau look tout de suite." },
  ];
  return (
    <section className="mx-5 mt-5 rounded-card border border-accent/30 bg-accent-deep/25 p-5 sm:mx-8 sm:p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-accent/15 text-accent"><Palette className="h-5 w-5" /></span>
        <div>
          <h2 className="text-lg font-medium tracking-tight">Dernière étape : installe ton thème en 3 clics</h2>
          <p className="text-sm text-fg-muted">Ton produit est dans Shopify. Il reste à mettre le design Vitrio sur ta boutique.</p>
        </div>
      </div>
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
