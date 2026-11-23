"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import * as api from "@/lib/api/client";

const SOURCE: Record<string, string> = { direct: "Direct", google: "Google", tiktok: "TikTok", instagram: "Instagram", facebook: "Facebook", bing: "Bing", youtube: "YouTube", snapchat: "Snapchat" };
const sourceName = (s: string | null) => (!s ? "Direct" : SOURCE[s] ?? (s.startsWith("tiktok-") ? `TikTok (compte ${s.slice(7)})` : s));
const PARIS = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" });
const ago = (iso: string) => { const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000)); return s < 60 ? `il y a ${s} s` : `il y a ${Math.round(s / 60)} min`; };

// Ventes · En direct : qui est sur le site en ce moment et ce qu'il fait (mis à jour toutes les 10 secondes).
export function LiveNow() {
  const [people, setPeople] = useState<api.LivePerson[] | null>(null);
  const [, tick] = useState(0);
  useEffect(() => {
    let alive = true;
    const load = () => api.getOwnerLive().then((r) => alive && setPeople(r.people), () => {});
    load();
    const t = window.setInterval(load, 10_000);
    const s = window.setInterval(() => tick((x) => x + 1), 5_000);
    return () => { alive = false; window.clearInterval(t); window.clearInterval(s); };
  }, []);
  return (
    <section className="min-w-0 overflow-hidden rounded-[18px] bg-white p-4 text-[#111] shadow-[0_10px_30px_-18px_rgb(0_0_0/0.6)] sm:p-5">
      <h2 className="flex items-center gap-2 text-[17px] font-semibold">
        <span className="relative flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10b981] opacity-60" /><span className="relative inline-flex h-3 w-3 rounded-full bg-[#10b981]" /></span>
        En direct <span className="font-normal text-[#8a8a8a]">· {people ? `${people.length} personne${people.length > 1 ? "s" : ""} sur le site` : "chargement…"}</span>
      </h2>
      {people && !people.length && <p className="mt-2 text-sm text-[#8a8a8a]">Personne sur le site en ce moment (actif dans les 3 dernières minutes).</p>}
      {!!people?.length && (
        <ul className="mt-2 divide-y divide-[#eee]">
          {people.map((p) => (
            <li key={p.id} className="py-3">
              <p className="text-[15px] font-semibold leading-snug">{p.doing}</p>
              {p.quiz && !p.quiz.finished && (
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#f1f1f1]"><div className="h-full rounded-full bg-[#10b981]" style={{ width: `${Math.round(((p.quiz.index + 1) / (p.quiz.total || 15)) * 100)}%` }} /></div>
              )}
              <p className="mt-1 text-[13px] text-[#555]">
                {p.email ? <b className="text-[#111]">{p.email}</b> : "Visiteur sans compte"} · {sourceName(p.source)} · {p.device === "mobile" ? "téléphone" : p.device ?? "?"}{p.country ? ` · ${p.country}` : ""}
              </p>
              <p className="text-xs text-[#8a8a8a]">Arrivé à {PARIS.format(new Date(p.since))} · {p.pages ?? 1} page{(p.pages ?? 1) > 1 ? "s" : ""} vue{(p.pages ?? 1) > 1 ? "s" : ""} · dernière action {ago(p.lastSeen)}{p.checkout ? " · a ouvert le paiement" : ""}</p>
              {p.store && <Link href={`/ventes/boutique/${p.store.id}`} className="mt-1.5 inline-flex rounded-full bg-[#e8f7f0] px-2 py-0.5 text-[11.5px] font-medium text-[#0a6e4a] hover:bg-[#d3f0e3]">Voir son aperçu « {p.store.name} » →</Link>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
