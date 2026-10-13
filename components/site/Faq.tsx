"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

export function FaqList({ items, defaultOpen = 0 }: { items: { q: string; a: string }[]; defaultOpen?: number | null }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <Reveal key={item.q} delay={i * 50}>
            <div className={cn("rounded-card border transition-colors duration-300", isOpen ? "border-accent/25 bg-accent-deep/20" : "border-white/[0.08] bg-white/[0.02] hover:border-white/15")}>
              <h3>
                <button
                  id={`faq-q-${i}`}
                  aria-controls={`faq-a-${i}`}
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[16px] text-fg"
                >
                  {item.q}
                  <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white/15 transition-transform duration-300", isOpen && "rotate-45 border-accent/40 text-accent")}>
                    <Plus className="h-3.5 w-3.5" />
                  </span>
                </button>
              </h3>
              <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className={cn("grid transition-[grid-template-rows] duration-300 ease-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                <p className="overflow-hidden px-5 text-[15px] leading-relaxed text-fg-muted">
                  <span className="block pb-5">{item.a}</span>
                </p>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}

export function FaqSection({ items, title, subtitle }: { items: { q: string; a: string }[]; title: React.ReactNode; subtitle?: string }) {
  return (
    <section id="faq" className="py-24">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.4fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal as="h2" className="text-h2">{title}</Reveal>
          {subtitle && <Reveal delay={80} as="p" className="mt-4 text-fg-muted">{subtitle}</Reveal>}
        </div>
        <FaqList items={items} />
      </div>
    </section>
  );
}
