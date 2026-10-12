"use client";

import { useEffect, useRef } from "react";

// Fait apparaître son contenu (fondu + légère montée + net) quand il entre dans l'écran.
// Le style est dans app/globals.css ([data-reveal]).
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  as?: "div" | "section" | "li" | "span" | "p" | "h1" | "h2" | "h3";
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.reveal = "in";
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      // @ts-expect-error ref générique selon la balise
      ref={ref}
      data-reveal=""
      className={className}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}

// Titre qui apparaît mot par mot.
export function RevealWords({ text, className, delay = 0, step = 60 }: { text: string; className?: string; delay?: number; step?: number }) {
  return (
    <span className={className}>
      {text.split(" ").map((w, i) => (
        <Reveal key={i} as="span" delay={delay + i * step} className="inline-block whitespace-pre">
          {w + (i < text.split(" ").length - 1 ? " " : "")}
        </Reveal>
      ))}
    </span>
  );
}
