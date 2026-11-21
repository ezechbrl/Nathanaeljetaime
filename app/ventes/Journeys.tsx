"use client";

import { Route } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import * as api from "@/lib/api/client";
import type { Journey } from "@/lib/api/client";
import { cn } from "@/lib/cn";

// D'où vient chaque visiteur : couleur et nom lisible.
const SOURCES: Record<string, { label: string; tone: string }> = {
  tiktok: { label: "TikTok", tone: "bg-[#111] text-white" },
  google: { label: "Google", tone: "bg-[#e0ecff] text-[#1d4ed8]" },
  instagram: { label: "Instagram", tone: "bg-[#ffe4f1] text-[#be185d]" },
  facebook: { label: "Facebook", tone: "bg-[#e0e7ff] text-[#3730a3]" },
  youtube: { label: "YouTube", tone: "bg-[#fee2e2] text-[#b91c1c]" },
  snapchat: { label: "Snapchat", tone: "bg-[#fef9c3] text-[#854d0e]" },
  bing: { label: "Bing", tone: "bg-[#e0f2fe] text-[#0369a1]" },
  x: { label: "X (Twitter)", tone: "bg-[#f1f1f1] text-[#111]" },
  linkedin: { label: "LinkedIn", tone: "bg-[#dbeafe] text-[#1e40af]" },
  direct: { label: "Direct", tone: "bg-[#f1f1f1] text-[#555]" },
};
const sourceOf = (name: string) => SOURCES[name] ?? { label: name, tone: "bg-[#efe7ff] text-[#6d28d9]" };

// Pages du site en mots simples.
function pageName(p: string) {
  if (p === "/") return "Page d'accueil";
  if (p.startsWith("/inscription")) return "Création de compte";
  if (p.startsWith("/connexion")) return "Connexion";
  if (p === "/quiz" || p.startsWith("/app/quiz")) return "Quiz";
  if (/^\/app\/boutiques\/[^/]+\/installer/.test(p)) return "Mise en ligne Shopify";
  if (/^\/app\/boutiques\/[^/]+/.test(p)) return "Sa boutique";
  if (p.startsWith("/app/boutiques")) return "Liste de ses boutiques";
  if (p.startsWith("/app/abonnement")) return "Page abonnement";
  if (p === "/app" || p === "/app/") return "Son tableau de bord";
  if (p.startsWith("/exemples")) return "Exemples";
  if (p.startsWith("/blog")) return "Blog";
  if (p.startsWith("/tarifs")) return "Tarifs";
  return p;
}

const STORE_STATUS: Record<string, { label: string; tone: string }> = {
  generating: { label: "En création", tone: "bg-[#fff1d6] text-[#c2410c]" },
  locked: { label: "Aperçu (pas payé)", tone: "bg-[#f1f1f1] text-[#555]" },
  ready: { label: "Complète", tone: "bg-[#d9f7e8] text-[#0a8f5f]" },
  publishing: { label: "Envoi Shopify…", tone: "bg-[#e0ecff] text-[#1d4ed8]" },
  published: { label: "Sur Shopify", tone: "bg-[#d9f7e8] text-[#0a8f5f]" },
  failed: { label: "Échec", tone: "bg-[#fee8e5] text-[#d72c0d]" },
};

const PARIS = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const when = (iso: string) => PARIS.format(new Date(iso));
function ago(iso: string) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (m < 2) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.round(m / 60);
  if (h < 48) return `il y a ${h} h`;
  return `il y a ${Math.round(h / 24)} j`;
}
const FLAGS: Record<string, string> = { FR: "France", BE: "Belgique", CH: "Suisse", CA: "Canada", LU: "Luxembourg", MA: "Maroc", DZ: "Algérie", TN: "Tunisie", SN: "Sénégal", CI: "Côte d'Ivoire", US: "États-Unis", GB: "Royaume-Uni", DE: "Allemagne", ES: "Espagne", IT: "Italie", NL: "Pays-Bas" };

// Les 7 étapes, en pastilles reliées : vertes jusqu'à l'étape atteinte.
function Steps({ steps, r }: { steps: string[]; r: Journey }) {
  const next = steps[r.reached + 1];
  return (
    <div className="w-full min-w-0 max-w-[320px] pr-1">
      <div className="flex items-center">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 items-center last:flex-none" title={s}>
            <span className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold", r.done[i] ? "bg-[#10b981] text-white" : "border-2 border-[#ddd] bg-white text-[#bbb]", i === r.reached && "ring-4 ring-[#10b981]/25")}>{i + 1}</span>
            {i < steps.length - 1 && <span className={cn("h-0.5 flex-1", r.done[i + 1] ? "bg-[#10b981]" : "bg-[#e5e5e5]")} />}
          </div>
        ))}
      </div>
      <p className="mt-2 text-[13px] font-semibold">{next ? <>Arrêté à : {steps[r.reached]}</> : "Tout fait ✓"}</p>
      {next && <p className="text-xs text-[#8a8a8a]">Prochaine étape : {next}</p>}
      {r.cancelled && <p className="mt-0.5 text-xs font-medium text-[#d72c0d]">A arrêté son abonnement</p>}
    </div>
  );
}

export function Journeys({ wide = false }: { wide?: boolean }) {
  const [data, setData] = useState<{ steps: string[]; rows: Journey[] } | null>(null);
  const [error, setError] = useState("");
  const [all, setAll] = useState(false);
  useEffect(() => { api.getOwnerJourneys().then(setData, (e) => setError((e as Error).message)); }, []);

  const rows = data ? (all ? data.rows : data.rows.slice(0, 10)) : [];
  // Résumés : d'où ils viennent et où ils s'arrêtent (sur les 30 derniers).
  const bySource = new Map<string, number>();
  const byStop = new Map<number, number>();
  data?.rows.forEach((r) => {
    const k = r.source ? r.source.name : "?";
    bySource.set(k, (bySource.get(k) ?? 0) + 1);
    byStop.set(r.reached, (byStop.get(r.reached) ?? 0) + 1);
  });

  return (
    <section className="min-w-0 overflow-hidden rounded-[18px] bg-white text-[#111] shadow-[0_10px_30px_-18px_rgb(0_0_0/0.6)]">
      <div className="p-4 sm:p-5">
        <h2 className="flex items-center gap-2 text-[17px] font-semibold"><span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[#efe7ff] text-[#7c3aed]"><Route className="h-4 w-4" /></span>Parcours des clients</h2>
        <p className="mt-1 text-[13px] text-[#616161]">Pour chaque inscrit : d'où il vient, quand, sa boutique, et l'étape où il s'est arrêté. Heures de Paris.</p>
        {!wide && <Link href="/ventes/parcours" className="mt-2 inline-block rounded-full bg-[#efe7ff] px-3 py-1.5 text-[13px] font-semibold text-[#6d28d9]">Ouvrir en grand tableau (ordinateur) →</Link>}
        {error && <p className="mt-3 text-sm text-[#d72c0d]">{error}</p>}
        {!data && !error && <p className="mt-3 text-sm text-[#8a8a8a]">Chargement…</p>}
        {data && data.rows.length > 0 && (
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <div className="rounded-[14px] bg-[#f7f7f8] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8a8a8a]">D'où ils viennent ({data.rows.length} derniers)</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[...bySource.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => (
                  <span key={k} className={cn("rounded-full px-2.5 py-1 text-[13px] font-semibold", k === "?" ? "bg-white text-[#8a8a8a] ring-1 ring-[#e5e5e5]" : sourceOf(k).tone)}>{k === "?" ? "Inconnu" : sourceOf(k).label} · {n}</span>
                ))}
              </div>
            </div>
            <div className="rounded-[14px] bg-[#f7f7f8] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8a8a8a]">Où ils s'arrêtent</p>
              <div className="mt-2 space-y-1">
                {data.steps.map((s, i) => {
                  const n = byStop.get(i) ?? 0;
                  return (
                    <div key={s} className="flex items-center gap-2 text-[13px]">
                      <span className="w-[150px] shrink-0 truncate">{i + 1}. {s}</span>
                      <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-white"><span className="block h-full rounded-full bg-[#7c3aed]" style={{ width: `${(n / data.rows.length) * 100}%` }} /></span>
                      <span className="w-6 text-right font-semibold tabular-nums">{n}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {data && data.rows.length > 0 && (
        <ul className={cn("divide-y divide-[#eee] border-t border-[#eee]", wide && "lg:hidden")}>
          {rows.map((r) => <JourneyCard key={r.email + r.at} r={r} steps={data.steps} />)}
        </ul>
      )}

      {data && data.rows.length > 0 && wide && (
        <div className="hidden overflow-x-auto border-t border-[#eee] lg:block">
          <table className="w-full min-w-[1060px] text-left text-sm">
            <thead className="bg-[#fafafa] text-xs uppercase tracking-wide text-[#8a8a8a]">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Inscription</th>
                <th className="px-4 py-2.5 font-semibold">Client</th>
                <th className="px-4 py-2.5 font-semibold">Vient de</th>
                <th className="px-4 py-2.5 font-semibold">Sa boutique</th>
                <th className="px-4 py-2.5 font-semibold">Parcours</th>
                <th className="px-4 py-2.5 font-semibold">Dernière visite</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eee]">
              {rows.map((r) => {
                const src = r.source ? sourceOf(r.source.name) : null;
                const st = r.store ? STORE_STATUS[r.store.status] ?? { label: r.store.status, tone: "bg-[#f1f1f1] text-[#555]" } : null;
                return (
                  <tr key={r.email + r.at} className="align-top hover:bg-[#fcfcfc]">
                    <td className="px-4 py-3.5"><span className="block font-semibold">{when(r.at)}</span><span className="text-xs text-[#8a8a8a]">{ago(r.at)}</span></td>
                    <td className="max-w-[220px] px-4 py-3.5"><span className="block truncate font-medium">{r.email}</span></td>
                    <td className="px-4 py-3.5">
                      {r.source && src ? (
                        <>
                          <span className={cn("inline-block rounded-full px-2.5 py-1 text-[13px] font-semibold", src.tone)}>{src.label}</span>
                          <span className="mt-1 block text-xs text-[#616161]">{r.source.device}{r.source.country ? ` · ${FLAGS[r.source.country] ?? r.source.country}` : ""}</span>
                          <span className="block text-xs text-[#8a8a8a]">arrivé sur : {pageName(r.source.entry)}</span>
                          {!r.source.sure && <span className="block text-[11px] text-[#c2410c]">probable (avant le suivi précis)</span>}
                        </>
                      ) : <span className="text-xs text-[#8a8a8a]">Inconnu</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      {r.store && st ? (
                        <Link href={`/ventes/boutique/${r.store.id}`} className="group flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {r.store.image ? <img src={r.store.image} alt="" loading="lazy" className="h-[64px] w-[104px] shrink-0 rounded-[10px] object-cover ring-1 ring-black/5" /> : <span className="grid h-[64px] w-[104px] shrink-0 place-items-center rounded-[10px] bg-[#f1f1f1] text-[11px] text-[#8a8a8a]">pas d'image</span>}
                          <span className="min-w-0">
                            <span className="block max-w-[150px] truncate font-semibold group-hover:underline">{r.store.name}</span>
                            <span className={cn("mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium", st.tone)}>{st.label}</span>
                            <span className="mt-0.5 block text-xs text-[#2563eb]">Voir l'aperçu →{r.store.count > 1 ? ` (${r.store.count} boutiques)` : ""}</span>
                          </span>
                        </Link>
                      ) : <span className="text-xs text-[#8a8a8a]">Aucune boutique</span>}
                    </td>
                    <td className="min-w-[270px] px-4 py-3.5"><Steps steps={data.steps} r={r} /></td>
                    <td className="px-4 py-3.5">
                      {r.lastSeen ? (
                        <><span className="block font-medium">{pageName(r.lastSeen.page)}</span><span className="text-xs text-[#8a8a8a]">{when(r.lastSeen.at)} · {ago(r.lastSeen.at)}</span>{r.visits > 1 && <span className="block text-xs text-[#8a8a8a]">{r.visits} visites</span>}</>
                      ) : <span className="text-xs text-[#8a8a8a]">Pas encore suivie</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {data && data.rows.length > 10 && (
        <div className="border-t border-[#eee] p-3 text-center">
          <button type="button" onClick={() => setAll((v) => !v)} className="rounded-full bg-[#f1f1f1] px-4 py-2 text-sm font-medium hover:bg-[#e8e8e8]">{all ? "Voir moins" : `Voir les ${data.rows.length} derniers inscrits`}</button>
        </div>
      )}
    </section>
  );
}

// Version téléphone : une grande fiche par client, toujours dans le même ordre.
function JourneyCard({ r, steps }: { r: Journey; steps: string[] }) {
  const src = r.source ? sourceOf(r.source.name) : null;
  const st = r.store ? STORE_STATUS[r.store.status] ?? { label: r.store.status, tone: "bg-[#f1f1f1] text-[#555]" } : null;
  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex gap-3 py-1.5"><span className="w-[92px] shrink-0 pt-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#8a8a8a]">{label}</span><div className="min-w-0 flex-1 text-[13px]">{children}</div></div>
  );
  return (
    <li className="px-4 py-4 sm:px-5">
      <div className="flex items-start justify-between gap-3">
        <span className="min-w-0 truncate text-[15px] font-semibold">{r.email}</span>
        <span className="shrink-0 text-right text-xs text-[#616161]"><b className="block text-[13px] text-[#111]">{when(r.at)}</b>{ago(r.at)}</span>
      </div>
      {r.store && st ? (
        <Link href={`/ventes/boutique/${r.store.id}`} className="mt-3 flex items-center gap-3 rounded-[14px] bg-[#f7f7f8] p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {r.store.image ? <img src={r.store.image} alt="" loading="lazy" className="h-[72px] w-[120px] shrink-0 rounded-[10px] object-cover" /> : <span className="grid h-[72px] w-[120px] shrink-0 place-items-center rounded-[10px] bg-white text-[11px] text-[#8a8a8a]">pas d'image</span>}
          <span className="min-w-0">
            <span className="block truncate font-semibold">{r.store.name}</span>
            <span className={cn("mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium", st.tone)}>{st.label}</span>
            <span className="mt-0.5 block text-xs font-medium text-[#2563eb]">Voir l'aperçu →{r.store.count > 1 ? ` (${r.store.count} boutiques)` : ""}</span>
          </span>
        </Link>
      ) : <p className="mt-3 rounded-[14px] bg-[#f7f7f8] p-3 text-[13px] text-[#8a8a8a]">Aucune boutique créée</p>}
      <div className="mt-2">
        <Row label="Vient de">
          {r.source && src ? (
            <>
              <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-[13px] font-semibold", src.tone)}>{src.label}</span>
              <span className="ml-2 text-xs text-[#616161]">{r.source.device}{r.source.country ? ` · ${FLAGS[r.source.country] ?? r.source.country}` : ""}</span>
              <span className="block text-xs text-[#8a8a8a]">arrivé sur : {pageName(r.source.entry)}{!r.source.sure && <span className="text-[#c2410c]"> · probable</span>}</span>
            </>
          ) : <span className="text-[#8a8a8a]">Inconnu</span>}
        </Row>
        <Row label="Parcours"><Steps steps={steps} r={r} /></Row>
        <Row label="Vu en dernier">
          {r.lastSeen ? <><b className="font-medium">{pageName(r.lastSeen.page)}</b><span className="block text-xs text-[#8a8a8a]">{when(r.lastSeen.at)} · {ago(r.lastSeen.at)}{r.visits > 1 ? ` · ${r.visits} visites` : ""}</span></> : <span className="text-[#8a8a8a]">Pas encore suivi</span>}
        </Row>
      </div>
    </li>
  );
}
