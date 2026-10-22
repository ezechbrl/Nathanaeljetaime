"use client";

import { useEffect, useRef, useState } from "react";
import { ShopifyBag } from "@/components/auth/AuthForms";

// Chiffres vérifiables (pas de compteurs gonflés) : délai, prix, publication.
const STATS = [
  { value: 10, prefix: "", suffix: " min", label: "du lien à la boutique en ligne" },
  { value: 98, prefix: "−", suffix: " %", label: "moins cher qu'une agence (≈ 2 000 €)" },
  { value: 9, prefix: "", suffix: " photos", label: "de pro créées pour chaque boutique" },
];

function CountUp({ to, run }: { to: number; run: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(to); return; }
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const u = Math.min(1, (t - t0) / 1400);
      setN(Math.round(to * (1 - Math.pow(1 - u, 3))));
      if (u < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, to]);
  return <>{n}</>;
}

export function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section className="px-4 py-10 sm:px-6 sm:py-14">
      <div ref={ref} className="mx-auto grid max-w-[1100px] grid-cols-2 gap-x-4 gap-y-8 text-center lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label}>
            <p className="bg-[linear-gradient(180deg,#ffffff,#a7f3d0)] bg-clip-text text-[clamp(2.4rem,1.6rem+3vw,4rem)] font-semibold leading-none tracking-[-0.04em] text-transparent tabular-nums">
              {s.prefix}<CountUp to={s.value} run={seen} />{s.suffix}
            </p>
            <p className="mx-auto mt-2 max-w-[200px] text-[13.5px] leading-snug text-fg-muted sm:text-sm">{s.label}</p>
          </div>
        ))}
        <div className="flex flex-col items-center justify-center">
          <span className="flex items-center gap-2"><ShopifyBag className="h-11 w-11" /><span className="text-[clamp(1.4rem,1.1rem+1vw,2rem)] font-semibold tracking-[-0.03em]">Shopify</span></span>
          <p className="mx-auto mt-2 max-w-[200px] text-[13.5px] leading-snug text-fg-muted sm:text-sm">publié directement dans ta boutique</p>
        </div>
      </div>
    </section>
  );
}
