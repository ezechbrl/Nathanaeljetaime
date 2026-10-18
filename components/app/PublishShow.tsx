"use client";

import { Check, ExternalLink, FileText, Globe, Package, Palette, ShoppingBag, Tag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Job, JobStepKey, Store } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { shopifyLinks } from "@/lib/shopify-links";
import { useLiveProgress } from "@/lib/use-progress";
import { Confetti } from "./LaunchCelebration";
import { ThemeImportCard } from "./ThemeImportCard";

export const PUBLISH_LIVE_KEY = "vitrio-publish-live";

const STEP_ICON: Partial<Record<JobStepKey, typeof Package>> = { product: Package, publish: Tag, pages: FileText, theme: Palette };
const STEP_LINE: Partial<Record<JobStepKey, string>> = {
  product: "J'envoie ton produit, son prix et ses photos…",
  publish: "Je le mets en vente sur ta boutique en ligne…",
  pages: "J'installe ta FAQ et ta page « Notre histoire »…",
  theme: "J'installe ton thème Vitrio à tes couleurs…",
};

const PATH = "M70,150 C190,10 370,10 490,150";

function useElapsed() {
  const [s, setS] = useState(0);
  useEffect(() => {
    const t0 = Date.now();
    const id = setInterval(() => setS(Math.floor((Date.now() - t0) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// La scène est dessinée en 560×220 puis mise à l'échelle (offset-path travaille en pixels).
function useFit(width: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setK(Math.min(1, e.contentRect.width / width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);
  return [ref, k] as const;
}

// Écran plein pendant la publication : les éléments de la boutique voyagent de Vitrio vers Shopify.
export function PublishProgress({ store, job }: { store: Store; job: Job }) {
  const elapsed = useElapsed();
  const pct = useLiveProgress(job.progress);
  const running = job.steps.find((s) => s.status === "running") ?? job.steps.find((s) => s.status === "pending");
  const done = job.steps.filter((s) => s.status === "done");
  const c = store.theme.colors;
  const RunIcon = (running && STEP_ICON[running.key]) || Package;
  const [fitRef, k] = useFit(560);

  return (
    <div role="dialog" aria-modal="true" aria-label="Publication en cours" className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-[#040d0b] p-5 [animation:fade-in_.3s_ease-out]">
      {/* Même fond animé que l'écran de création */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-[20%] -top-[30%] h-[80vh] w-[70vw] rounded-full bg-[radial-gradient(closest-side,rgb(16_176_127/0.28),transparent)] [animation:aurora_14s_ease-in-out_infinite]" />
        <div className="absolute -bottom-[30%] right-[-10%] h-[70vh] w-[60vw] rounded-full bg-[radial-gradient(closest-side,rgb(104_230_176/0.16),transparent)] [animation:aurora_18s_ease-in-out_infinite_reverse]" />
      </div>
      <div className="relative w-full max-w-[600px] text-center [animation:rise_.5s_cubic-bezier(.2,.8,.2,1)_both]">
        <p className="inline-flex items-center gap-2 text-sm text-fg-muted">
          <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" /><span className="relative h-2 w-2 rounded-full bg-accent" /></span>
          Publication en cours · <span className="tabular-nums">{elapsed}</span>
        </p>
        <h2 className="mt-3 text-h2">On met ta boutique <span className="serif-accent">en ligne</span></h2>

        {/* Le voyage : Vitrio → Shopify */}
        <div ref={fitRef} className="relative mx-auto mt-6 aspect-[560/220] w-full max-w-[560px]">
          <div className="absolute left-0 top-0 h-[220px] w-[560px] origin-top-left" style={{ transform: `scale(${k})` }}>
          <svg viewBox="0 0 560 220" className="absolute inset-0 h-full w-full" aria-hidden>
            <defs>
              <linearGradient id="pub-line" x1="0" x2="1"><stop offset="0" stopColor="rgb(104 230 176)" /><stop offset="1" stopColor={c.accent} /></linearGradient>
            </defs>
            <path d={PATH} fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="2" />
            <path d={PATH} fill="none" stroke="url(#pub-line)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 12" className="[animation:flow-dash_1s_linear_infinite]" />
          </svg>
          {[0, 0.5, 1, 1.5].map((d) => (
            <span key={d} aria-hidden className="absolute left-0 top-0 h-2 w-2 rounded-full bg-accent shadow-[0_0_14px_3px_rgb(104_230_176/.7)]" style={{ offsetPath: `path("${PATH}")`, animation: `travel 2s ${d}s cubic-bezier(.45,0,.55,1) infinite` } as React.CSSProperties} />
          ))}
          {running && (
            <span key={running.key} aria-hidden className="absolute left-0 top-0 grid h-11 w-11 place-items-center rounded-xl border border-white/15 bg-white text-[#0f312c] shadow-[0_12px_30px_-8px_rgb(0_0_0/.6)]" style={{ offsetPath: `path("${PATH}")`, offsetRotate: "0deg", animation: "travel 2.4s cubic-bezier(.45,0,.55,1) infinite" } as React.CSSProperties}>
              <RunIcon className="h-5 w-5" />
            </span>
          )}

          {/* Départ */}
          <div className="absolute left-[70px] top-[150px] grid -translate-x-1/2 -translate-y-1/2 place-items-center">
            <span className="grid h-16 w-16 place-items-center rounded-2xl border border-accent/30 bg-accent-deep/60 text-2xl font-semibold text-accent shadow-[0_0_40px_-6px_rgb(104_230_176/.5)]">V</span>
            <span className="mt-2 text-xs text-fg-muted">Vitrio</span>
          </div>
          {/* Arrivée : la vitrine se remplit */}
          <div className="absolute left-[490px] top-[150px] grid -translate-x-1/2 -translate-y-1/2 place-items-center">
            <span className="relative grid h-16 w-16 place-items-center rounded-2xl border border-white/15 bg-white shadow-[0_0_50px_-8px_rgb(255_255_255/.35)]" style={{ color: c.accent }}>
              <ShoppingBag className="h-7 w-7" />
              {done.length > 0 && <span key={done.length} className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-accent text-[11px] font-semibold text-[#0f312c] [animation:pop-in_.4s_cubic-bezier(.34,1.56,.64,1)]">{done.length}</span>}
              <span key={`ring-${done.length}`} className="absolute inset-0 rounded-2xl border-2 border-accent opacity-0 [animation:ring-out_1s_ease-out]" />
            </span>
            <span className="mt-2 text-xs text-fg-muted">Ta boutique Shopify</span>
          </div>
          </div>
        </div>

        <p key={running?.key} className="mx-auto mt-2 min-h-[24px] max-w-md text-[15px] [animation:fade-in_.4s_ease-out]" aria-live="polite">{running ? STEP_LINE[running.key] ?? running.label : "Dernières vérifications…"}</p>

        <div className="mx-auto mt-5 max-w-md">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className="relative h-full overflow-hidden rounded-full bg-accent transition-[width] duration-500 ease-out" style={{ width: `${Math.max(pct, 3)}%` }}>
              <span className="absolute inset-0 animate-shimmer bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.55),transparent)] bg-[length:200%_100%]" />
            </div>
          </div>
          <ul className="mt-5 grid gap-2 text-left sm:grid-cols-2">
            {job.steps.map((s) => {
              const I = STEP_ICON[s.key] ?? Package;
              return (
                <li key={s.key} className={cn("flex items-center gap-3 rounded-ctl border px-3 py-2.5 text-sm transition-all duration-500", s.status === "done" ? "border-accent/30 bg-accent-deep/30 text-fg" : s.status === "running" ? "border-white/15 bg-white/[0.05] text-fg" : "border-white/[0.06] text-fg-faint")}>
                  <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full", s.status === "done" ? "bg-accent text-[#0f312c]" : "bg-white/[0.06]")}>
                    {s.status === "done" ? <Check className="h-4 w-4 [animation:pop-in_.3s_ease-out]" /> : s.status === "running" ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent border-r-transparent" /> : <I className="h-3.5 w-3.5" />}
                  </span>
                  {s.label}
                </li>
              );
            })}
          </ul>
        </div>
        <p className="mt-6 text-xs text-fg-faint">Ne ferme pas cette page : ça prend en général moins d'une minute.</p>
      </div>
    </div>
  );
}

// Fin de publication : la boutique est en ligne (ou prête en aperçu).
export function PublishedCelebration({ store, live, onClose }: { store: Store; live: boolean; onClose: () => void }) {
  const c = store.theme.colors;
  const shop = store.liveUrl?.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const links = shopifyLinks(store.liveUrl);
  const adminThemes = links?.themes;
  const manual = store.themeStatus === "manual";
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label="Boutique publiée" onClick={onClose} className="fixed inset-0 z-50 grid place-items-center bg-[#061815]/85 p-5 backdrop-blur-md [animation:fade-in_.4s_ease-out]">
      {live && <Confetti colors={[c.accent, c.primary, "#68e6b0", "#ffffff", "#f5c451"]} />}
      <div onClick={(e) => e.stopPropagation()} className={cn("relative max-h-[92dvh] w-full overflow-y-auto text-center [animation:rise_.6s_.1s_cubic-bezier(.2,.8,.2,1)_both]", manual ? "max-w-[560px]" : "max-w-[480px]")}>
        <div className="relative mx-auto grid h-24 w-24 place-items-center">
          <span className="absolute inset-0 rounded-full border-2 border-accent [animation:ring-out_1.6s_.3s_ease-out_infinite]" />
          <span className="absolute inset-0 rounded-full border-2 border-accent [animation:ring-out_1.6s_.9s_ease-out_infinite]" />
          <span className="grid h-20 w-20 place-items-center rounded-full bg-[linear-gradient(160deg,#10b07f,#00876a)] text-white shadow-[0_0_60px_rgb(16_176_127/.6)] [animation:pop-in_.5s_.2s_cubic-bezier(.34,1.56,.64,1)_both]">
            <Globe className="h-10 w-10" />
          </span>
        </div>
        <p className="mt-7 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-deep/40 px-3 py-1 text-sm text-accent">
          <span className="h-2 w-2 animate-pulse rounded-full bg-accent" /> {live ? "En ligne" : "Prête en aperçu"}
        </p>
        <h2 className="mt-4 text-h2">{manual ? <>Plus qu'<span className="serif-accent">une étape</span></> : live ? <>Ta boutique est <span className="serif-accent">en ligne</span></> : <>Tout est dans <span className="serif-accent">Shopify</span></>}</h2>
        <p className="mx-auto mt-3 max-w-sm text-fg-muted">
          {store.themeStatus === "manual"
            ? <>Ton produit, tes prix et tes photos sont dans Shopify. Installe maintenant le design Vitrio de ta boutique :</>
            : live
            ? <>{store.name} est publiée sur Shopify avec son thème, son produit et ses pages.{shop ? <> Adresse : <span className="text-fg">{shop}</span></> : null}</>
            : <>Produit, pages et thème Vitrio sont installés. Ton ancien thème reste affiché tant que tu ne publies pas le nouveau depuis Shopify → Thèmes.</>}
        </p>
        {manual && <ThemeImportCard store={store} compact />}
        <p className="mx-auto mt-2 max-w-sm text-xs text-fg-faint">Boutique de test ou protégée par mot de passe ? {links ? <a href={links.password} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-fg">Voir le mot de passe dans Shopify</a> : "Le mot de passe est dans Shopify → Boutique en ligne → Préférences."}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {store.liveUrl && !manual && (
            <a href={store.liveUrl} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-ctl border border-accent/40 bg-[linear-gradient(180deg,#10b07f,#00876a)] px-5 text-[15px] font-medium text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_10px_30px_-8px_rgb(16_176_127/0.7)]">
              Voir ma boutique <ExternalLink className="h-4 w-4" />
            </a>
          )}
          {!manual && !live && adminThemes ? (
            <a href={adminThemes} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-ctl border border-white/15 px-5 text-[15px] text-fg hover:bg-white/5">Ouvrir mes thèmes Shopify</a>
          ) : (
            <button type="button" autoFocus onClick={onClose} className="inline-flex h-11 items-center justify-center rounded-ctl border border-white/15 px-5 text-[15px] text-fg hover:bg-white/5">Continuer</button>
          )}
        </div>
      </div>
    </div>
  );
}
