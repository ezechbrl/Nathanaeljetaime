"use client";

import Link from "next/link";
import { Check, RotateCcw, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/components/app/AppContext";
import { StorePreview } from "@/components/app/StorePreview";
import { Quiz, type DemoProduct } from "@/components/site/Quiz";
import * as api from "@/lib/api/client";
import { useApi } from "@/lib/api/hooks";
import type { Store } from "@/lib/api/types";

// Démo pour les vidéos marketing (réservée au compte d'Ezechiel) : un quiz court, une animation de création,
// puis une de ses vraies boutiques déjà créées. Rien n'est généré, rien n'est payé, rien n'entre dans les stats.
const STEPS = ["Analyse de ton marché", "Nom et identité de ta marque", "Photos de ton produit", "Textes qui donnent envie d'acheter", "Vrais avis clients", "Offres par lot", "Design et mise en page"];
const BUILD_MS = 8_000; // moins de 10 secondes, pour les vidéos

export default function DemoPage() {
  const { user, stores } = useApp();
  const ready = useMemo(() => stores.filter((s) => s.plan), [stores]);
  const [pick, setPick] = useState<string>("");
  const [phase, setPhase] = useState<"quiz" | "build" | "done">("quiz");
  const [run, setRun] = useState(0);
  useEffect(() => { if (!pick && ready.length) setPick(ready[Math.floor(Math.random() * ready.length)].id); }, [ready, pick]);
  const store = ready.find((s) => s.id === pick) ?? null;
  // Produits proposés dans le quiz de la démo : ceux de tes vraies boutiques, avec leur photo produit.
  const [products, setProducts] = useState<DemoProduct[]>([]);
  useEffect(() => {
    let alive = true;
    Promise.all(ready.map(async (s) => {
      const photo = await api.listAssets(s.id).then((r) => r.assets.find((a) => a.kind === "product")?.url ?? r.assets[0]?.url, () => undefined);
      return { id: s.id, name: s.plan?.product?.title || s.name, hint: `Boutique ${s.name}`, photo: photo ?? s.teaser?.image ?? undefined };
    })).then((list) => { if (alive) setProducts(list); });
    return () => { alive = false; };
  }, [ready]);

  if (!user.isOwner) return <p className="p-8 text-fg-muted">Page réservée.</p>;
  return (
    <div className="min-h-dvh">
      {/* Sortir de la démo (sinon il faut relancer l'application). */}
      <Link href="/ventes" className="fixed bottom-24 left-3 z-50 grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white/70 backdrop-blur hover:bg-black/70 hover:text-white" aria-label="Quitter la démo"><X className="h-4 w-4" /></Link>
      {phase === "quiz" && (
        <>
          {/* Réglage discret avant de filmer : la boutique montrée à la fin. */}
          <div className="flex flex-wrap items-center justify-end gap-2 px-5 pt-4 text-xs text-fg-faint">
            <label htmlFor="demo-store">Boutique montrée à la fin :</label>
            <select id="demo-store" value={pick} onChange={(e) => setPick(e.target.value)} className="rounded-ctl border border-white/10 bg-black/30 px-2 py-1 text-fg-muted">
              {ready.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <Quiz key={`${run}-${products.length}`} demo demoProducts={products} onDemoPick={setPick} onFinish={async () => { setPhase("build"); }} />
        </>
      )}
      {phase === "build" && <Build onDone={() => setPhase("done")} />}
      {phase === "done" && store && <Reveal store={store} onAgain={() => { setPhase("quiz"); setRun((n) => n + 1); }} />}
      {phase === "done" && !store && <p className="p-8 text-fg-muted">Aucune boutique terminée à montrer.</p>}
    </div>
  );
}

function Build({ onDone }: { onDone: () => void }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const t0 = Date.now();
    const t = window.setInterval(() => {
      const v = Math.min(100, Math.round(((Date.now() - t0) / BUILD_MS) * 100));
      setP(v);
      if (v >= 100) { window.clearInterval(t); window.setTimeout(onDone, 700); }
    }, 80);
    return () => window.clearInterval(t);
  }, [onDone]);
  const step = Math.min(STEPS.length - 1, Math.floor((p / 100) * STEPS.length));
  const R = 62, C = 2 * Math.PI * R;
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-[clamp(1.8rem,1.3rem+2vw,2.6rem)] font-semibold tracking-[-0.03em]">On construit ta <span className="serif-accent">boutique</span></h1>
      <div className="relative mt-8 grid h-40 w-40 place-items-center">
        <svg viewBox="0 0 140 140" className="absolute inset-0 -rotate-90"><circle cx="70" cy="70" r={R} fill="none" stroke="rgb(255 255 255 / .1)" strokeWidth="8" /><circle cx="70" cy="70" r={R} fill="none" stroke="#14b886" strokeWidth="8" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - p / 100)} style={{ transition: "stroke-dashoffset .1s linear" }} /></svg>
        <span className="text-4xl font-semibold tabular-nums">{p}%</span>
      </div>
      <ul className="mt-8 w-full space-y-2 text-left">
        {STEPS.map((s, i) => (
          <li key={s} className={`flex items-center gap-3 rounded-[12px] border px-4 py-2.5 text-[15px] transition-colors ${i < step ? "border-[#14b886]/40 bg-[#14b886]/10" : i === step ? "border-white/20 bg-white/[0.05]" : "border-white/[0.06] text-fg-faint"}`}>
            <span className={`grid h-6 w-6 place-items-center rounded-full ${i < step ? "bg-[#14b886] text-white" : "border border-white/20"}`}>{i < step ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i === step ? <Sparkles className="h-3.5 w-3.5 animate-pulse text-[#3dff9a]" /> : null}</span>
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Reveal({ store, onAgain }: { store: Store; onAgain: () => void }) {
  const assets = useApi(() => api.listAssets(store.id), [store.id]);
  return (
    <div className="px-4 pb-16 pt-8 sm:px-8 [animation:fade-in_.5s_ease-out_both]">
      <div className="mx-auto max-w-[1100px] text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#14b886]">C'est prêt 🎉</p>
        <h1 className="mt-2 text-[clamp(1.9rem,1.3rem+2vw,2.8rem)] font-semibold tracking-[-0.03em]">Ta boutique <span className="serif-accent">{store.name}</span> est prête</h1>
        <div className="mt-8 overflow-hidden rounded-[16px] border border-white/10 bg-white text-left shadow-[0_30px_80px_-30px_rgb(0_0_0/0.8)]">
          <div className="max-h-[75vh] overflow-y-auto"><StorePreview store={store} assets={assets.data?.assets} /></div>
        </div>
        <button type="button" onClick={onAgain} className="mt-6 inline-flex items-center gap-2 text-sm text-fg-muted hover:text-white"><RotateCcw className="h-4 w-4" /> Recommencer la démo</button>
      </div>
    </div>
  );
}
