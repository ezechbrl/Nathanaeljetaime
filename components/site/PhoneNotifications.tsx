"use client";

import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";

// Illustration : un iPhone qui reçoit des notifications de commandes, pour montrer à quoi ressemble une
// boutique qui vend. Ce sont des exemples (marqué sur la page), pas des ventes réelles de Vigenia.
const NOTES = [
  { t: "Nouvelle commande", d: "Commande n° 1042 · 2 articles", p: "49,90 €" },
  { t: "Nouvelle commande", d: "Commande n° 1043 · Lot de 3", p: "74,70 €" },
  { t: "Nouvelle commande", d: "Commande n° 1044 · 1 article", p: "29,90 €" },
  { t: "Nouvelle commande", d: "Commande n° 1045 · 2 articles", p: "59,80 €" },
  { t: "Nouvelle commande", d: "Commande n° 1046 · 1 article", p: "34,90 €" },
];

export function PhoneNotifications() {
  const [shown, setShown] = useState(1);
  useEffect(() => {
    const t = window.setInterval(() => setShown((n) => (n >= NOTES.length ? 1 : n + 1)), 1800);
    return () => window.clearInterval(t);
  }, []);
  return (
    <section className="mx-auto max-w-[1100px] px-5 py-20 sm:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#14b886]">Le but</p>
          <h2 className="mt-3 text-h2">Ton téléphone qui <span className="serif-accent">sonne</span> pour chaque vente</h2>
          <p className="mt-4 max-w-md text-fg-muted">Une boutique propre, des photos qui donnent envie, des offres par lot : tout ce qu'il faut pour que les commandes arrivent. Vigenia s'occupe de la boutique, toi de trouver tes clients.</p>
          <p className="mt-3 text-xs text-fg-faint">Illustration : exemples de notifications de commande, pas des résultats garantis.</p>
        </Reveal>
        <div className="relative mx-auto">
          <div aria-hidden className="absolute left-1/2 top-1/2 -z-10 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(20_184_134/0.35),transparent)]" />
          {/* iPhone */}
          <div className="relative h-[560px] w-[275px] rounded-[48px] border-[10px] border-[#1c1c1e] bg-black shadow-[0_0_0_2px_#3a3a3c,0_40px_80px_-20px_rgb(0_0_0/0.8)]">
            <div className="absolute left-1/2 top-2.5 z-10 h-[26px] w-[92px] -translate-x-1/2 rounded-full bg-black" />
            <div className="absolute inset-0 overflow-hidden rounded-[38px] bg-[radial-gradient(120%_80%_at_30%_10%,#2b5a4b,#0d1f1a_55%,#05100c)]">
              <div className="mt-14 text-center text-white">
                <p className="text-[15px] font-medium opacity-80">mardi 24 novembre</p>
                <p className="text-[64px] font-semibold leading-none tracking-[-0.03em]">9:41</p>
              </div>
              <div className="mt-6 space-y-2 px-3">
                {NOTES.slice(0, shown).reverse().map((n, i) => (
                  <div key={n.d} className="flex items-center gap-2.5 rounded-[18px] bg-white/[0.16] p-2.5 text-white backdrop-blur-xl [animation:rise_.4s_cubic-bezier(.2,.8,.2,1)_both]" style={{ opacity: i > 3 ? 0 : 1 - i * 0.12 }}>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[linear-gradient(180deg,#14b886,#00876a)]"><ShoppingBag className="h-5 w-5" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between text-[12px]"><span className="font-semibold">Ta boutique</span><span className="opacity-60">{i === 0 ? "maintenant" : `il y a ${i * 2} min`}</span></span>
                      <span className="block text-[12.5px] font-semibold">{n.t} · {n.p}</span>
                      <span className="block truncate text-[11.5px] opacity-75">{n.d}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
