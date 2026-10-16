"use client";

import { Download, ImagePlus, RefreshCw, Trash2, Upload, Wand2 } from "lucide-react";
import { useRef, useState } from "react";
import { useApp } from "@/components/app/AppContext";
import { PageHeader } from "@/components/app/PageHeader";
import { PhotoShoot } from "@/components/app/PhotoShoot";
import { useStore } from "@/components/app/StoreContext";
import { Button, Spinner } from "@/components/ui/Button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/Feedback";
import { useToast } from "@/components/ui/Toast";
import * as api from "@/lib/api/client";
import { useApi, usePoll } from "@/lib/api/hooks";
import type { Asset, Job } from "@/lib/api/types";
import { cn } from "@/lib/cn";

const KINDS: { id: Asset["kind"]; label: string }[] = [
  { id: "lifestyle", label: "Mise en scène" }, { id: "product", label: "Packshot" }, { id: "banner", label: "Bannière" },
];
const RATIOS = ["1:1", "4:5", "16:9"] as const;
const FILTERS = [{ id: "all", label: "Tout" }, { id: "product", label: "Produit" }, { id: "lifestyle", label: "Ambiance" }, { id: "banner", label: "Bannières" }, { id: "upload", label: "Importées" }] as const;

export default function StudioPage() {
  const { store } = useStore();
  const { refresh } = useApp();
  const toast = useToast();
  const assets = useApi(() => api.listAssets(store.id), [store.id]);
  const [prompt, setPrompt] = useState("");
  const [kind, setKind] = useState<Asset["kind"]>("lifestyle");
  const [ratio, setRatio] = useState<(typeof RATIOS)[number]>("4:5");
  const [job, setJob] = useState<Job | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [uploading, setUploading] = useState(false);
  const [regen, setRegen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  usePoll(async () => {
    if (!job) return;
    const { job: j } = await api.getJob(job.id);
    if (j.status === "succeeded" || j.status === "failed") {
      setJob(null);
      if (j.status === "failed") toast(j.error ?? "La génération a échoué.", "error");
      else toast(regen ? "Nouvelles photos prêtes. Republie la boutique pour les envoyer dans Shopify." : "Image générée");
      setRegen(false);
      assets.reload();
      refresh();
    } else setJob(j);
  }, 1500, !!job);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    if (prompt.trim().length < 5) return;
    try {
      const res = await api.generateAsset(store.id, { prompt: prompt.trim(), kind, aspectRatio: ratio });
      setJob(res.job);
    } catch (err) {
      toast((err as Error).message, "error");
    }
  }

  async function regenerate() {
    if (!window.confirm("Refaire toutes les photos générées de la boutique ? Tes photos importées sont gardées.")) return;
    try {
      const res = await api.regenerateImages(store.id);
      setRegen(true);
      setJob(res.job);
    } catch (err) {
      toast((err as Error).message, "error");
    }
  }

  async function upload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type) || file.size > 10 * 1024 * 1024) return toast("Image PNG, JPG ou WebP de 10 Mo maximum.", "error");
    setUploading(true);
    try {
      await api.uploadAsset(store.id, file);
      assets.reload();
      toast("Image importée");
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function remove(id: string) {
    assets.setData((d) => d && { assets: d.assets.filter((a) => a.id !== id) });
    await api.deleteAsset(id).catch(() => assets.reload());
  }

  const list = (assets.data?.assets ?? []).filter((a) => filter === "all" || a.kind === filter);

  return (
    <>
      <PageHeader title="Studio et bibliothèque" subtitle="Génère des visuels dans le style de ta marque, ou importe les tiens." actions={
        <>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => upload(e.target.files)} />
          <Button variant="secondary" onClick={() => fileRef.current?.click()} disabled={uploading}>{uploading ? <Spinner /> : <Upload className="h-4 w-4" />} Importer</Button>
        </>
      } />
      <div className="space-y-8 p-5 sm:p-8">
        {job && regen && <PhotoShoot store={store} />}
        <section className="surface flex flex-col gap-4 rounded-card p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Photos de la boutique</p>
            <p className="mt-1 text-sm text-fg-muted">Le produit seul, toujours le même, sur différents fonds : studio noir, décor, gros plan… Sans personnes.</p>
          </div>
          <Button variant="secondary" onClick={regenerate} disabled={!!job}>{job && regen ? <><Spinner /> {job.progress} %</> : <><RefreshCw className="h-4 w-4" /> Refaire les photos</>}</Button>
        </section>

        <form onSubmit={generate} className="surface rounded-card p-5">
          <label htmlFor="prompt" className="text-sm text-fg-muted">Décris l'image</label>
          <div className="mt-2 flex flex-col gap-3 lg:flex-row">
            <input id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={`Ex. : ${store.plan?.product.title ?? "le produit"} posé sur du lin, lumière douce du matin`} className="field flex-1" />
            <Button type="submit" disabled={!!job || prompt.trim().length < 5}>{job ? <><Spinner /> {job.progress} %</> : <><Wand2 className="h-4 w-4" /> Générer</>}</Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-6 text-sm">
            <fieldset className="flex items-center gap-2">
              <legend className="sr-only">Type</legend>
              {KINDS.map((k) => (
                <button type="button" key={k.id} onClick={() => setKind(k.id)} aria-pressed={kind === k.id} className={cn("rounded-full border px-3 py-1 text-[13px]", kind === k.id ? "border-accent/40 bg-accent-deep/40 text-fg" : "border-white/[0.08] text-fg-muted hover:text-fg")}>{k.label}</button>
              ))}
            </fieldset>
            <fieldset className="flex items-center gap-2">
              <legend className="sr-only">Format</legend>
              {RATIOS.map((r) => (
                <button type="button" key={r} onClick={() => setRatio(r)} aria-pressed={ratio === r} className={cn("rounded-full border px-3 py-1 font-mono text-xs", ratio === r ? "border-accent/40 text-fg" : "border-white/[0.08] text-fg-muted hover:text-fg")}>{r}</button>
              ))}
            </fieldset>
          </div>
        </form>

        <div>
          <div className="flex flex-wrap gap-1">
            {FILTERS.map((f) => (
              <button key={f.id} onClick={() => setFilter(f.id)} aria-pressed={filter === f.id} className={cn("rounded-ctl px-3 py-1.5 text-[13px]", filter === f.id ? "bg-white/[0.07] text-fg" : "text-fg-muted hover:text-fg")}>{f.label}</button>
            ))}
          </div>
          <div className="mt-4">
            {assets.error ? <ErrorState message={assets.error.message} onRetry={assets.reload} /> : assets.loading && !assets.data ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="aspect-square" />)}</div>
            ) : list.length === 0 ? (
              <EmptyState icon={ImagePlus} title="Aucune image ici" text="Génère une image ou importe tes photos produit." />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {job && <div className="grid aspect-square place-items-center rounded-card border border-accent/30 bg-accent-deep/20"><Spinner className="text-accent" /></div>}
                {list.map((a) => (
                  <figure key={a.id} className="group relative aspect-square overflow-hidden rounded-card border border-white/[0.07]">
                    <img src={a.url} alt={a.prompt ?? "Visuel de la boutique"} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                    <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent p-2.5 pt-8 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                      <span className="truncate text-[11px] text-white/80">{a.prompt ?? KINDS.find((k) => k.id === a.kind)?.label ?? "Importée"}</span>
                      <span className="flex gap-1">
                        <a href={a.url} download aria-label="Télécharger" className="grid h-7 w-7 place-items-center rounded-[6px] bg-black/50 text-white hover:bg-black/70"><Download className="h-3.5 w-3.5" /></a>
                        <button onClick={() => remove(a.id)} aria-label="Supprimer" className="grid h-7 w-7 place-items-center rounded-[6px] bg-black/50 text-white hover:bg-bad/80"><Trash2 className="h-3.5 w-3.5" /></button>
                      </span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
