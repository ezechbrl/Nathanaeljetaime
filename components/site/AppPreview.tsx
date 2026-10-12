"use client";

import { useEffect, useRef } from "react";
import { useScrollProgress } from "@/components/ui/useScrollProgress";

// Vidéo réelle du produit dans le hero, qui se redresse en perspective au défilement.
export function AppPreview() {
  const ref = useScrollProgress<HTMLDivElement>(0.45);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.25 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="mx-auto mt-16 max-w-[1100px] [perspective:1600px] sm:mt-20" style={{ "--p": 0 } as React.CSSProperties}>
      <div
        className="relative origin-top overflow-hidden rounded-[14px] border border-black/10 bg-white shadow-[0_60px_120px_-50px_rgb(0_0_0/0.45)] will-change-transform"
        style={{ transform: "rotateX(calc((1 - var(--p)) * 14deg)) scale(calc(0.94 + var(--p) * 0.06))" }}
      >
        <div className="flex items-center gap-1.5 border-b border-black/[0.06] bg-bg-2 px-3 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" /><span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" /><span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 flex-1 truncate rounded-[6px] bg-white px-3 py-1 text-center text-xs text-fg-faint">vitrio.ai/app</span>
        </div>
        <video
          ref={videoRef}
          src="/videos/generate.webm"
          poster="/videos/generate.jpg"
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Démonstration : création d'une boutique à partir d'un brief"
          className="block aspect-[16/10] w-full bg-bg-2 object-cover"
        />
      </div>
    </div>
  );
}
