"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { CTA } from "@/lib/launch";

// Téléphone : bouton « Créer ma boutique » fixé en bas de l'écran dès que le champ du haut n'est plus visible.
// Il ramène au champ et le sélectionne.
export function StickyCta() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const box = document.getElementById("creer");
    if (!box) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(box);
    return () => io.disconnect();
  }, []);
  const go = () => {
    const box = document.getElementById("creer");
    box?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => box?.querySelector<HTMLTextAreaElement | HTMLInputElement>("textarea, input")?.focus({ preventScroll: true }), 450);
  };
  return (
    <div className={`fixed inset-x-0 bottom-0 z-50 p-3 pb-[max(12px,env(safe-area-inset-bottom))] transition-all duration-300 sm:hidden ${show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"}`}>
      <button type="button" onClick={go} className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 text-[16px] font-semibold text-[#03140d] shadow-[0_12px_40px_-8px_rgb(46_230_166/0.7)]">
        {CTA.main} <ArrowUp className="h-4 w-4" />
      </button>
    </div>
  );
}
