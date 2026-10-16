"use client";

import { ExternalLink, History, MessageSquare, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useApp } from "@/components/app/AppContext";
import { GenerationProgress } from "@/components/app/GenerationProgress";
import { FullscreenButton } from "@/components/app/FullscreenButton";
import { PageHeader } from "@/components/app/PageHeader";
import { PublishButton } from "@/components/app/PublishButton";
import { StorePreview, type PreviewPage } from "@/components/app/StorePreview";
import { useStore } from "@/components/app/StoreContext";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ErrorState, StatusBadge } from "@/components/ui/Feedback";
import { useToast } from "@/components/ui/Toast";
import * as api from "@/lib/api/client";
import { useApi } from "@/lib/api/hooks";
import { cn } from "@/lib/cn";
import { timeAgo } from "@/lib/format";

const PAGES: { id: PreviewPage; label: string }[] = [
  { id: "accueil", label: "Accueil" },
  { id: "produit", label: "Fiche produit" },
];

export default function StoreDashboard() {
  const { store, activeJob, lastError, setStore, reload } = useStore();
  const { setStores } = useApp();
  const router = useRouter();
  const toast = useToast();
  const [page, setPage] = useState<PreviewPage>("accueil");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
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

  const plan = store.plan;

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
        subtitle={<span className="flex flex-wrap items-center gap-3"><StatusBadge status={store.status} /> <span>{store.language}</span> {store.liveUrl && <a href={store.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-fg">Voir la boutique <ExternalLink className="h-3 w-3" /></a>}</span>}
        actions={<><ButtonLink href={`/app/boutiques/${store.id}/editeur`} variant="secondary"><MessageSquare className="h-4 w-4" /> Modifier avec l'IA</ButtonLink><PublishButton /></>}
      />
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
          <section className="surface rounded-card p-5">
            <h2 className="text-sm text-fg-muted">Stratégie</h2>
            <p className="mt-3 text-[15px] leading-snug">{plan.strategy.promise}</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div><dt className="text-fg-faint">Marché</dt><dd className="mt-0.5 text-fg-muted">{plan.strategy.market}</dd></div>
              <div><dt className="text-fg-faint">Offres</dt><dd className="mt-0.5 text-fg-muted">{plan.strategy.offers.join(" · ")}</dd></div>
              <div><dt className="text-fg-faint">Ton</dt><dd className="mt-0.5 text-fg-muted">{plan.brand.tone}</dd></div>
            </dl>
            <div className="mt-4 flex gap-1.5">
              {Object.values(store.theme.colors).map((c) => <span key={c} title={c} className="h-6 w-6 rounded-full border border-white/15" style={{ background: c }} />)}
            </div>
          </section>

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
