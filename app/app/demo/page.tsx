"use client";

import Link from "next/link";
import { Check, RotateCcw, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "@/components/app/AppContext";
import { StorePreview } from "@/components/app/StorePreview";
import { Quiz, type DemoProduct } from "@/components/site/Quiz";
import * as api from "@/lib/api/client";
import { useApi } from "@/lib/api/hooks";
import type { Store } from "@/lib/api/types";

// Démo pour les vidéos marketing (réservée au compte d'Ezechiel) : un quiz court, une animation de création,
// puis une de ses vraies boutiques déjà créées. Rien n'est généré, rien n'est payé, rien n'entre dans les stats.
const STEPS = ["Analyse de ton marché", "Nom et identité de ta marque", "Photos de ton produit", "Textes qui donnent envie d'acheter", "Vrais avis clients", "Offres par lot", "Design et mise en page"];
const BUILD_MS = 6_000; // rapide, pour les vidéos

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
      {phase === "build" && <Build store={store} photo={products.find((x) => x.id === pick)?.photo} onDone={() => setPhase("done")} />}
      {phase === "done" && store && <Reveal store={store} onAgain={() => { setPhase("quiz"); setRun((n) => n + 1); }} />}
      {phase === "done" && !store && <p className="p-8 text-fg-muted">Aucune boutique terminée à montrer.</p>}
    </div>
  );
}

// Écran de création (vidéo) : rapide, avec la vraie boutique choisie qui se monte pièce par pièce dans un téléphone
// (nom, couleurs, photo, prix, atouts, bouton). Toucher l'écran fait aller directement à la fin.
function Build({ store, photo, onDone }: { store: Store | null; photo?: string; onDone: () => void }) {
  const [p, setP] = useState(0);
  const done = useRef(false);
  const finish = useCallback(() => { if (!done.current) { done.current = true; window.setTimeout(onDone, 500); } }, [onDone]);
  useEffect(() => {
    const t0 = Date.now();
    const t = window.setInterval(() => {
      // Démarrage rapide puis léger ralenti à la fin : ça paraît plus vivant qu'une barre régulière.
      const x = Math.min(1, (Date.now() - t0) / BUILD_MS);
      const v = Math.round((1 - Math.pow(1 - x, 1.6)) * 100);
      setP(v);
      if (v >= 100) { window.clearInterval(t); finish(); }
    }, 50);
    return () => window.clearInterval(t);
  }, [finish]);
  const step = Math.min(STEPS.length - 1, Math.floor((p / 100) * STEPS.length));
  const c = store?.theme?.colors ?? { primary: "#14b886", accent: "#3dff9a", background: "#0f1412" };
  const name = store?.name ?? "Ta boutique";
  const typed = name.slice(0, Math.ceil(Math.min(1, p / 22) * name.length));
  const title = store?.plan?.product?.title || store?.teaser?.productTitle || "";
  const price = store?.plan?.product?.price || store?.teaser?.price || "";
  const perks = (store?.teaser?.benefits ?? []).slice(0, 3).map((b) => b.title);
  const show = (at: number) => (p >= at ? "opacity-100 translate-y-0 scale-100" : "pointer-events-none opacity-0 translate-y-3 scale-95");
  return (
    <div onClick={() => { setP(100); finish(); }} className="mx-auto flex min-h-[86vh] max-w-[980px] cursor-pointer flex-col items-center justify-center gap-8 px-5 py-8 lg:flex-row lg:gap-14">
      <div className="w-full max-w-md text-center lg:text-left">
        <h1 className="text-[clamp(1.8rem,1.3rem+2vw,2.6rem)] font-semibold tracking-[-0.03em]">On construit ta <span className="serif-accent">boutique</span></h1>
        <div className="mt-5 flex items-center gap-3">
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[linear-gradient(90deg,#14b886,#3dff9a)] transition-[width] duration-100" style={{ width: `${p}%` }} /></div>
          <span className="w-12 text-right text-lg font-semibold tabular-nums">{p}%</span>
        </div>
        <ul className="mt-5 space-y-1.5 text-left">
          {STEPS.map((s, i) => (
            <li key={s} className={`flex items-center gap-3 rounded-[12px] border px-3.5 py-2 text-[14px] transition-all duration-300 ${i < step ? "border-[#14b886]/40 bg-[#14b886]/10" : i === step ? "scale-[1.02] border-white/25 bg-white/[0.06]" : "border-white/[0.06] text-fg-faint"}`}>
              <span className={`grid h-5 w-5 place-items-center rounded-full ${i < step ? "bg-[#14b886] text-white" : "border border-white/20"}`}>{i < step ? <Check className="h-3 w-3" strokeWidth={3} /> : i === step ? <Sparkles className="h-3 w-3 animate-pulse text-[#3dff9a]" /> : null}</span>
              {s}
            </li>
          ))}
        </ul>
      </div>

      {/* La boutique qui se monte, dans un téléphone. */}
      <div className="relative w-[270px] shrink-0">
        <div aria-hidden className="absolute -inset-8 rounded-full blur-3xl" style={{ background: `radial-gradient(closest-side, ${c.accent}40, transparent)` }} />
        <div className="relative overflow-hidden rounded-[34px] border-[7px] border-[#111] bg-[#111] shadow-[0_30px_80px_-20px_rgb(0_0_0/0.8)]">
          <div className="h-[520px] overflow-hidden rounded-[26px] transition-colors duration-700" style={{ background: p >= 22 ? c.background : "#f4f4f4" }}>
            <div className="flex h-11 items-center justify-center text-[15px] font-bold tracking-tight transition-colors duration-700" style={{ background: p >= 22 ? c.primary : "#e5e5e5", color: p >= 22 ? c.background : "#999" }}>
              {typed}<span className={p < 22 ? "ml-0.5 animate-pulse" : "hidden"}>|</span>
            </div>
            <div className={`mx-3 mt-3 flex gap-1.5 transition-all duration-500 ${show(22)}`}>
              {[c.primary, c.accent, c.background].map((col) => <span key={col} className="h-4 w-8 rounded-full ring-1 ring-black/10" style={{ background: col }} />)}
            </div>
            <div className={`mx-3 mt-3 aspect-square overflow-hidden rounded-[16px] bg-black/5 transition-all duration-700 ${show(38)}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {photo && <img src={photo} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className={`mx-3 mt-3 transition-all duration-500 ${show(55)}`} style={{ color: c.primary }}>
              <p className="line-clamp-2 text-[15px] font-semibold leading-tight">{title}</p>
              {price && <p className="mt-1 text-[14px] font-bold" style={{ color: c.accent }}>{/^\d/.test(price) ? `${price.replace(".", ",")} €` : price}</p>}
            </div>
            <ul className={`mx-3 mt-2 space-y-1 transition-all duration-500 ${show(70)}`}>
              {perks.map((t) => <li key={t} className="flex items-center gap-1.5 text-[11.5px]" style={{ color: c.primary }}><Check className="h-3 w-3 shrink-0" style={{ color: c.accent }} />{t}</li>)}
            </ul>
            <div className={`mx-3 mt-3 transition-all duration-500 ${show(86)}`}>
              <div className="rounded-full py-2.5 text-center text-[13px] font-bold [animation:cta-glow_2.4s_ease-in-out_infinite]" style={{ background: c.accent, color: c.background }}>Ajouter au panier</div>
            </div>
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-fg-faint">Touche l&apos;écran pour passer</p>
      </div>
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
