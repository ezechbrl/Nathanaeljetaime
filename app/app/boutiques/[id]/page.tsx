"use client";

import { AlertTriangle, ExternalLink, History, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useApp } from "@/components/app/AppContext";
import { GenerationProgress } from "@/components/app/GenerationProgress";
import { FullscreenButton } from "@/components/app/FullscreenButton";
import { PageHeader } from "@/components/app/PageHeader";
import { PublishButton } from "@/components/app/PublishButton";
import { StoreCoach } from "@/components/app/StoreCoach";
import { ThemeImportCard, useThemeImported } from "@/components/app/ThemeImportCard";
import { StorePreview, type PreviewPage } from "@/components/app/StorePreview";
import { useStore } from "@/components/app/StoreContext";
import { Button } from "@/components/ui/Button";
import { ErrorState, StatusBadge } from "@/components/ui/Feedback";
import { useToast } from "@/components/ui/Toast";
import * as api from "@/lib/api/client";
import { useApi } from "@/lib/api/hooks";
import { cn } from "@/lib/cn";
import { shopifyLinks } from "@/lib/shopify-links";
import { timeAgo } from "@/lib/format";

const PAGES: { id: PreviewPage; label: string }[] = [
  { id: "accueil", label: "Accueil" },
  { id: "produit", label: "Fiche produit" },
];

export default function StoreDashboard() {
  const { store, activeJob, lastError, lastPublishError, setStore, reload } = useStore();
  const { setStores } = useApp();
  const router = useRouter();
  const toast = useToast();
  const [page, setPage] = useState<PreviewPage>("accueil");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const links = shopifyLinks(store.liveUrl);
  const [themeImported, markThemeImported] = useThemeImported(store);
  const versions = useApi(() => api.listVersions(store.id), [store.id, store.updatedAt]);
  const assets = useApi(() => api.listAssets(store.id), [store.id, store.status, store.updatedAt]); // rechargé quand la génération se termine

  if (store.status === "generating") return <GenerationProgress store={store} job={activeJob} />;
  if (store.status === "failed" || !store.plan) {
    const restart = async () => {
      await api.deleteStore(store.id).catch(() => {});
      setStores((list) => list.filter((s) => s.id !== store.id));
      router.push("/app");
    };
    return <div className="p-8"><ErrorState message={`La génération a échoué. Elle n'est pas décomptée de ton offre : relance-la depuis l'accueil.${lastError ? ` (Détail : ${lastError})` : ""}`} onRetry={restart} /></div>;
  }

  async function restore(versionId: string) {
    const res = await api.restoreVersion(store.id, versionId);
    setStore(res.store);
    toast("Version restaurée");
  }

  async function remove() {
    await api.deleteStore(store.id);
    setStores((s) => s.filter((x) => x.id !== store.id));
    router.push("/app/boutiques");
  }

  return (
    <>
      <PageHeader
        title={store.name}
        subtitle={<span className="flex flex-wrap items-center gap-3"><StatusBadge status={store.status} /> <span>{store.language}</span></span>}
        actions={<>
          {links && <a href={links.storefront} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-ctl border border-accent/40 bg-accent-deep/40 px-4 text-sm font-medium text-fg transition-colors hover:bg-accent-deep/70"><ExternalLink className="h-4 w-4" /> Voir ma boutique</a>}
          <PublishButton />
        </>}
      />
      {lastPublishError && !activeJob && (
        <div role="alert" className="mx-5 mt-5 flex items-start gap-3 rounded-card border border-bad/30 bg-bad/10 p-4 text-sm sm:mx-8">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-bad" />
          <div>
            <p className="font-medium text-fg">La dernière mise à jour sur Shopify n'est pas allée au bout.</p>
            <p className="mt-1 text-fg-muted">Raison : {lastPublishError}</p>
            <p className="mt-1 text-fg-faint">Ton produit est bien dans Shopify. Clique sur « Mettre à jour sur Shopify » pour réessayer.</p>
          </div>
        </div>
      )}
      {store.themeStatus === "manual" && store.status === "published" && !activeJob && !themeImported && <ThemeImportCard store={store} onDone={markThemeImported} />}
      <div className="grid gap-6 p-5 sm:p-8 xl:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          <div className="flex gap-1 overflow-x-auto">
            {PAGES.map((p) => (
              <button key={p.id} onClick={() => setPage(p.id)} aria-pressed={page === p.id} className={cn("shrink-0 rounded-t-ctl border-x border-t px-4 py-2 text-[13px] transition-colors", page === p.id ? "border-white/10 bg-white/[0.04] text-fg" : "border-transparent text-fg-muted hover:text-fg")}>{p.label}</button>
            ))}
            <FullscreenButton target={previewRef} />
          </div>
          <div ref={previewRef} className="preview-fs max-h-[720px] overflow-y-auto rounded-b-card rounded-tr-card border border-white/10">
            <StorePreview store={store} page={page} assets={assets.data?.assets} />
          </div>
        </div>

        <aside className="space-y-4">
          <StoreCoach store={store} assets={assets.data?.assets} />
          <section className="surface rounded-card p-5">
            <h2 className="flex items-center gap-2 text-sm text-fg-muted"><History className="h-4 w-4" /> Versions</h2>
            <ul className="mt-3 max-h-56 space-y-1 overflow-y-auto">
              {versions.data?.versions.map((v, i) => (
                <li key={v.id} className="group flex items-center justify-between gap-2 rounded-ctl px-2 py-1.5 text-sm hover:bg-white/[0.03]">
                  <span className="min-w-0"><span className="block truncate">{v.label}</span><span className="text-xs text-fg-faint">{timeAgo(v.createdAt)}</span></span>
                  {i === 0 ? <span className="text-xs text-accent">Actuelle</span> : (
                    <button onClick={() => restore(v.id)} className="flex items-center gap-1 text-xs text-fg-faint opacity-0 transition-opacity hover:text-fg group-hover:opacity-100 focus:opacity-100"><RotateCcw className="h-3 w-3" /> Restaurer</button>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-card border border-white/[0.07] p-5">
            {confirmDelete ? (
              <div className="text-sm">
                <p>Supprimer {store.name} de ton espace ? Rien n'est supprimé sur Shopify.</p>
                <div className="mt-3 flex gap-2"><Button size="sm" variant="danger" onClick={remove}>Supprimer</Button><Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>Annuler</Button></div>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-2 text-sm text-fg-faint hover:text-bad"><Trash2 className="h-4 w-4" /> Supprimer la boutique</button>
            )}
          </section>
          <Link href={`/app/boutiques/${store.id}/pilotage`} className="block text-sm text-fg-muted hover:text-fg">Voir les statistiques →</Link>
        </aside>
      </div>
    </>
  );
}
