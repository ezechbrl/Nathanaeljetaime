"use client";

import { ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";

const STATS = [
  { value: 5, suffix: " min", label: "pour une boutique complète" },
  { value: 12, suffix: "", label: "langues de marché" },
  { value: 40, suffix: "+", label: "éléments générés par boutique" },
];

function CountUp({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(to);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setN(0);
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const step = (t: number) => {
        const k = Math.min(1, (t - start) / 1200);
        setN(Math.round(to * (1 - Math.pow(1 - k, 3))));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);

  return <span ref={ref} className="tabular-nums">{n}{suffix}</span>;
}

export function Stats() {
  return (
    <section className="mx-auto max-w-[1000px] px-4 py-14 sm:px-6">
      <div className="grid grid-cols-2 gap-y-10 sm:grid-cols-4">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 80} className="border-white/[0.06] text-center sm:border-r">
            <p className="text-4xl tracking-[-0.04em] sm:text-5xl"><CountUp to={s.value} suffix={s.suffix} /></p>
            <p className="mt-2 text-sm text-fg-muted">{s.label}</p>
          </Reveal>
        ))}
        <Reveal delay={240} className="flex flex-col items-center justify-center text-center">
          <p className="text-xs text-fg-faint">Conçu pour</p>
          <p className="mt-1.5 flex items-center gap-2 text-2xl tracking-tight">
            <ShoppingBag className="h-6 w-6 text-[#95bf47]" aria-hidden />
            Shopify
          </p>
        </Reveal>
      </div>
    </section>
  );
}
