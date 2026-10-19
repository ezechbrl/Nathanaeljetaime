"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

// Fait apparaître son contenu (fondu + légère montée + net) quand il entre dans l'écran.
// Le style est dans app/globals.css ([data-reveal]).
// Sans latence : tout est rendu visible (« auto », animation CSS jouée dès le premier affichage, sans attendre
// le JavaScript). Seuls les blocs encore sous l'écran sont masqués, puis révélés quand on y arrive.
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
const MAX_DELAY = 150; // ms : un délai plus long donne une impression de lenteur
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

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return; // déjà à l'écran : rien à attendre
    el.dataset.reveal = "";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.reveal = "in";
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -4% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      // @ts-expect-error ref générique selon la balise
      ref={ref}
      data-reveal="auto"
      className={className}
      style={{ "--reveal-delay": `${Math.min(delay, MAX_DELAY)}ms` } as React.CSSProperties}
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
