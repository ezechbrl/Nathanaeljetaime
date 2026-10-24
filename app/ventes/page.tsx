"use client";

import {
  AlertTriangle, BadgeCheck, Bell, BellRing, CalendarRange, Eye, Gauge, Hourglass, Percent, Receipt, RefreshCw,
  ShoppingBag, TrendingDown, TrendingUp, UserPlus, Users, Wallet,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as api from "@/lib/api/client";
import { ApiClientError } from "@/lib/api/errors";
import type { OwnerStats } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { formatMoney, formatShortDate } from "@/lib/format";

// « Vigenia Ventes » : le tableau de bord du fondateur, façon admin Shopify (cartes blanches sur le fond vert).

const PERIODS = [
  { id: "today", label: "Aujourd'hui" },
  { id: "week", label: "7 jours" },
  { id: "month", label: "30 jours" },
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
  return <section className={cn("rounded-[18px] bg-white p-4 text-[#111] shadow-[0_10px_30px_-18px_rgb(0_0_0/0.6)] sm:p-5", className)}>{children}</section>;
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
    <Card>
      <span className="mb-2 flex h-8 items-center gap-2"><span className="relative flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10b981] opacity-60" /><span className="relative inline-flex h-3 w-3 rounded-full bg-[#10b981]" /></span><span className="text-xs font-medium text-[#0a8f5f]">En direct</span></span>
      <p className="text-[13px] text-[#616161]">En ce moment sur le site</p>
      <p className="mt-1 text-[1.6rem] font-semibold leading-tight tracking-[-0.02em] tabular-nums">{count}</p>
      <p className="mt-0.5 text-xs text-[#8a8a8a]">visiteur{count > 1 ? "s" : ""} actif{count > 1 ? "s" : ""}</p>
    </Card>
  );
}

function Metric({ label, value, hint, tone, icon: Icon, color = "green" }: { label: string; value: string; hint?: string; tone?: "up" | "down"; icon: React.ComponentType<{ className?: string }>; color?: keyof typeof TONES }) {
  return (
    <Card>
      <span className={cn("mb-2 grid h-8 w-8 place-items-center rounded-[10px]", TONES[color])}><Icon className="h-4 w-4" /></span>
      <p className="text-[13px] text-[#616161]">{label}</p>
      <p className={cn("mt-1 text-[1.6rem] font-semibold leading-tight tracking-[-0.02em] tabular-nums", tone === "up" && "text-[#0a8f5f]", tone === "down" && "text-[#d72c0d]")}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-[#8a8a8a]">{hint}</p>}
    </Card>
  );
}

// Courbe lissée (Catmull-Rom → Bézier) avec zone dégradée et valeur au doigt / à la souris.
function LineChart({ points, format }: { points: { label: string; value: number }[]; format: (n: number) => string }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 320, H = 140, P = 6;
  const max = Math.max(...points.map((p) => p.value), 1);
  const xy = points.map((p, i) => [P + (i * (W - 2 * P)) / Math.max(points.length - 1, 1), H - P - (p.value / max) * (H - 2 * P - 10)] as const);
  const line = xy.reduce((d, [x, y], i) => {
    if (i === 0) return `M${x},${y}`;
    const [x0, y0] = xy[i - 2] ?? xy[i - 1];
    const [x1, y1] = xy[i - 1];
    const [x3, y3] = xy[i + 1] ?? [x, y];
    const lo = Math.min(y1, y), hi = Math.max(y1, y); // pas de creux sous zéro entre deux points
    const c1 = Math.min(hi, Math.max(lo, y1 + (y - y0) / 6)), c2 = Math.min(hi, Math.max(lo, y - (y3 - y1) / 6));
    return `${d} C${x1 + (x - x0) / 6},${c1} ${x - (x3 - x1) / 6},${c2} ${x},${y}`;
  }, "");
  const area = `${line} L${xy[xy.length - 1][0]},${H} L${xy[0][0]},${H} Z`;
  const pick = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setHover(Math.round(((e.clientX - r.left) / r.width) * (points.length - 1)));
  };
  const h = hover !== null ? Math.min(points.length - 1, Math.max(0, hover)) : null;
  return (
    <div className="relative">
      {h !== null && (
        <div className="pointer-events-none absolute -top-1 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#111] px-2.5 py-1.5 text-xs text-white" style={{ left: `${Math.min(85, Math.max(15, (xy[h][0] / W) * 100))}%` }}>
          <span className="block text-white/60">{points[h].label}</span>
          <span className="font-semibold tabular-nums">{format(points[h].value)}</span>
        </div>
      )}
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="mt-8 h-40 w-full touch-none" onPointerMove={pick} onPointerDown={pick} onPointerLeave={() => setHover(null)} role="img" aria-label="Courbe">
        <defs>
          <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#10b981" stopOpacity="0.28" />
            <stop offset="1" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="#ececec" strokeWidth="1" vectorEffect="non-scaling-stroke" />)}
        <path d={area} fill="url(#area)" />
        <path d={line} fill="none" stroke="#0a8f5f" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {h !== null && <line x1={xy[h][0]} x2={xy[h][0]} y1="0" y2={H} stroke="#111" strokeOpacity="0.25" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />}
      </svg>
      <div className="mt-1 flex justify-between text-[11px] text-[#8a8a8a]"><span>{points[0].label}</span><span>{points[points.length - 1].label}</span></div>
    </div>
  );
}

// Aujourd'hui : cumul heure par heure (comme « ventes du jour » dans Shopify).
function cumulate(rows: { label: string; revenue: number; signups: number; visits: number }[]) {
  let r = 0, g = 0, v = 0;
  return rows.map((x) => ({ ...x, revenue: (r += x.revenue), signups: (g += x.signups), visits: (v += x.visits) }));
}

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

function Dashboard({ s }: { s: OwnerStats }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(t);
  }, []);
  const [period, setPeriod] = useState<PeriodId>("today");
  const [metric, setMetric] = useState<"revenue" | "signups" | "visits">("revenue");
  const p = s.periods[period];

  const points = useMemo(() => {
    const rows = period === "today"
      ? cumulate(s.hours.slice(0, new Date().getHours() + 1).map((x) => ({ label: `${x.hour} h`, revenue: x.revenue, signups: x.signups, visits: x.visits })))
      : s.series.slice(period === "week" ? -7 : -30).map((x) => ({ label: formatShortDate(x.day), revenue: x.revenue, signups: x.signups, visits: x.visits }));
    return rows.map((r) => ({ label: r.label, value: r[metric] }));
  }, [s, period, metric]);

  const aff = s.affiliates.reduce((t, a) => ({ clicks: t.clicks + a.clicks, signups: t.signups + a.signups, customers: t.customers + a.customers, commission: t.commission + a.commission }), { clicks: 0, signups: 0, customers: 0, commission: 0 });
  const subs = s.subscribers.total || 1;

  return (
    <div className="space-y-3 pb-10">
      <div role="tablist" aria-label="Période" className="grid grid-cols-3 rounded-full bg-black/25 p-1 backdrop-blur">
        {PERIODS.map((x) => (
          <button key={x.id} type="button" role="tab" aria-selected={period === x.id} onClick={() => setPeriod(x.id)} className={cn("rounded-full py-2 text-sm font-medium transition-colors", period === x.id ? "bg-white text-[#111]" : "text-white/75")}>
            {x.label}
          </button>
        ))}
      </div>

      {/* Carte principale : encaissé + courbe */}
      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[13px] text-[#616161]">Total encaissé</p>
            <p className="mt-0.5 text-[2.2rem] font-semibold leading-none tracking-[-0.03em] tabular-nums">{eur(p.revenue)}</p>
            <p className="mt-1.5 text-xs text-[#8a8a8a]">{p.sales} vente{p.sales > 1 ? "s" : ""} · {p.newSubs} nouvel{p.newSubs > 1 ? "s" : ""} abonné{p.newSubs > 1 ? "s" : ""}</p>
          </div>
          <div className="flex rounded-full bg-[#f1f1f1] p-0.5 text-xs">
            {(["revenue", "visits", "signups"] as const).map((m) => (
              <button key={m} type="button" onClick={() => setMetric(m)} className={cn("rounded-full px-2 py-1 font-medium", metric === m ? "bg-white shadow-sm" : "text-[#616161]")}>{m === "revenue" ? "Revenus" : m === "visits" ? "Visites" : "Inscrits"}</button>
            ))}
          </div>
        </div>
        <LineChart points={points} format={metric === "revenue" ? eur : (n) => `${n} ${metric === "visits" ? "visite" : "inscrit"}${n > 1 ? "s" : ""}`} />
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Live count={s.liveNow} />
        <Metric icon={Eye} color="amber" label="Visites" value={String(p.visits)} hint={period === "today" ? "Aujourd'hui" : period === "week" ? "Sur 7 jours" : "Sur 30 jours"} />
        <Metric icon={Percent} color="violet" label="Conversion" value={p.visits ? pct((p.waitlist + p.accounts) / p.visits) : "—"} hint="Visiteurs devenus inscrits" />
        <Metric icon={Wallet} color="green" label="MRR" value={eur(s.mrr)} hint="Revenu mensuel récurrent" />
        <Metric icon={CalendarRange} color="green" label="ARR" value={eur(s.arr)} hint="Sur un an, au rythme actuel" />
        <Metric icon={Users} color="blue" label="Abonnés actifs" value={String(s.subscribers.total)} hint={`${s.subscribers.starter} Starter · ${s.subscribers.pro} Pro`} />
        <Metric icon={TrendingUp} color="violet" label="Nouveaux abonnés" value={`+${p.newSubs}`} tone={p.newSubs ? "up" : undefined} />
        <Metric icon={TrendingDown} color="red" label="Désabonnements" value={p.cancels ? `−${p.cancels}` : "0"} tone={p.cancels ? "down" : undefined} hint={`Taux sur 30 j : ${pct(s.churn)}`} />
        <Metric icon={Hourglass} color="pink" label="Liste d'attente" value={`+${p.waitlist}`} hint={`${s.totals.waitlist} au total`} />
        <Metric icon={UserPlus} color="blue" label="Comptes créés" value={`+${p.accounts}`} hint={`${s.totals.accounts} au total`} />
        <Metric icon={Receipt} color="green" label="Ventes" value={String(p.sales)} hint="Paiements reçus" />
        <Metric icon={BadgeCheck} color="green" label="Comptes → abonnés" value={pct(s.conversion)} hint="Comptes devenus payants" />
      </div>

      <div className="grid gap-3">
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

      <div className="grid gap-3">
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
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#f1f1f1] px-2 py-0.5 text-[11px] text-[#444]">
                        <ShoppingBag className="h-3 w-3" /> {u.shop ? `Shopify : ${u.shop.plan ?? "forfait inconnu"}` : "Pas de boutique Shopify connectée"}
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

      <p className="px-1 text-xs text-white/50">En euros, hors paiements de test. L'argent viré sur ton compte : Shopify Partners → Versements.</p>
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
