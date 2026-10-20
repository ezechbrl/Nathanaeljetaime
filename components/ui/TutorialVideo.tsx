"use client";

import { Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

// Lecture automatique, sans son, seulement quand la vidéo est visible à l'écran.
function useAutoplay() {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }, { threshold: 0.3 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return { ref, playing, setPlaying };
}

// Version téléphone : vidéo verticale filmée à la taille d'un téléphone, dans un cadre de téléphone.
function PhoneVideo({ name, title }: { name: string; title: string }) {
  const { ref, playing, setPlaying } = useAutoplay();
  return (
    <figure className="mx-auto w-full max-w-[300px] sm:hidden">
      <div className="relative overflow-hidden rounded-[36px] border-[7px] border-[#0b0f12] bg-black shadow-[0_30px_70px_-25px_rgb(0_0_0/.9),0_0_40px_-10px_rgb(46_230_166/.45)]">
        <video ref={ref} muted loop playsInline preload="metadata" poster={`/videos/${name}.jpg`} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} className="block aspect-[390/844] w-full object-cover" aria-label={title}>
          <source src={`/videos/${name}.mp4`} type="video/mp4" />
          <source src={`/videos/${name}.webm`} type="video/webm" />
        </video>
        {!playing && (
          <button type="button" onClick={() => ref.current?.play()} aria-label="Lire la vidéo" className="absolute inset-0 grid place-items-center bg-black/20">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-white/90 text-[#0b1f1b] shadow-xl"><Play className="ml-1 h-6 w-6" /></span>
          </button>
        )}
      </div>
    </figure>
  );
}

// Courte vidéo de démonstration (enregistrement réel de l'app, accéléré), lue en boucle et sans son
// dès qu'elle est visible. Cadre façon fenêtre de navigateur. Avec `mobile`, les téléphones voient
// à la place la version verticale.
export function TutorialVideo({ name, title, speed, className, mobile }: { name: string; title: string; speed?: string; className?: string; mobile?: string }) {
  const { ref, playing, setPlaying } = useAutoplay();
  return (
    <>
    {mobile && <PhoneVideo name={mobile} title={title} />}
    <figure className={cn("mx-auto w-full max-w-[860px]", mobile && "hidden sm:block", className)}>
      <div className="overflow-hidden rounded-[16px] border border-white/10 bg-[#0b1f1b] shadow-[0_40px_90px_-40px_rgb(0_0_0/.9),0_0_0_1px_rgb(104_230_176/.08)]">
        <div className="flex items-center gap-2 border-b border-white/[0.07] px-3 py-2">
          <span className="flex gap-1.5" aria-hidden><span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" /><span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" /><span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" /></span>
          <span className="flex-1 truncate text-center text-xs text-fg-muted">{title}</span>
          {speed && <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-medium text-accent">Accéléré {speed}</span>}
        </div>
        <div className="relative">
          <video
            ref={ref}
            muted
            loop
            playsInline
            preload="metadata"
            poster={`/videos/${name}.jpg`}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            className="block aspect-video w-full bg-black object-cover"
            aria-label={title}
          >
            <source src={`/videos/${name}.mp4`} type="video/mp4" />
            <source src={`/videos/${name}.webm`} type="video/webm" />
          </video>
          {!playing && (
            <button type="button" onClick={() => ref.current?.play()} aria-label="Lire la vidéo" className="absolute inset-0 grid place-items-center bg-black/20">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-white/90 text-[#0b1f1b] shadow-xl"><Play className="ml-1 h-6 w-6" /></span>
            </button>
          )}
        </div>
      </div>
    </figure>
    </>
  );
}
