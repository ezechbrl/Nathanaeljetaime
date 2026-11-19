"use client";

import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { StorePreview, type PreviewPage } from "@/components/app/StorePreview";
import * as api from "@/lib/api/client";
import { cn } from "@/lib/cn";

type Data = Awaited<ReturnType<typeof api.getOwnerStore>>;
const PAGES: [PreviewPage, string][] = [["accueil", "Accueil"], ["produit", "Produit"], ["faq", "FAQ"], ["a-propos", "À propos"]];
const when = (iso: string) => new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });

// Boutique d'un client, vue par le fondateur (support) : aperçu fidèle + créations réussies ou en erreur.
export default function OwnerStorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState<PreviewPage>("accueil");
  const [device, setDevice] = useState<"desktop" | "mobile">("mobile");
  useEffect(() => { api.getOwnerStore(id).then(setData, (e) => setError((e as Error).message)); }, [id]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 text-[#111]">
      <Link href="/ventes" className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white"><ArrowLeft className="h-4 w-4" /> Ventes</Link>
      {error && <p className="mt-6 rounded-xl bg-white p-4 text-sm text-red-600">{error}</p>}
      {!data && !error && <p className="mt-6 text-sm text-white/70">Chargement…</p>}
      {data && (
        <>
          <div className="mt-4 rounded-2xl bg-white p-4">
            <h1 className="text-xl font-semibold">{data.store.name}</h1>
            <p className="mt-1 text-sm text-[#666]">{data.email} · créée le {when(data.store.createdAt)} · {data.assets.length} images</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {data.jobs.map((j, i) => (
                <li key={i} className="flex items-start gap-2">
                  {j.status === "succeeded" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0a8f5f]" /> : j.status === "failed" ? <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" /> : <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-amber-400" />}
                  <span>{j.kind === "teaser" ? "Aperçu" : "Création complète"} · {when(j.created_at)} · {j.status === "succeeded" ? "réussie" : j.status === "failed" ? "échec" : "en cours"}{j.error && <span className="block text-red-600">{j.error}</span>}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {PAGES.map(([p, l]) => <button key={p} type="button" onClick={() => setPage(p)} className={cn("rounded-full px-3 py-1.5 text-sm", page === p ? "bg-white text-[#111]" : "bg-white/10 text-white")}>{l}</button>)}
            <span className="mx-1 h-5 w-px bg-white/20" />
            {(["mobile", "desktop"] as const).map((d) => <button key={d} type="button" onClick={() => setDevice(d)} className={cn("rounded-full px-3 py-1.5 text-sm", device === d ? "bg-white text-[#111]" : "bg-white/10 text-white")}>{d === "mobile" ? "Téléphone" : "Ordinateur"}</button>)}
          </div>
          <div className={cn("mx-auto mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white", device === "mobile" ? "max-w-[400px]" : "")}>
            {data.store.plan ? <StorePreview store={data.store} page={page} device={device} assets={data.assets} /> : <p className="p-6 text-sm text-[#666]">Boutique pas encore créée (aperçu seulement).</p>}
          </div>
        </>
      )}
    </div>
  );
}
