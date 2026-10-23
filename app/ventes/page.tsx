"use client";

import { Bell, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import * as api from "@/lib/api/client";
import { ApiClientError } from "@/lib/api/errors";
import type { OwnerStats } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { formatMoney, formatShortDate } from "@/lib/format";

// « Vigenia Ventes » : le tableau de bord du fondateur, en noir et blanc, pensé pour le téléphone.

const PERIODS = [
  { id: "today", label: "Aujourd'hui" },
  { id: "week", label: "7 jours" },
  { id: "month", label: "30 jours" },
] as const;
const PLAN_NAME: Record<string, string> = { pro: "Starter", agency: "Pro" };
const eur = (cents: number) => formatMoney(cents, "EUR");
const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64: string) {
  const raw = atob((base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

// Notifications push + pastille rouge : uniquement depuis l'app ajoutée à l'écran d'accueil (exigence d'iOS).
function useNotifications() {
  const [state, setState] = useState<"unsupported" | "install" | "off" | "on" | "busy">("unsupported");
  useEffect(() => {
    // Cette app d'écran d'accueil est « Ventes » : après une connexion, on y revient directement.
    if (window.matchMedia("(display-mode: standalone)").matches) try { localStorage.setItem("vg-home", "/ventes"); } catch {}
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").then(async (reg) => {
      reg.active?.postMessage("clear-badge");
      (navigator as Navigator & { clearAppBadge?: () => Promise<void> }).clearAppBadge?.().catch(() => {});
      const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone;
      if (!("PushManager" in window) || !VAPID) return setState(standalone || !VAPID ? "unsupported" : "install");
      const sub = await reg.pushManager.getSubscription();
      setState(sub && Notification.permission === "granted" ? "on" : "off");
    }).catch(() => {});
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

function Stat({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
      <p className="text-[13px] text-white/50">{label}</p>
      <p className={cn("mt-1.5 text-[1.75rem] font-semibold leading-none tracking-[-0.03em] tabular-nums", tone === "up" && "text-[#4ade80]", tone === "down" && "text-[#f87171]")}>{value}</p>
    </div>
  );
}

function Chart({ series }: { series: OwnerStats["series"] }) {
  const max = Math.max(...series.map((d) => d.revenue), 1);
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[15px] font-medium">30 derniers jours</h2>
        <span className="text-sm tabular-nums text-white/50">{eur(series.reduce((t, d) => t + d.revenue, 0))}</span>
      </div>
      <div className="mt-4 flex h-32 items-end gap-[3px]" role="img" aria-label="Revenus par jour">
        {series.map((d) => (
          <div key={d.day} title={`${formatShortDate(d.day)} · ${eur(d.revenue)}`} className={cn("flex-1 rounded-t-[2px]", d.revenue ? "bg-white" : "bg-white/[0.08]")} style={{ height: `${d.revenue ? Math.max(6, (d.revenue / max) * 100) : 3}%` }} />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-white/35"><span>{formatShortDate(series[0].day)}</span><span>Aujourd'hui</span></div>
    </section>
  );
}

function Dashboard({ s }: { s: OwnerStats }) {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]["id"]>("today");
  const p = s.periods[period];
  return (
    <div className="space-y-4">
      <section className="pb-2 pt-4">
        <p className="text-[13px] text-white/50">Revenu mensuel récurrent</p>
        <p className="mt-1 text-[clamp(3rem,2rem+5vw,4.5rem)] font-semibold leading-none tracking-[-0.045em] tabular-nums">{eur(s.mrr)}</p>
        <p className="mt-3 text-sm text-white/50">
          {s.subscribers.total} abonné{s.subscribers.total > 1 ? "s" : ""} · {s.subscribers.starter} Starter · {s.subscribers.pro} Pro · {s.totals.waitlist} en attente
        </p>
      </section>

      <div role="tablist" aria-label="Période" className="grid grid-cols-3 rounded-full bg-white/[0.06] p-1">
        {PERIODS.map((x) => (
          <button key={x.id} type="button" role="tab" aria-selected={period === x.id} onClick={() => setPeriod(x.id)} className={cn("rounded-full py-2 text-sm font-medium transition-colors", period === x.id ? "bg-white text-black" : "text-white/60")}>
            {x.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Encaissé" value={eur(p.revenue)} />
        <Stat label="Nouveaux abonnés" value={`+${p.newSubs}`} tone={p.newSubs ? "up" : undefined} />
        <Stat label="Désabonnements" value={p.cancels ? `−${p.cancels}` : "0"} tone={p.cancels ? "down" : undefined} />
        <Stat label="Inscrits" value={`+${p.waitlist + p.accounts}`} />
      </div>

      <Chart series={s.series} />

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
        <h2 className="text-[15px] font-medium">Dernières ventes</h2>
        {s.recent.length ? (
          <ul className="mt-2 divide-y divide-white/[0.06] text-sm">
            {s.recent.map((r, i) => (
              <li key={i} className="flex items-center gap-3 py-3">
                <span className={cn("h-2 w-2 shrink-0 rounded-full", r.kind === "cancel" ? "bg-[#f87171]" : "bg-[#4ade80]")} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{r.kind === "new" ? "Nouvel abonné" : r.kind === "payment" ? "Paiement" : "Désabonnement"} · {PLAN_NAME[r.plan ?? ""] ?? r.plan}</span>
                  {r.email && <span className="block truncate text-xs text-white/40">{r.email}</span>}
                </span>
                <span className="text-right">
                  {r.kind !== "cancel" && <span className="block tabular-nums">{eur(r.amount)}</span>}
                  <span className="block text-xs text-white/40">{formatShortDate(r.at)}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : <p className="mt-2 text-sm text-white/50">Pas encore de vente. Elles apparaîtront ici dès le premier abonné.</p>}
      </section>

      {s.affiliates.length > 0 && (
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
          <h2 className="text-[15px] font-medium">Affiliation</h2>
          <ul className="mt-2 divide-y divide-white/[0.06] text-sm">
            {s.affiliates.map((a) => (
              <li key={a.code} className="flex items-center gap-3 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{a.name}</span>
                  <span className="block text-xs text-white/40">{a.clicks} clics · {a.signups} inscrits · {a.customers} clients</span>
                </span>
                <span className="text-right">
                  <span className="block tabular-nums">{eur(a.commission)}</span>
                  <span className="block text-xs text-white/40">à reverser</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="px-1 pb-8 text-xs text-white/35">En euros, hors paiements de test. L'argent viré sur ton compte : Shopify Partners → Versements.</p>
    </div>
  );
}

export default function SalesApp() {
  const [stats, setStats] = useState<OwnerStats | null>(null);
  const [error, setError] = useState<ApiClientError | Error | null>(null);
  const [loading, setLoading] = useState(false);
  const notif = useNotifications();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setStats(await api.getOwnerStats());
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const refresh = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", refresh);
    return () => document.removeEventListener("visibilitychange", refresh);
  }, [load]);

  const status = error instanceof ApiClientError ? error.status : 0;
  return (
    <main className="mx-auto max-w-[560px] px-4 pt-[max(env(safe-area-inset-top),16px)]">
      <header className="flex items-center justify-between py-2">
        <span className="flex items-center gap-2 text-[15px] font-semibold">
          <img src="/brand/ventes-180.png" alt="" className="h-7 w-7 rounded-lg" /> Ventes
        </span>
        <button type="button" onClick={load} aria-label="Actualiser" className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.06]">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </button>
      </header>

      {notif.state === "off" || notif.state === "busy" ? (
        <button type="button" onClick={notif.enable} disabled={notif.state === "busy"} className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left text-black">
          <Bell className="h-5 w-5 shrink-0" />
          <span className="flex-1 text-sm"><b className="block">Activer les notifications</b>Une alerte et une pastille rouge à chaque vente.</span>
        </button>
      ) : notif.state === "on" ? (
        <p className="mt-1 flex items-center gap-1.5 text-xs text-white/40"><Bell className="h-3.5 w-3.5" /> Notifications activées</p>
      ) : notif.state === "install" ? (
        <p className="mt-3 rounded-2xl border border-white/[0.08] p-4 text-sm text-white/60">Pour les notifications et la pastille rouge : bouton Partager → « Sur l'écran d'accueil », puis ouvre l'app depuis l'icône.</p>
      ) : null}

      {stats ? <Dashboard s={stats} />
        : status === 401 ? (
          <div className="py-24 text-center">
            <p className="text-white/60">Connecte-toi pour voir tes ventes.</p>
            <Link href="/connexion?next=/app/ventes" className="mt-4 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black">Se connecter</Link>
          </div>
        ) : error ? <p className="py-24 text-center text-white/60">{error.message}</p>
        : <div className="space-y-4 pt-6">{[0, 1, 2].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/[0.05]" />)}</div>}
    </main>
  );
}
