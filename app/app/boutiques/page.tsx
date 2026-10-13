"use client";

import { Plus, Store as StoreIcon } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/components/app/AppContext";
import { PageHeader } from "@/components/app/PageHeader";
import { StoreCard } from "@/components/app/StoreCard";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Feedback";
import { cn } from "@/lib/cn";

const FILTERS = [
  { id: "all", label: "Toutes" },
  { id: "published", label: "En ligne" },
  { id: "ready", label: "À publier" },
  { id: "generating", label: "En génération" },
] as const;

export default function StoresPage() {
  const { stores } = useApp();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [q, setQ] = useState("");
  const shown = stores.filter((s) => (filter === "all" || s.status === filter) && s.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader title="Mes boutiques" subtitle={`${stores.length} boutique${stores.length > 1 ? "s" : ""}`} actions={<ButtonLink href="/app"><Plus className="h-4 w-4" /> Nouvelle boutique</ButtonLink>}>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex gap-1 rounded-ctl border border-white/[0.07] p-1">
            {FILTERS.map((f) => (
              <button key={f.id} onClick={() => setFilter(f.id)} aria-pressed={filter === f.id} className={cn("rounded-[7px] px-3 py-1 text-[13px] transition-colors", filter === f.id ? "bg-white/[0.08] text-fg" : "text-fg-muted hover:text-fg")}>{f.label}</button>
            ))}
          </div>
          <label className="sr-only" htmlFor="q">Rechercher</label>
          <input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…" className="field h-9 max-w-[220px] py-1.5 text-sm" />
        </div>
      </PageHeader>
      <div className="p-5 sm:p-8">
        {shown.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{shown.map((s) => <StoreCard key={s.id} store={s} />)}</div>
        ) : (
          <EmptyState icon={StoreIcon} title={stores.length ? "Aucune boutique ne correspond" : "Pas encore de boutique"} text={stores.length ? "Change de filtre ou de recherche." : "Décris ton produit : l'IA construit ta première boutique en quelques minutes."} action={!stores.length && <ButtonLink href="/app">Créer ma première boutique</ButtonLink>} />
        )}
      </div>
    </>
  );
}
