"use client";

import { CalendarClock, Route } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import * as api from "@/lib/api/client";
import type { Journey, JourneysData } from "@/lib/api/client";
import { cn } from "@/lib/cn";

// Une couleur par étape, toujours la même partout (pastilles, textes, barres) pour ne pas se mélanger.
const STEP_COLORS = [
  { dot: "#94a3b8", text: "text-[#475569]", bg: "bg-[#f1f5f9]", ring: "ring-[#cbd5e1]" }, // 1 Compte créé : gris
  { dot: "#3b82f6", text: "text-[#1d4ed8]", bg: "bg-[#e0ecff]", ring: "ring-[#bfdbfe]" }, // 2 Boutique lancée : bleu
  { dot: "#f59e0b", text: "text-[#b45309]", bg: "bg-[#fff1d6]", ring: "ring-[#fde68a]" }, // 3 Aperçu prêt : orange
  { dot: "#8b5cf6", text: "text-[#6d28d9]", bg: "bg-[#efe7ff]", ring: "ring-[#ddd6fe]" }, // 4 Page de paiement : violet
  { dot: "#10b981", text: "text-[#047857]", bg: "bg-[#d9f7e8]", ring: "ring-[#a7f3d0]" }, // 5 Abonné : vert
  { dot: "#14b8a6", text: "text-[#0f766e]", bg: "bg-[#ccfbf1]", ring: "ring-[#99f6e4]" }, // 6 Boutique complète : turquoise
  { dot: "#0f766e", text: "text-[#134e4a]", bg: "bg-[#d1fae5]", ring: "ring-[#6ee7b7]" }, // 7 Sur Shopify : vert foncé
];

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
  direct: { label: "Direct (lien tapé)", tone: "bg-[#f1f1f1] text-[#555]" },
};
const sourceOf = (name: string) => SOURCES[name] ?? { label: name, tone: "bg-[#efe7ff] text-[#6d28d9]" };

// Pages du site en mots simples.
function pageName(p: string) {
  if (p === "/") return "Page d'accueil";
  if (p.startsWith("/inscription")) return "Création de compte";
  if (p.startsWith("/connexion")) return "Connexion";
  if (p === "/quiz" || p.startsWith("/app/quiz")) return "Quiz";
  if (/^\/app\/boutiques\/[^/]+\/installer/.test(p)) return "Mise en ligne Shopify";
  if (/^\/app\/boutiques\/[^/]+/.test(p)) return "Sa boutique (aperçu)";
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
  locked: { label: "Aperçu (pas payé)", tone: "bg-[#fff1d6] text-[#b45309]" },
  ready: { label: "Complète", tone: "bg-[#d9f7e8] text-[#047857]" },
  publishing: { label: "Envoi Shopify…", tone: "bg-[#e0ecff] text-[#1d4ed8]" },
  published: { label: "Sur Shopify", tone: "bg-[#d1fae5] text-[#134e4a]" },
  failed: { label: "Échec", tone: "bg-[#fee8e5] text-[#d72c0d]" },
};

// Abonnement : vert s'il paie, orange s'il a résilié mais garde l'accès, rouge si c'est fini.
const SUB_STATE = {
  active: { label: "Abonné ✓", tone: "bg-[#d9f7e8] text-[#047857]" },
  ending: { label: "A résilié · accès jusqu'à la fin du mois payé", tone: "bg-[#fee8e5] text-[#d72c0d]" },
  ended: { label: "Ancien abonné · parti", tone: "bg-[#fee8e5] text-[#d72c0d]" },
} as const;

const MAIL_NAME: Record<string, string> = { "offer-reminder": "Mail 12 h", "offer-last": "Mail dernière heure", launch: "Mail « C'est ouvert »" };
const MAIL_STATUS: Record<string, { label: string; tone: string }> = {
  clicked: { label: "cliqué ✓", tone: "bg-[#d9f7e8] text-[#047857]" },
  opened: { label: "ouvert ✓", tone: "bg-[#d9f7e8] text-[#047857]" },
  delivered: { label: "reçu, pas ouvert", tone: "bg-[#fff1d6] text-[#b45309]" },
  sent: { label: "envoyé", tone: "bg-[#f1f1f1] text-[#616161]" },
  delivery_delayed: { label: "en retard", tone: "bg-[#fff1d6] text-[#b45309]" },
  bounced: { label: "non délivré", tone: "bg-[#fee8e5] text-[#d72c0d]" },
  complained: { label: "signalé spam", tone: "bg-[#fee8e5] text-[#d72c0d]" },
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
const COUNTRIES: Record<string, string> = { FR: "France", BE: "Belgique", CH: "Suisse", CA: "Canada", LU: "Luxembourg", MA: "Maroc", DZ: "Algérie", TN: "Tunisie", SN: "Sénégal", CI: "Côte d'Ivoire", US: "États-Unis", GB: "Royaume-Uni", DE: "Allemagne", ES: "Espagne", IT: "Italie", NL: "Pays-Bas" };

// Étiquette colorée d'une étape (« 3. Aperçu prêt » en orange, etc.).
function StepTag({ steps, i, prefix }: { steps: string[]; i: number; prefix?: string }) {
  const c = STEP_COLORS[i];
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] font-semibold ring-1", c.bg, c.text, c.ring)}><span className="h-2 w-2 rounded-full" style={{ background: c.dot }} />{prefix}{i + 1}. {steps[i]}</span>;
}

// Les 7 étapes en pastilles colorées, puis l'étape où il bloque.
function Steps({ steps, r }: { steps: string[]; r: Journey }) {
  const next = steps[r.reached + 1];
  return (
    <div className="w-full min-w-0 max-w-[330px] pr-1">
      <div className="flex items-center">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 items-center last:flex-none" title={s}>
            <span className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold", r.done[i] ? "text-white" : "border-2 border-[#ddd] bg-white text-[#bbb]", i === r.reached && "ring-4 ring-black/10")} style={r.done[i] ? { background: STEP_COLORS[i].dot } : undefined}>{i + 1}</span>
            {i < steps.length - 1 && <span className="h-0.5 flex-1" style={{ background: r.done[i + 1] ? STEP_COLORS[i + 1].dot : "#e5e5e5" }} />}
          </div>
        ))}
      </div>
      <div className="mt-2">
        {next ? <StepTag steps={steps} i={r.reached} prefix={r.reached >= 4 ? "Dernière étape : " : "Bloqué à : "} /> : <span className="inline-flex rounded-full bg-[#d1fae5] px-2.5 py-1 text-[13px] font-semibold text-[#134e4a]">Tout fait ✓</span>}
      </div>
      {next && <p className="mt-1 text-xs text-[#8a8a8a]">Prochaine étape : {next}</p>}
      {r.subState !== "none" && <span className={cn("mt-1.5 inline-block rounded-full px-2 py-0.5 text-[11.5px] font-semibold", SUB_STATE[r.subState].tone)}>{SUB_STATE[r.subState].label}</span>}
    </div>
  );
}

function Mails({ mails }: { mails: Journey["mails"] }) {
  if (!mails.length) return <span className="text-xs text-[#8a8a8a]">Aucun mail envoyé</span>;
  return (
    <span className="flex flex-wrap gap-1">
      {mails.map((m, i) => {
        const st = MAIL_STATUS[m.status] ?? { label: m.status, tone: "bg-[#f1f1f1] text-[#616161]" };
        return <span key={i} className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", st.tone)}>{MAIL_NAME[m.kind] ?? "Mail"} : {st.label}</span>;
      })}
    </span>
  );
}

function StoreBox({ r, big }: { r: Journey; big?: boolean }) {
  if (!r.store) return <p className="rounded-[14px] bg-[#f7f7f8] p-3 text-[13px] text-[#8a8a8a]">Aucune boutique créée</p>;
  const st = STORE_STATUS[r.store.status] ?? { label: r.store.status, tone: "bg-[#f1f1f1] text-[#555]" };
  return (
    <Link href={`/ventes/boutique/${r.store.id}`} className={cn("group flex items-center gap-3", big && "rounded-[14px] bg-[#f7f7f8] p-2")}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {r.store.image ? <img src={r.store.image} alt="" loading="lazy" className="h-[72px] w-[120px] shrink-0 rounded-[10px] object-cover ring-1 ring-black/5" /> : <span className="grid h-[72px] w-[120px] shrink-0 place-items-center rounded-[10px] bg-white text-[11px] text-[#8a8a8a] ring-1 ring-black/5">pas d'image</span>}
      <span className="min-w-0">
        <span className="block max-w-[170px] truncate font-semibold group-hover:underline">{r.store.name}</span>
        <span className={cn("mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium", st.tone)}>{st.label}</span>
        <span className="mt-0.5 block text-xs font-medium text-[#2563eb]">Voir l'aperçu →{r.store.count > 1 ? ` (${r.store.count} boutiques)` : ""}</span>
      </span>
    </Link>
  );
}

function Source({ r }: { r: Journey }) {
  if (!r.source) return <span className="text-[13px] text-[#8a8a8a]">Inconnu (inscrit avant le suivi)</span>;
  const src = sourceOf(r.source.name);
  return (
    <>
      <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-[13px] font-semibold", src.tone)}>{src.label}</span>
      <span className="ml-2 text-xs text-[#616161]">{r.source.device}{r.source.country ? ` · ${COUNTRIES[r.source.country] ?? r.source.country}` : ""}</span>
      <span className="block text-xs text-[#8a8a8a]">arrivé sur : {pageName(r.source.entry)}</span>
    </>
  );
}

// Résumé du jour : où bloquent les inscrits d'aujourd'hui, et sur quelle page partent les visiteurs.
function Today({ data }: { data: JourneysData }) {
  const t = data.today;
  const maxStop = Math.max(1, ...t.stops);
  const top = t.stops.indexOf(Math.max(...t.stops));
  const exits = new Map<string, number>();
  t.exits.forEach((e) => exits.set(pageName(e.page), (exits.get(pageName(e.page)) ?? 0) + e.count));
  const exitList = [...exits.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxExit = Math.max(1, ...exitList.map((e) => e[1]));
  return (
    <div className="mt-4 grid gap-3 lg:grid-cols-2">
      <div className="rounded-[14px] bg-[#f7f7f8] p-3.5">
        <p className="flex items-center gap-1.5 text-[13px] font-semibold"><CalendarClock className="h-4 w-4 text-[#7c3aed]" />Aujourd'hui · où bloquent les {t.signups} inscrit{t.signups > 1 ? "s" : ""}</p>
        {t.signups ? (
          <>
            <div className="mt-2.5 space-y-1.5">
              {data.steps.map((s, i) => (
                <div key={s} className="flex items-center gap-2 text-[13px]">
                  <span className={cn("w-[150px] shrink-0 truncate font-medium", STEP_COLORS[i].text)}>{i + 1}. {s}</span>
                  <span className="h-3 flex-1 overflow-hidden rounded-full bg-white"><span className="block h-full rounded-full" style={{ width: `${(t.stops[i] / maxStop) * 100}%`, background: STEP_COLORS[i].dot }} /></span>
                  <span className="w-6 text-right font-semibold tabular-nums">{t.stops[i]}</span>
                </div>
              ))}
            </div>
            {t.stops[top] > 0 && top < data.steps.length - 1 && <p className="mt-2.5 text-[13px]">Le plus de monde bloque à <StepTag steps={data.steps} i={top} /></p>}
          </>
        ) : <p className="mt-2 text-[13px] text-[#8a8a8a]">Personne ne s'est inscrit aujourd'hui pour l'instant.</p>}
      </div>
      <div className="rounded-[14px] bg-[#f7f7f8] p-3.5">
        <p className="flex items-center gap-1.5 text-[13px] font-semibold"><CalendarClock className="h-4 w-4 text-[#d72c0d]" />Aujourd'hui · où partent les {t.visits} visiteur{t.visits > 1 ? "s" : ""}</p>
        {exitList.length ? (
          <div className="mt-2.5 space-y-1.5">
            {exitList.map(([page, n]) => (
              <div key={page} className="flex items-center gap-2 text-[13px]">
                <span className="w-[150px] shrink-0 truncate font-medium">{page}</span>
                <span className="h-3 flex-1 overflow-hidden rounded-full bg-white"><span className="block h-full rounded-full bg-[#f87171]" style={{ width: `${(n / maxExit) * 100}%` }} /></span>
                <span className="w-6 text-right font-semibold tabular-nums">{n}</span>
              </div>
            ))}
            <p className="pt-1 text-xs text-[#8a8a8a]">La dernière page vue avant de quitter le site (vrais visiteurs, sans robots).</p>
          </div>
        ) : <p className="mt-2 text-[13px] text-[#8a8a8a]">Pas encore de visite aujourd'hui.</p>}
      </div>
    </div>
  );
}

export function Journeys({ wide = false }: { wide?: boolean }) {
  const [data, setData] = useState<JourneysData | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { api.getOwnerJourneys().then(setData, (e) => setError((e as Error).message)); }, []);
  // Ventes (téléphone) : les 5 derniers. Grand tableau : les 30 derniers.
  const rows = data ? data.rows.slice(0, wide ? 30 : 5) : [];

  return (
    <section className="min-w-0 overflow-hidden rounded-[18px] bg-white text-[#111] shadow-[0_10px_30px_-18px_rgb(0_0_0/0.6)]">
      <div className="p-4 sm:p-5">
        <h2 className="flex items-center gap-2 text-[17px] font-semibold"><span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[#efe7ff] text-[#7c3aed]"><Route className="h-4 w-4" /></span>Parcours des clients</h2>
        <p className="mt-1 text-[13px] text-[#616161]">D'où ils viennent, leur boutique, et l'étape où ils bloquent. Heures de Paris.</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {data?.steps.map((s, i) => <span key={s} className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", STEP_COLORS[i].bg, STEP_COLORS[i].text)}>{i + 1}. {s}</span>)}
        </div>
        {!wide && <Link href="/ventes/parcours" className="mt-3 inline-block rounded-full bg-[#efe7ff] px-3 py-1.5 text-[13px] font-semibold text-[#6d28d9]">Grand tableau des 30 derniers (ordinateur) →</Link>}
        {error && <p className="mt-3 text-sm text-[#d72c0d]">{error}</p>}
        {!data && !error && <p className="mt-3 text-sm text-[#8a8a8a]">Chargement…</p>}
        {data && <Today data={data} />}
        {data && <p className="mt-5 text-[13px] font-semibold">{wide ? "Les 30 derniers inscrits" : "Les 5 derniers inscrits"}</p>}
      </div>

      {data && rows.length > 0 && (
        <ul className={cn("divide-y divide-[#eee] border-t border-[#eee]", wide && "lg:hidden")}>
          {rows.map((r) => <JourneyCard key={r.email + r.at} r={r} steps={data.steps} />)}
        </ul>
      )}

      {data && rows.length > 0 && wide && (
        <div className="hidden overflow-x-auto border-t border-[#eee] lg:block">
          <table className="w-full min-w-[1180px] text-left text-sm">
            <thead className="bg-[#fafafa] text-xs uppercase tracking-wide text-[#8a8a8a]">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Inscrit le</th>
                <th className="px-4 py-2.5 font-semibold">Client</th>
                <th className="px-4 py-2.5 font-semibold">Vient de</th>
                <th className="px-4 py-2.5 font-semibold">Sa boutique</th>
                <th className="px-4 py-2.5 font-semibold">Parcours</th>
                <th className="px-4 py-2.5 font-semibold">Vu en dernier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eee]">
              {rows.map((r) => (
                <tr key={r.email + r.at} className="align-top hover:bg-[#fcfcfc]">
                  <td className="px-4 py-3.5"><span className="block font-semibold">{when(r.at)}</span><span className="text-xs text-[#8a8a8a]">{ago(r.at)}</span></td>
                  <td className="max-w-[230px] px-4 py-3.5"><span className="block truncate font-medium">{r.email}</span><span className="mt-1 block"><Mails mails={r.mails} /></span></td>
                  <td className="px-4 py-3.5"><Source r={r} /></td>
                  <td className="px-4 py-3.5"><StoreBox r={r} /></td>
                  <td className="min-w-[280px] px-4 py-3.5"><Steps steps={data.steps} r={r} /></td>
                  <td className="px-4 py-3.5">{r.lastSeen ? <><span className="block font-medium">{pageName(r.lastSeen.page)}</span><span className="text-xs text-[#8a8a8a]">{when(r.lastSeen.at)} · {ago(r.lastSeen.at)}</span>{r.visits > 1 && <span className="block text-xs text-[#8a8a8a]">{r.visits} visites</span>}</> : <span className="text-xs text-[#8a8a8a]">Pas encore suivi</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// Version téléphone : une grande fiche par client, toujours dans le même ordre.
function JourneyCard({ r, steps }: { r: Journey; steps: string[] }) {
  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex gap-3 py-1.5"><span className="w-[88px] shrink-0 pt-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#8a8a8a]">{label}</span><div className="min-w-0 flex-1 text-[13px]">{children}</div></div>
  );
  return (
    <li className="px-4 py-4 sm:px-5">
      <div className="flex items-start justify-between gap-3">
        <span className="min-w-0 truncate text-[15px] font-semibold">{r.email}</span>
        <span className="shrink-0 text-right text-xs text-[#616161]">Inscrit le<b className="block text-[13px] text-[#111]">{when(r.at)}</b>{ago(r.at)}</span>
      </div>
      <div className="mt-3"><StoreBox r={r} big /></div>
      <div className="mt-2">
        <Row label="Parcours"><Steps steps={steps} r={r} /></Row>
        <Row label="Vient de"><Source r={r} /></Row>
        <Row label="Vu en dernier">
          {r.lastSeen ? <><b className="font-medium">{pageName(r.lastSeen.page)}</b><span className="block text-xs text-[#8a8a8a]">{when(r.lastSeen.at)} · {ago(r.lastSeen.at)}{r.visits > 1 ? ` · ${r.visits} visites` : ""}</span></> : <span className="text-[#8a8a8a]">Pas encore suivi</span>}
        </Row>
        <Row label="Mails"><Mails mails={r.mails} /></Row>
      </div>
    </li>
  );
}
