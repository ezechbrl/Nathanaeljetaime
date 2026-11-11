"use client";

import {
  AlertTriangle, BadgeCheck, Bell, BellRing, CalendarRange, Eye, Gauge, Hourglass, Percent, Receipt, RefreshCw,
  ShoppingBag, TrendingDown, TrendingUp, UserPlus, Users, Wallet,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import * as api from "@/lib/api/client";
import { ApiClientError } from "@/lib/api/errors";
import type { OwnerStats } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { formatMoney, formatShortDate } from "@/lib/format";

// « Vigenia Ventes » : le tableau de bord du fondateur, façon admin Shopify (cartes blanches sur le fond vert).

const PERIODS = [
  { id: "today", label: "Aujourd'hui", vs: "vs hier à la même heure" },
  { id: "yesterday", label: "Hier", vs: "vs avant-hier" },
  { id: "week", label: "7 jours", vs: "vs les 7 jours d'avant" },
  { id: "month", label: "30 jours", vs: "vs les 30 jours d'avant" },
] as const;
type PeriodId = (typeof PERIODS)[number]["id"];
const PLAN_NAME: Record<string, string> = { pro: "Starter", agency: "Pro" };
const eur = (cents: number) => formatMoney(cents, "EUR");
const pct = (n: number) => `${(n * 100).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`;
const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64: string) {
  const raw = atob((base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

// Remet la pastille rouge à zéro (à l'ouverture et à chaque retour dans l'app).
function clearBadge() {
  navigator.serviceWorker?.ready.then((reg) => reg.active?.postMessage("clear-badge")).catch(() => {});
  (navigator as Navigator & { clearAppBadge?: () => Promise<void> }).clearAppBadge?.().catch(() => {});
}

// Notifications push + pastille rouge : uniquement depuis l'app ajoutée à l'écran d'accueil (exigence d'iOS).
function useNotifications() {
  const [state, setState] = useState<"unsupported" | "install" | "off" | "on" | "busy">("unsupported");
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").then(async (reg) => {
      clearBadge();
      const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone;
      if (!("PushManager" in window) || !VAPID) return setState(standalone || !VAPID ? "unsupported" : "install");
      const sub = await reg.pushManager.getSubscription();
      setState(sub && Notification.permission === "granted" ? "on" : "off");
    }).catch(() => {});
    const onShow = () => document.visibilityState === "visible" && clearBadge();
    document.addEventListener("visibilitychange", onShow);
    return () => document.removeEventListener("visibilitychange", onShow);
  }, []);
  const enable = useCallback(async () => {
    setState("busy");
    try {
      if ((await Notification.requestPermission()) !== "granted") return setState("off");
      const reg = await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) ?? await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID!) });
      await api.savePushSubscription(sub.toJSON());
      setState("on");
    } catch {
      setState("off");
    }
  }, []);
  return { state, enable };
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("min-w-0 overflow-hidden rounded-[18px] bg-white p-4 text-[#111] shadow-[0_10px_30px_-18px_rgb(0_0_0/0.6)] sm:p-5", className)}>{children}</section>;
}

// Une couleur par famille de chiffres : argent (vert), clients (bleu), départs (rouge), croissance (violet / ambre).
const TONES = {
  green: "bg-[#d9f7e8] text-[#0a8f5f]",
  blue: "bg-[#e0ecff] text-[#2563eb]",
  violet: "bg-[#efe7ff] text-[#7c3aed]",
  amber: "bg-[#fff1d6] text-[#c2410c]",
  red: "bg-[#fee8e5] text-[#d72c0d]",
  pink: "bg-[#ffe4f1] text-[#db2777]",
} as const;

// Visiteurs en ce moment (2 dernières minutes), avec un point vert qui pulse.
function Live({ count }: { count: number }) {
  return (
    <Card className="flex h-[140px] flex-col">
      <span className="flex h-8 items-center gap-2"><span className="relative flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10b981] opacity-60" /><span className="relative inline-flex h-3 w-3 rounded-full bg-[#10b981]" /></span><span className="text-xs font-medium text-[#0a8f5f]">En direct</span></span>
      <p className="mt-auto truncate text-[13px] text-[#616161]">En ce moment</p>
      <p className="mt-1 truncate text-[1.5rem] font-semibold leading-none tracking-[-0.02em] tabular-nums">{count}</p>
      <p className="mt-1.5 truncate text-[11.5px] leading-tight text-[#8a8a8a]">visiteur{count > 1 ? "s" : ""} sur le site</p>
    </Card>
  );
}

// Évolution par rapport à la période d'avant : ↑ vert, ↓ rouge (inversé pour les départs).
function Delta({ cur, prev, inverse = false }: { cur: number; prev: number; inverse?: boolean }) {
  if (!cur && !prev) return <span className="text-xs text-[#8a8a8a]">—</span>;
  const up = cur >= prev, good = inverse ? !up : up;
  const txt = prev ? `${up ? "↑" : "↓"} ${Math.abs(Math.round(((cur - prev) / prev) * 100))} %` : "↑ nouveau";
  return <span className={cn("rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums", cur === prev ? "bg-[#f1f1f1] text-[#616161]" : good ? TONES.green : TONES.red)}>{cur === prev ? "= stable" : txt}</span>;
}

// Toutes les tuiles ont exactement la même taille.
function Metric({ label, value, hint, icon: Icon, color = "green", cur, prev, inverse }: { label: string; value: string; hint?: string; icon: React.ComponentType<{ className?: string }>; color?: keyof typeof TONES; cur?: number; prev?: number; inverse?: boolean }) {
  return (
    <Card className="flex h-[140px] flex-col">
      <span className="flex items-center justify-between gap-2">
        <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-[10px]", TONES[color])}><Icon className="h-4 w-4" /></span>
        {cur !== undefined && prev !== undefined && <Delta cur={cur} prev={prev} inverse={inverse} />}
      </span>
      <p className="mt-auto truncate text-[13px] text-[#616161]">{label}</p>
      <p className="mt-1 truncate text-[1.5rem] font-semibold leading-none tracking-[-0.02em] tabular-nums">{value}</p>
      <p className="mt-1.5 truncate text-[11.5px] leading-tight text-[#8a8a8a]">{hint ?? "\u00a0"}</p>
    </Card>
  );
}

// Graduations « rondes » de l'axe vertical (0, 5, 10… ou 0, 20 €, 40 €…).
function niceMax(v: number, minStep = 1) {
  const raw = Math.max(v / 4, minStep), p = 10 ** Math.floor(Math.log10(raw)), f = raw / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p * 4;
}

// Vrai graphique : axes gradués, courbe lissée avec zone colorée, période d'avant en pointillés,
// et au doigt (ou à la souris) un repère avec la valeur exacte et celle de la période d'avant.
function Chart({ title, total, points, format, color, short, money = false }: {
  title: string; total: string; money?: boolean;
  points: { label: string; value: number; prev: number }[];
  format: (n: number) => string; short: (n: number) => string; color: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 340, H = 170, L = 38, R = 8, T = 10, B = 22;
  const max = niceMax(Math.max(1, ...points.map((p) => Math.max(p.value, p.prev))), money ? 100 : 1);
  const X = (i: number) => L + (i * (W - L - R)) / Math.max(points.length - 1, 1);
  const Y = (v: number) => T + (1 - v / max) * (H - T - B);
  const path = (vals: number[]) => {
    const xy = vals.map((v, i) => [X(i), Y(v)] as const);
    return xy.reduce((d, [x, y], i) => {
      if (i === 0) return `M${x},${y}`;
      const [x0, y0] = xy[i - 2] ?? xy[i - 1], [x1, y1] = xy[i - 1], [x3, y3] = xy[i + 1] ?? [x, y];
      const lo = Math.min(y1, y), hi = Math.max(y1, y);
      const c1 = Math.min(hi, Math.max(lo, y1 + (y - y0) / 6)), c2 = Math.min(hi, Math.max(lo, y - (y3 - y1) / 6));
      return `${d} C${x1 + (x - x0) / 6},${c1} ${x - (x3 - x1) / 6},${c2} ${x},${y}`;
    }, "");
  };
  const cur = path(points.map((p) => p.value)), prev = path(points.map((p) => p.prev));
  const area = `${cur} L${X(points.length - 1)},${H - B} L${X(0)},${H - B} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const labelEvery = Math.max(1, Math.ceil(points.length / 5));
  const pick = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    setHover(Math.min(points.length - 1, Math.max(0, Math.round(((x - L) / (W - L - R)) * (points.length - 1)))));
  };
  const h = hover;
  const id = title.replace(/\W/g, "");
  return (
    <Card className="flex h-[300px] flex-col">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-[15px] font-semibold">{title}</h2>
        <span className="text-[1.25rem] font-semibold tabular-nums">{total}</span>
      </div>
      <div className="relative mt-2 flex-1">
        {h !== null && (
          <div className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 whitespace-nowrap rounded-xl bg-[#111] px-3 py-2 text-xs text-white shadow-lg" style={{ left: `${Math.min(80, Math.max(20, (X(h) / W) * 100))}%` }}>
            <span className="block text-white/60">{points[h].label}</span>
            <span className="block font-semibold tabular-nums">{format(points[h].value)}</span>
            <span className="block text-white/50 tabular-nums">avant : {format(points[h].prev)}</span>
          </div>
        )}
        <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full touch-none select-none" onPointerMove={pick} onPointerDown={pick} onPointerLeave={() => setHover(null)} role="img" aria-label={title}>
          <defs>
            <linearGradient id={`g${id}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={color} stopOpacity="0.3" />
              <stop offset="1" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={L} x2={W - R} y1={Y(t)} y2={Y(t)} stroke="#eeeeee" strokeWidth="1" />
              <text x={L - 6} y={Y(t) + 3.5} textAnchor="end" fontSize="9.5" fill="#9a9a9a">{short(t)}</text>
            </g>
          ))}
          {points.map((p, i) => (i % labelEvery === 0 || i === points.length - 1) && (
            <text key={i} x={X(i)} y={H - 5} textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"} fontSize="9.5" fill="#9a9a9a">{p.label}</text>
          ))}
          <path d={prev} fill="none" stroke="#b5b5b5" strokeWidth="1.6" strokeDasharray="4 4" strokeLinecap="round" />
          <path d={area} fill={`url(#g${id})`} />
          <path d={cur} fill="none" stroke={color} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
          {h !== null && (
            <g>
              <line x1={X(h)} x2={X(h)} y1={T} y2={H - B} stroke="#111" strokeOpacity="0.3" strokeDasharray="3 3" />
              <circle cx={X(h)} cy={Y(points[h].prev)} r="3.5" fill="#fff" stroke="#b5b5b5" strokeWidth="2" />
              <circle cx={X(h)} cy={Y(points[h].value)} r="5" fill="#fff" stroke={color} strokeWidth="3" />
            </g>
          )}
        </svg>
      </div>
      <p className="mt-1 flex items-center gap-3 text-[11px] text-[#8a8a8a]">
        <span className="flex items-center gap-1.5"><span className="h-[3px] w-4 rounded-full" style={{ background: color }} />Cette période</span>
        <span className="flex items-center gap-1.5"><span className="h-0 w-4 border-t-2 border-dashed border-[#b5b5b5]" />Période d'avant</span>
        <span className="ml-auto">Touche la courbe</span>
      </p>
    </Card>
  );
}

const compact = (n: number) => (n >= 1000 ? `${Math.round(n / 100) / 10} k` : String(Math.round(n)));
const euroShort = (cents: number) => `${compact(cents / 100)} €`;

type Offer = NonNullable<OwnerStats["signups"][number]["offer"]>;

// Offre de lancement de chaque compte : ✓ abonné, compte à rebours, ou ✗ offre expirée.
function OfferBadge({ offer, now }: { offer: Offer; now: number }) {
  if (offer.subscribedAt) return <span className={cn("shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold", TONES.green)}>✓ Abonné{offer.amount != null ? ` · ${eur(offer.amount)}` : ""}</span>;
  const left = new Date(offer.endsAt).getTime() - now;
  if (left <= 0) return <span className={cn("shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold", TONES.red)}>✗ Offre expirée</span>;
  const h = Math.floor(left / 3_600_000), m = Math.floor((left % 3_600_000) / 60_000);
  return <span className={cn("shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold tabular-nums", TONES.amber)}>⏳ {h} h {String(m).padStart(2, "0")}</span>;
}

function OfferNote({ offer }: { offer: Offer }) {
  if (offer.subscribedAt) {
    const after = offer.lastCallAt && offer.subscribedAt > offer.lastCallAt ? "après le mail « dernière heure » ✓" : offer.reminderAt && offer.subscribedAt > offer.reminderAt ? "après le mail de 12 h ✓" : "avant les mails";
    return <> · abonné {after}</>;
  }
  return <> · {offer.lastCallAt ? "2 mails envoyés (12 h + dernière heure)" : offer.reminderAt ? "mail de 12 h envoyé · dernier à 23 h" : "mail de rappel à 12 h"}</>;
}

// Paliers de revenu mensuel à atteindre (en euros), pour voir le prochain objectif.
const MILESTONES = [100, 500, 1_000, 2_500, 5_000, 10_000, 25_000, 50_000, 100_000];

const ago = (iso: string) => {
  const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (min < 60) return `il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.round(h / 24);
  return `il y a ${d} jour${d > 1 ? "s" : ""}`;
};

// En haut de la page : le revenu mensuel (MRR) en gros, l'année au même rythme, et le prochain palier.
function MoneyHero({ s }: { s: OwnerStats }) {
  const mrrEuros = s.mrr / 100;
  const next = MILESTONES.find((m) => m > mrrEuros) ?? MILESTONES[MILESTONES.length - 1];
  const prevStep = [...MILESTONES].reverse().find((m) => m <= mrrEuros) ?? 0;
  const progress = Math.min(1, mrrEuros / next);
  const lastSale = s.recent.find((r) => r.kind === "new" || r.kind === "payment");
  return (
    <Card className="relative overflow-hidden bg-[linear-gradient(160deg,#ffffff,#effcf5)]">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[13px] font-medium text-[#0a8f5f]">Revenu mensuel (MRR)</span>
        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", TONES.green)}>{s.subscribers.total} abonné{s.subscribers.total > 1 ? "s" : ""}</span>
      </div>
      <p className="mt-1 text-[2.4rem] font-bold leading-none tracking-[-0.03em] tabular-nums">{eur(s.mrr)}</p>
      <p className="mt-1.5 text-[13px] text-[#616161]">
        soit <b className="text-[#111]">{eur(s.arr)}</b> sur un an · {lastSale ? <>dernière vente {ago(lastSale.at)}</> : "pas encore de vente"}
      </p>
      <div className="mt-4">
        <div className="flex justify-between text-[11.5px] text-[#616161]">
          <span>{prevStep ? `Palier ${eur(prevStep * 100)} atteint ✓` : "Premier palier"}</span>
          <span className="font-semibold text-[#111]">Objectif {eur(next * 100)} / mois</span>
        </div>
        <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-[#e6f4ec]">
          <div className="h-full rounded-full bg-[linear-gradient(90deg,#10b981,#0a8f5f)] transition-[width] duration-700" style={{ width: `${Math.max(2, progress * 100)}%` }} />
        </div>
        <p className="mt-1.5 text-[11.5px] text-[#8a8a8a]">Encore {eur(Math.max(0, next * 100 - s.mrr))} par mois pour l'atteindre</p>
      </div>
    </Card>
  );
}

function Dashboard({ s }: { s: OwnerStats }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(t);
  }, []);
  const [period, setPeriod] = useState<PeriodId>("today");
  const [metric, setMetric] = useState<"signups" | "revenue" | "visits">("revenue");
  const p = s.periods[period];
  const q = p.prev;
  const vs = PERIODS.find((x) => x.id === period)!.vs;
  const conv = (c: { signups: number; visits: number }) => (c.visits ? c.signups / c.visits : 0);

  const aff = s.affiliates.reduce((t, a) => ({ clicks: t.clicks + a.clicks, signups: t.signups + a.signups, customers: t.customers + a.customers, commission: t.commission + a.commission }), { clicks: 0, signups: 0, customers: 0, commission: 0 });
  const subs = s.subscribers.total || 1;
  const chart = (k: "visits" | "signups" | "revenue") => p.chart.map((c) => ({ label: c.label, value: c[k], prev: c[k === "visits" ? "prevVisits" : k === "signups" ? "prevSignups" : "prevRevenue"] }));
  const plural = (n: number, w: string) => `${n} ${w}${n > 1 ? "s" : ""}`;

  return (
    <div className="space-y-3 pb-10">
      <div role="tablist" aria-label="Période" className="sticky top-[max(env(safe-area-inset-top),8px)] z-20 grid grid-cols-4 rounded-full bg-[#0b2a20]/95 p-1 shadow-lg backdrop-blur">
        {PERIODS.map((x) => (
          <button key={x.id} type="button" role="tab" aria-selected={period === x.id} onClick={() => setPeriod(x.id)} className={cn("rounded-full py-2 text-[13px] font-medium transition-colors", period === x.id ? "bg-white text-[#111]" : "text-white/75")}>
            {x.label}
          </button>
        ))}
      </div>
      {/* L'argent d'abord : revenu mensuel et prochain palier */}
      <MoneyHero s={s} />

      {/* Puis le graphique : Revenus (par défaut), Inscrits ou Visites */}
      <div className="grid grid-cols-3 rounded-full bg-black/25 p-1">
        {([["revenue", "Revenus"], ["signups", "Inscrits"], ["visits", "Visites"]] as const).map(([k, l]) => (
          <button key={k} type="button" onClick={() => setMetric(k)} className={cn("rounded-full py-1.5 text-[13px] font-medium", metric === k ? "bg-white text-[#111]" : "text-white/75")}>{l}</button>
        ))}
      </div>
      {metric === "signups" && <Chart title="Inscrits" total={String(p.signups)} points={chart("signups")} color="#2563eb" format={(n) => plural(n, "inscrit")} short={compact} />}
      {metric === "revenue" && <Chart title="Revenus" total={eur(p.revenue)} points={chart("revenue")} color="#0a8f5f" format={eur} short={euroShort} money />}
      {metric === "visits" && <Chart title="Visites" total={String(p.visits)} points={chart("visits")} color="#f59e0b" format={(n) => plural(n, "visiteur")} short={compact} />}
      <p className="px-1 text-xs text-white/60">Flèches : {vs} · vrais visiteurs seulement (sans robots ni passages Shopify)</p>

      {/* Les chiffres clés de la période, tous à la même taille */}
      <div className="grid grid-cols-2 gap-3">
        {/* Argent de la période d'abord */}
        <Metric icon={Wallet} color="green" label="Encaissé" value={eur(p.revenue)} hint={plural(p.sales, "paiement")} cur={p.revenue} prev={q.revenue} />
        <Metric icon={TrendingUp} color="violet" label="Nouveaux abonnés" value={`+${p.newSubs}`} hint="Premiers abonnements" cur={p.newSubs} prev={q.newSubs} />
        <Metric icon={Receipt} color="green" label="Ventes" value={String(p.sales)} hint="Paiements reçus" cur={p.sales} prev={q.sales} />
        <Metric icon={TrendingDown} color="red" label="Désabonnements" value={p.cancels ? `−${p.cancels}` : "0"} hint={`Taux sur 30 j : ${pct(s.churn)}`} cur={p.cancels} prev={q.cancels} inverse />
        <Metric icon={Users} color="blue" label="Abonnés actifs" value={String(s.subscribers.total)} hint={`${s.subscribers.starter} Starter · ${s.subscribers.pro} Pro`} />
        <Metric icon={Gauge} color="violet" label="Panier moyen" value={eur(s.arpu)} hint="Par abonné et par mois" />
        {/* Puis le trafic */}
        <Live count={s.liveNow} />
        <Metric icon={Eye} color="amber" label="Visiteurs" value={String(p.visits)} hint="Vraies visites" cur={p.visits} prev={q.visits} />
        <Metric icon={UserPlus} color="blue" label="Inscrits" value={String(p.signups)} hint={`${p.waitlist} attente · ${p.accounts} comptes`} cur={p.signups} prev={q.signups} />
        <Metric icon={Percent} color="violet" label="Visiteurs → inscrits" value={p.visits ? pct(conv(p)) : "—"} hint="Taux de conversion" cur={Math.round(conv(p) * 1000)} prev={Math.round(conv(q) * 1000)} />
        <Metric icon={ShoppingBag} color="pink" label="Aperçus créés" value={String(p.stores)} hint="Boutiques générées" cur={p.stores} prev={q.stores} />
        <Metric icon={BadgeCheck} color="amber" label="Paiement ouvert" value={String(p.checkouts)} hint="Ont vu la page de paiement" cur={p.checkouts} prev={q.checkouts} />
        <Metric icon={CalendarRange} color="green" label="ARR" value={eur(s.arr)} hint="Sur un an, au rythme actuel" />
        <Metric icon={Hourglass} color="pink" label="Liste d'attente" value={String(s.totals.waitlist)} hint="Inscrits au total" />
        <Metric icon={UserPlus} color="blue" label="Comptes" value={String(s.totals.accounts)} hint={`${pct(s.conversion)} devenus payants`} />
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Card>
          <h2 className="text-[15px] font-semibold">Répartition des offres</h2>
          <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-[#f1f1f1]">
            <div className="bg-[#0a8f5f]" style={{ width: `${(s.subscribers.starter / subs) * 100}%` }} />
            <div className="bg-[#111]" style={{ width: `${(s.subscribers.pro / subs) * 100}%` }} />
          </div>
          <div className="mt-3 space-y-1.5 text-sm">
            <p className="flex justify-between"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#0a8f5f]" />Starter</span><span className="tabular-nums">{s.subscribers.starter}</span></p>
            <p className="flex justify-between"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#111]" />Pro</span><span className="tabular-nums">{s.subscribers.pro}</span></p>
          </div>
        </Card>

        <Card>
          <h2 className="text-[15px] font-semibold">Affiliation Vigenia <span className="font-normal text-[#8a8a8a]">· les gens qui font ta pub</span></h2>
          <div className="mt-3 grid grid-cols-4 gap-2 text-center">
            {[["Clics", String(aff.clicks)], ["Inscrits", String(aff.signups)], ["Clients", String(aff.customers)], ["À reverser", eur(aff.commission)]].map(([l, v]) => (
              <div key={l} className="rounded-xl bg-[#f6f6f6] px-1 py-2"><p className="text-[11px] text-[#616161]">{l}</p><p className="mt-0.5 text-sm font-semibold tabular-nums">{v}</p></div>
            ))}
          </div>
          {s.affiliates.length ? (
            <ul className="mt-2 divide-y divide-[#eee] text-sm">
              {s.affiliates.map((a) => (
                <li key={a.code} className="flex items-center gap-3 py-2.5">
                  <span className="min-w-0 flex-1"><span className="block truncate font-medium">{a.name}</span><span className="block text-xs text-[#8a8a8a]">{a.clicks} clics · {a.signups} inscrits · {a.customers} clients</span></span>
                  <span className="tabular-nums">{eur(a.commission)}</span>
                </li>
              ))}
            </ul>
          ) : <p className="mt-3 text-sm text-[#8a8a8a]">Pas encore d'affiliés. Chaque utilisateur peut créer son lien depuis la page Affiliation de Vigenia.</p>}

        </Card>
      </div>

      {/* Affiliation Shopify : ton lien d'affiliation Shopify (Impact). */}
      <Card>
        <h2 className="flex items-center gap-2 text-[15px] font-semibold"><span className={cn("grid h-7 w-7 place-items-center rounded-[9px]", TONES.green)}><ShoppingBag className="h-3.5 w-3.5" /></span>Affiliation Shopify <span className="font-normal text-[#8a8a8a]">· ton lien Shopify</span></h2>
        {s.shopifyAffiliation.configured ? (
          <>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
              {[["Essais", String(s.shopifyAffiliation.trials)], ["Payants", String(s.shopifyAffiliation.paid)], ["En attente", formatMoney(s.shopifyAffiliation.pending, s.shopifyAffiliation.currency)], ["Validé", formatMoney(s.shopifyAffiliation.approved, s.shopifyAffiliation.currency)]].map(([l, v]) => (
                <div key={l} className="rounded-xl bg-[#f6f6f6] px-1 py-2"><p className="text-[11px] text-[#616161]">{l}</p><p className="mt-0.5 text-sm font-semibold tabular-nums">{v}</p></div>
              ))}
            </div>
            {s.shopifyAffiliation.recent.length > 0 && (
              <ul className="mt-2 divide-y divide-[#eee] text-sm">
                {s.shopifyAffiliation.recent.map((r, i) => (
                  <li key={i} className="flex items-center gap-3 py-2.5">
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", r.state === "APPROVED" ? TONES.green : r.state === "REVERSED" ? TONES.red : TONES.amber)}>{r.state === "APPROVED" ? "Validé" : r.state === "REVERSED" ? "Annulé" : "En attente"}</span>
                    <span className="min-w-0 flex-1 truncate">{r.label}{r.at && <span className="text-[#8a8a8a]"> · {formatShortDate(r.at)}</span>}</span>
                    <span className="tabular-nums">{formatMoney(r.payout, s.shopifyAffiliation.currency)}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-xs text-[#8a8a8a]">Mis à jour toutes les heures · 30 derniers jours</p>
          </>
        ) : (
          <p className="mt-2 text-sm text-[#8a8a8a]">Pas encore branché : ajoute tes clés Impact dans Vercel (IMPACT_ACCOUNT_SID et IMPACT_AUTH_TOKEN) et tes parrainages apparaîtront ici, avec une notification à chaque fois.</p>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-3">
        {/* Entonnoir : où les gens s'arrêtent avant d'acheter (30 derniers jours). */}
        <Card>
          <h2 className="flex items-center gap-2 text-[15px] font-semibold"><span className={cn("grid h-7 w-7 place-items-center rounded-[9px]", TONES.violet)}><Gauge className="h-3.5 w-3.5" /></span>Parcours avant l'achat <span className="font-normal text-[#8a8a8a]">· 30 j</span></h2>
          <div className="mt-3 space-y-2.5">
            {s.funnel.map((f, i) => {
              const first = s.funnel[0].count || 1;
              const prev = i ? s.funnel[i - 1].count : f.count;
              const lost = i && prev ? Math.round(((prev - f.count) / prev) * 100) : 0;
              return (
                <div key={f.step}>
                  <div className="flex justify-between text-sm"><span>{f.step}</span><span className="tabular-nums font-medium">{f.count}{i > 0 && prev > 0 && <span className="ml-1.5 text-xs font-normal text-[#d72c0d]">−{lost} %</span>}</span></div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#f1f1f1]"><div className={cn("h-full rounded-full", ["bg-[#f59e0b]", "bg-[#2563eb]", "bg-[#7c3aed]", "bg-[#db2777]", "bg-[#0a8f5f]"][i])} style={{ width: `${Math.max(2, (f.count / first) * 100)}%` }} /></div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-[#8a8a8a]">Le plus gros pourcentage rouge = l'étape où tu perds le plus de monde.</p>
        </Card>

        <Card>
          <h2 className="flex items-center gap-2 text-[15px] font-semibold"><span className={cn("grid h-7 w-7 place-items-center rounded-[9px]", TONES.blue)}><UserPlus className="h-3.5 w-3.5" /></span>Derniers inscrits</h2>
          {s.signups.length ? (
            <ul className="mt-1 divide-y divide-[#eee] text-sm">
              {s.signups.map((u, i) => (
                <li key={i} className="flex items-center gap-3 py-2.5">
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", u.tester ? "bg-[#f1f1f1] text-[#616161]" : u.kind === "account" ? TONES.blue : TONES.pink)}>{u.tester ? "Test Shopify" : u.kind === "account" ? "Compte" : "Attente"}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{u.email}{u.ref && <span className="text-[#8a8a8a]"> · via {u.ref}</span>}</span>
                    <span className="block text-xs text-[#8a8a8a]">{formatShortDate(u.at)}{u.offer && <OfferNote offer={u.offer} />}</span>
                    {u.kind === "account" && (
                      <span className="mt-1 inline-flex max-w-full items-center gap-1 truncate rounded-full bg-[#f1f1f1] px-2 py-0.5 text-[11px] text-[#444]">
                        <ShoppingBag className="h-3 w-3" /> {u.shop ? (u.shop.plan ? `Shopify : ${u.shop.plan}` : u.shop.domain) : "Boutique Shopify non indiquée"}
                      </span>
                    )}
                  </span>
                  {u.offer && !u.tester && <OfferBadge offer={u.offer} now={now} />}
                </li>
              ))}
            </ul>
          ) : <p className="mt-2 text-sm text-[#8a8a8a]">Personne pour l'instant.</p>}
        </Card>
      </div>

      <Card>
        <h2 className="flex items-center gap-2 text-[15px] font-semibold"><span className={cn("grid h-7 w-7 place-items-center rounded-[9px]", s.errors.day ? TONES.red : TONES.green)}><AlertTriangle className="h-3.5 w-3.5" /></span>Erreurs du site</h2>
        {s.errors.month ? (
          <>
            <p className="mt-2 text-sm"><b className={s.errors.day ? "text-[#d72c0d]" : ""}>{s.errors.day}</b> sur 24 h · {s.errors.month} sur 30 jours</p>
            <ul className="mt-1 divide-y divide-[#eee] text-sm">
              {s.errors.recent.map((e, i) => (
                <li key={i} className="py-2.5">
                  <span className="block truncate font-medium">{e.path} <span className="font-normal text-[#d72c0d]">· {e.status}</span></span>
                  <span className="block truncate text-xs text-[#8a8a8a]">{formatShortDate(e.at)} · {e.message}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-[#8a8a8a]">Je les regarde chaque matin dans ton topo et je corrige.</p>
          </>
        ) : <p className="mt-2 text-sm text-[#0a8f5f]">Aucune erreur sur 30 jours ✓</p>}
      </Card>

      <Card>
        <h2 className="flex items-center gap-2 text-[15px] font-semibold"><span className={cn("grid h-7 w-7 place-items-center rounded-[9px]", TONES.green)}><ShoppingBag className="h-3.5 w-3.5" /></span>Dernières ventes</h2>
        {s.recent.length ? (
          <ul className="mt-1 divide-y divide-[#eee] text-sm">
            {s.recent.map((r, i) => (
              <li key={i} className="flex items-center gap-3 py-3">
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", r.kind === "cancel" ? "bg-[#fee8e5] text-[#b42318]" : r.kind === "new" ? "bg-[#d9f7e8] text-[#0a6b48]" : "bg-[#f1f1f1] text-[#444]")}>
                  {r.kind === "new" ? "Nouveau" : r.kind === "payment" ? "Paiement" : "Arrêt"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{PLAN_NAME[r.plan ?? ""] ?? r.plan}{r.email && <span className="text-[#8a8a8a]"> · {r.email}</span>}</span>
                  <span className="block text-xs text-[#8a8a8a]">{formatShortDate(r.at)}</span>
                </span>
                {r.kind !== "cancel" && <span className="font-medium tabular-nums">{eur(r.amount)}</span>}
              </li>
            ))}
          </ul>
        ) : <p className="mt-2 text-sm text-[#8a8a8a]">Pas encore de vente. Elles apparaîtront ici dès le premier abonné.</p>}
      </Card>

      <p className="px-1 text-xs text-white/50">En euros, hors paiements de test. L'argent viré sur ton compte : Stripe → Soldes → Virements.</p>
    </div>
  );
}

export default function SalesApp() {
  const [stats, setStats] = useState<OwnerStats | null>(null);
  const [error, setError] = useState<ApiClientError | Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState<"idle" | "sent">("idle");
  const notif = useNotifications();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setStats(await api.getOwnerStats());
      setError(null);
      try { localStorage.setItem("vg-owner", "1"); } catch {} // pour ouvrir Ventes directement (voir app/app/layout)
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Toujours à jour : au retour dans l'app, dès qu'une notification arrive, et toutes les 30 s à l'écran.
  useEffect(() => {
    load();
    const refresh = () => document.visibilityState === "visible" && load();
    const onMessage = (e: MessageEvent) => { if (e.data === "refresh") { load(); if (document.visibilityState === "visible") clearBadge(); } };
    const timer = window.setInterval(refresh, 30_000);
    document.addEventListener("visibilitychange", refresh);
    navigator.serviceWorker?.addEventListener("message", onMessage);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
      navigator.serviceWorker?.removeEventListener("message", onMessage);
    };
  }, [load]);

  // La notification arrive 10 s plus tard : le temps de quitter l'app pour voir la pastille rouge.
  function test() {
    setTesting("sent");
    fetch("/api/owner/test-notification?delay=10", { method: "POST", credentials: "include", headers: api.ownerHeaders() }).catch(() => {});
  }

  const status = error instanceof ApiClientError ? error.status : 0;
  return (
    <main className="mx-auto max-w-[640px] px-4 pt-[max(env(safe-area-inset-top),16px)] sm:px-6">
      <header className="flex items-center justify-between py-2">
        <span className="flex items-center gap-2 text-[17px] font-semibold text-white">
          <img src="/brand/icon-192.png" alt="" className="h-8 w-8 rounded-[10px]" /> Ventes
        </span>
        <span className="flex items-center gap-2">
          {/* Aller dans Vigenia sans être renvoyé ici (voir StandaloneHome). */}
          <Link href="/app" onClick={() => { try { sessionStorage.setItem("vg-stay", "1"); } catch {} }} className="rounded-full bg-white/10 px-3 py-2 text-xs text-white">Vigenia</Link>
          <button type="button" onClick={load} aria-label="Actualiser" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </button>
        </span>
      </header>

      {notif.state === "off" || notif.state === "busy" ? (
        <button type="button" onClick={notif.enable} disabled={notif.state === "busy"} className="mb-3 mt-2 flex w-full items-center gap-3 rounded-[18px] bg-white p-4 text-left text-[#111]">
          <Bell className="h-5 w-5 shrink-0 text-[#0a8f5f]" />
          <span className="flex-1 text-sm"><b className="block">Activer les notifications</b>Une alerte et une pastille rouge à chaque vente.</span>
        </button>
      ) : notif.state === "on" ? (
        <div className="mb-3 mt-1 flex items-center justify-between gap-3 text-xs text-white/70">
          <span className="flex items-center gap-1.5"><Bell className="h-3.5 w-3.5" /> Notifications activées</span>
          <button type="button" onClick={test} disabled={testing === "sent"} className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-white">
            <BellRing className="h-3.5 w-3.5" /> {testing === "sent" ? "Arrive dans 10 s : quitte l'app" : "Tester"}
          </button>
        </div>
      ) : notif.state === "install" ? (
        <p className="mb-3 mt-2 rounded-[18px] bg-white/10 p-4 text-sm text-white/80">Pour les notifications et la pastille rouge : bouton Partager → « Sur l'écran d'accueil », puis ouvre l'app depuis l'icône.</p>
      ) : null}

      {stats ? <Dashboard s={stats} />
        : status === 401 ? (
          <div className="py-24 text-center text-white">
            <p className="text-white/70">Connecte-toi pour voir tes ventes.</p>
            <Link href="/connexion?next=/app/ventes" className="mt-4 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#111]">Se connecter</Link>
          </div>
        ) : error ? <p className="py-24 text-center text-white/70">{error.message}</p>
        : <div className="space-y-3 pt-4">{[0, 1, 2].map((i) => <div key={i} className="h-28 animate-pulse rounded-[18px] bg-white/10" />)}</div>}
    </main>
  );
}
