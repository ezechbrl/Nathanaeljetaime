"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { DEMO_VIDEOS, type DemoVideo } from "@/lib/content/demo-videos";

// Lecteur façon VSL : vidéos réelles du produit, sous-titres synchronisés, enchaînement automatique des étapes.
export function VideoSteps({ videos = DEMO_VIDEOS, className }: { videos?: DemoVideo[]; className?: string }) {
  const [index, setIndex] = useState(0);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const visible = useRef(false);
  const current = videos[index];
  const caption = [...current.captions].reverse().find((c) => time >= c.t)?.text;

  // Lecture uniquement quand le lecteur est à l'écran (et si l'utilisateur n'a pas mis en pause).
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting;
      const v = videoRef.current;
      if (!v) return;
      if (e.isIntersecting && !userPaused && !reduce) v.play().catch(() => {});
      else v.pause();
    }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, [userPaused]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    setTime(0);
    v.currentTime = 0;
    if (visible.current && !userPaused) v.play().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  function toggle() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { setUserPaused(false); v.play().catch(() => {}); }
    else { setUserPaused(true); v.pause(); }
  }

  return (
    <div ref={rootRef} className={cn("grid gap-6 lg:grid-cols-[0.75fr_1.6fr] lg:gap-10", className)}>
      <ol className="flex gap-3 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
        {videos.map((v, i) => {
          const active = i === index;
          const progress = active ? Math.min(100, (time / duration) * 100) : i < index ? 100 : 0;
          return (
            <li key={v.id} className="min-w-[240px] lg:min-w-0">
              <button
                onClick={() => { setUserPaused(false); setIndex(i); }}
                aria-current={active ? "step" : undefined}
                className={cn("w-full rounded-card border p-4 text-left transition-colors duration-300", active ? "border-accent/30 bg-accent-deep/30" : "border-white/[0.08] bg-white/[0.02] hover:border-white/20")}
              >
                <span className={cn("text-xs font-medium", active ? "text-accent" : "text-fg-faint")}>{v.step}</span>
                <span className="mt-1 block text-lg tracking-tight">{v.title}</span>
                <span className={cn("grid transition-[grid-template-rows] duration-500", active ? "grid-rows-[1fr]" : "grid-rows-[0fr] lg:grid-rows-[0fr]")}>
                  <span className="overflow-hidden text-sm leading-relaxed text-fg-muted"><span className="block pt-1.5">{v.text}</span></span>
                </span>
                <span className="mt-3 block h-0.5 overflow-hidden rounded bg-white/[0.07]">
                  <span className="block h-full rounded bg-accent transition-[width] duration-200 ease-linear" style={{ width: `${progress}%` }} />
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="relative">
        <div className="overflow-hidden rounded-[14px] border border-white/10 bg-bg-2 shadow-[0_40px_80px_-40px_rgb(0_0_0/0.7)]">
          <div className="flex items-center gap-1.5 border-b border-white/[0.06] bg-bg-2 px-3 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" /><span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" /><span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-3 flex-1 truncate rounded-[6px] bg-white/[0.06] px-3 py-1 text-center text-xs text-fg-faint">vitrio.ai/app</span>
          </div>
          <div className="relative aspect-[16/10] bg-bg-2">
            <video
              key={current.id}
              ref={videoRef}
              src={current.src}
              poster={current.poster}
              muted
              playsInline
              preload="metadata"
              aria-label={`Démonstration : ${current.title}`}
              className="h-full w-full object-cover"
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 1)}
              onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setIndex((i) => (i + 1) % videos.length)}
            />
            {caption && (
              <p key={caption} className="pointer-events-none absolute inset-x-0 bottom-5 mx-auto w-fit max-w-[85%] animate-[fade-in_.35s_ease-out] rounded-ctl bg-black/75 px-4 py-2 text-center text-sm text-white backdrop-blur sm:text-[15px]">
                {caption}
              </p>
            )}
            <button onClick={toggle} aria-label={playing ? "Mettre en pause" : "Lire la vidéo"} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white backdrop-blur transition-opacity hover:bg-black/75">
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
