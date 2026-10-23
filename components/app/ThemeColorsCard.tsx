"use client";

import { Palette } from "lucide-react";
import type { Store } from "@/lib/api/types";
import * as api from "@/lib/api/client";
import { useApi } from "@/lib/api/hooks";

// Lien direct vers l'éditeur de thème Shopify avec l'intégration « Couleurs de marque » prête à activer.
export function ThemeColorsCard({ store }: { store: Store }) {
  const conns = useApi(() => api.listConnections(), []);
  const apiKey = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY;
  const conn = conns.data?.connections.find((c) => c.id === store.shopConnectionId) ?? conns.data?.connections[0];
  if (store.status !== "published" || !conn) return null;
  const href = apiKey
    ? `https://${conn.shopDomain}/admin/themes/current/editor?context=apps&activateAppId=${apiKey}/brand`
    : `https://${conn.shopDomain}/admin/themes/current/editor?context=apps`;

  return (
    <section className="surface-accent rounded-card p-5">
      <h2 className="flex items-center gap-2 text-sm text-fg"><Palette className="h-4 w-4 text-accent" /> Couleurs et polices de {store.name} dans ton thème</h2>
      <p className="mt-2 text-sm leading-relaxed text-fg-muted">L'extension « Couleurs de marque » de Vigenia applique tes couleurs et polices à n'importe quel thème Shopify, sans modifier ses fichiers.</p>
      <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-fg-muted">
        <li>Clique sur « Activer dans Shopify » : l'éditeur de thème s'ouvre sur les intégrations d'applications.</li>
        <li>Active « Couleurs de marque ».</li>
        <li>Clique sur « Enregistrer » en haut à droite. Pour l'enlever, désactive-la et enregistre.</li>
      </ol>
      <a href={href} target="_blank" rel="noreferrer" className="mt-4 inline-flex h-9 items-center rounded-ctl bg-accent-strong px-3.5 text-sm text-white hover:brightness-110">Activer dans Shopify</a>
    </section>
  );
}
