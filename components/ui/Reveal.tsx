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
    // Titres : les mots montent un par un (comme dans les boutiques), dès qu'on arrive dessus.
    if ((Tag === "h1" || Tag === "h2") && !window.matchMedia("(prefers-reduced-motion: reduce)").matches && !el.dataset.words) {
      splitWords(el, Math.min(delay, MAX_DELAY));
      const show = () => { el.dataset.words = "in"; };
      if (el.getBoundingClientRect().top < window.innerHeight * 0.95) { requestAnimationFrame(() => requestAnimationFrame(show)); return; }
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { show(); io.disconnect(); } }, { rootMargin: "0px 0px 6% 0px", threshold: 0 });
      io.observe(el);
      return () => io.disconnect();
    }
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

// Découpe le titre en mots (les mots mis en avant restent d'un seul bloc) pour les faire monter un par un.
function splitWords(el: HTMLElement, base: number) {
  el.dataset.words = "";
  el.removeAttribute("data-reveal");
  let i = 0;
  const wrap = (node: Node): HTMLSpanElement => {
    const outer = document.createElement("span");
    outer.className = "rw";
    const inner = document.createElement("span");
    inner.style.transitionDelay = `${base + Math.min(i++, 12) * 45}ms`;
    inner.appendChild(node);
    outer.appendChild(inner);
    return outer;
  };
  let last: HTMLSpanElement | null = null; // dernier mot posé (pour y coller « , » ou « ? » sans retour à la ligne)
  [...el.childNodes].forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE) {
      const parts = (n.textContent ?? "").split(/(\s+)/);
      const frag = document.createDocumentFragment();
      parts.forEach((p, k) => {
        if (!p) return;
        if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); last = null; return; }
        if (k === 0 && last) { last.firstElementChild!.appendChild(document.createTextNode(p)); return; } // collé au mot d'avant
        const w = wrap(document.createTextNode(p));
        frag.appendChild(w);
        last = w;
      });
      el.replaceChild(frag, n);
    } else if (n.nodeType === Node.ELEMENT_NODE && (n as HTMLElement).tagName !== "BR") {
      const ph = document.createComment("");
      el.replaceChild(ph, n);
      const w = wrap(n);
      el.replaceChild(w, ph);
      last = w;
    } else last = null;
  });
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
