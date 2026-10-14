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
      <h2 className="flex items-center gap-2 text-sm text-fg"><Palette className="h-4 w-4 text-accent" /> Couleurs et polices dans ton thème</h2>
      <p className="mt-2 text-sm leading-relaxed text-fg-muted">
        Un clic dans Shopify pour appliquer les couleurs et polices de {store.name} à ton thème. Rien n'est modifié dans les fichiers du thème : tu peux désactiver quand tu veux.
      </p>
      <a href={href} target="_blank" rel="noreferrer" className="mt-4 inline-flex h-9 items-center rounded-ctl bg-accent-strong px-3.5 text-sm text-white hover:brightness-110">Activer dans Shopify</a>
      <p className="mt-2 text-xs text-fg-faint">Ensuite, clique sur « Enregistrer » dans l'éditeur de thème.</p>
    </section>
  );
}
