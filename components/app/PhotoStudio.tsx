"use client";

import { Camera } from "lucide-react";
import { useEffect, useState } from "react";
import * as api from "@/lib/api/client";
import type { Asset } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { FadeImage } from "./PhotoLoading";

// Mini studio photo pendant la création : projecteur, viseur et flash, puis les vraies photos
// arrivent une à une dans la pellicule dès qu'elles sont prêtes.
const SHOTS = ["Packshot", "Gros plan", "En situation", "Ambiance"];

export function PhotoStudio({ storeId, running, done, accent, primary, background }: { storeId: string; running: boolean; done: boolean; accent: string; primary: string; background: string }) {
  const [photos, setPhotos] = useState<Asset[]>([]);
  const [shot, setShot] = useState(0);

  // Les photos sont enregistrées au fil de l'eau : on les relit pendant l'étape « images ».
  useEffect(() => {
    if (!running && !done) return;
    let live = true;
    const load = () => api.listAssets(storeId).then((r) => { if (live) setPhotos(r.assets.filter((a) => a.kind === "product" || a.kind === "lifestyle").slice(0, 4)); }).catch(() => {});
    load();
    if (!running) return () => { live = false; };
    const t = window.setInterval(load, 1500);
    return () => { live = false; window.clearInterval(t); };
  }, [storeId, running, done]);

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => setShot((n) => (n + 1) % SHOTS.length), 1800);
    return () => window.clearInterval(t);
  }, [running]);

  const hero = photos[0];
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-[#0b0f0e]">
      {hero ? (
        <FadeImage src={hero.url} alt="" eager className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <>
          {/* fond de studio + produit éclairé par un projecteur qui balaie */}
          <div className="absolute inset-0" style={{ background: `radial-gradient(70% 60% at 50% 70%, ${background}, #0b0f0e)` }} />
          <div aria-hidden className="absolute -inset-x-1/4 -top-1/3 h-[140%] [animation:studio-spot_3.6s_ease-in-out_infinite] bg-[radial-gradient(closest-side,rgb(255_255_255/0.35),transparent)]" />
          <div className="absolute left-1/2 top-[52%] h-[52%] w-[26%] -translate-x-1/2 -translate-y-1/2 rounded-[18%] shadow-[0_20px_30px_-10px_rgba(0,0,0,.7)]" style={{ background: `linear-gradient(160deg, ${accent}, ${primary})` }} />
          <div className="absolute bottom-[14%] left-1/2 h-[5%] w-[34%] -translate-x-1/2 rounded-full bg-black/50 blur-[6px]" />
        </>
      )}
      {running && (
        <>
          {/* viseur */}
          {["left-2 top-2 border-l-2 border-t-2", "right-2 top-2 border-r-2 border-t-2", "bottom-2 left-2 border-b-2 border-l-2", "bottom-2 right-2 border-b-2 border-r-2"].map((c) => <span key={c} aria-hidden className={cn("absolute h-4 w-4 border-white/80", c)} />)}
          <span className="absolute left-1/2 top-2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[8px] font-semibold text-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" /> <Camera className="h-2.5 w-2.5" /> {SHOTS[shot]} · {Math.min(photos.length + 1, 4)}/4
          </span>
          {/* flash à chaque prise */}
          <span key={shot} aria-hidden className="absolute inset-0 bg-white/60 [animation:flash_.5s_ease-out_both]" />
          {/* pellicule : les vraies photos s'y ajoutent */}
          <div className="absolute inset-x-2 bottom-2 grid grid-cols-4 gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-[4px] border border-white/20 bg-black/40">
                {photos[i] ? <FadeImage src={photos[i].url} alt="" className="h-full w-full object-cover" /> : <span className="absolute inset-0 [animation:photo-sweep_1.6s_ease-in-out_infinite] bg-[linear-gradient(90deg,transparent,rgb(46_230_166/0.3),transparent)]" style={{ animationDelay: `${i * 200}ms` }} />}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
