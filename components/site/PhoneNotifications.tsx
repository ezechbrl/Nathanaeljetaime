"use client";

import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { ShopifyBag } from "@/components/auth/AuthForms";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

// Illustration : un iPhone qui reçoit des notifications de commandes Shopify, pour montrer à quoi ressemble une
// boutique qui vend. Ce sont des exemples (indiqué sous le téléphone), pas des ventes réelles de Vigenia.
const NOTES = [
  { p: "49,90 €", d: "2 articles · Lyon" },
  { p: "74,70 €", d: "Lot de 3 · Bordeaux" },
  { p: "29,90 €", d: "1 article · Lille" },
  { p: "59,80 €", d: "2 articles · Nantes" },
  { p: "34,90 €", d: "1 article · Marseille" },
  { p: "89,70 €", d: "Lot de 3 · Paris" },
];

export function NotificationPhone({ className }: { className?: string }) {
  const [shown, setShown] = useState(1);
  useEffect(() => {
    const t = window.setInterval(() => setShown((n) => (n >= NOTES.length ? 1 : n + 1)), 1700);
    return () => window.clearInterval(t);
  }, []);
  return (
    <div className={cn("relative", className)}>
      <div aria-hidden className="absolute left-1/2 top-1/2 -z-10 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(20_184_134/0.35),transparent)]" />
      <div className="relative mx-auto h-[540px] w-[265px] rounded-[46px] border-[10px] border-[#1c1c1e] bg-black shadow-[0_0_0_2px_#3a3a3c,0_40px_80px_-20px_rgb(0_0_0/0.8)]">
        <div className="absolute left-1/2 top-2.5 z-10 h-[25px] w-[88px] -translate-x-1/2 rounded-full bg-black" />
        <div className="absolute inset-0 overflow-hidden rounded-[36px] bg-[radial-gradient(120%_80%_at_30%_10%,#2b5a4b,#0d1f1a_55%,#05100c)]">
          <div className="mt-12 text-center text-white">
            <p className="text-[14px] font-medium opacity-80">mardi 24 novembre</p>
            <p className="text-[60px] font-semibold leading-none tracking-[-0.03em]">9:41</p>
          </div>
          <div className="mt-5 space-y-2 px-2.5">
            {NOTES.slice(0, shown).reverse().slice(0, 4).map((n, i) => (
              <div key={n.d} className="flex items-center gap-2.5 rounded-[17px] bg-white/[0.17] p-2.5 text-left text-white backdrop-blur-xl [animation:rise_.4s_cubic-bezier(.2,.8,.2,1)_both]" style={{ opacity: 1 - i * 0.13 }}>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px] bg-white"><ShopifyBag className="h-6 w-6" /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between text-[11.5px]"><span className="font-semibold uppercase tracking-wide opacity-90">Shopify</span><span className="opacity-60">{i === 0 ? "maintenant" : `il y a ${i * 3} min`}</span></span>
                  <span className="block text-[12.5px] font-semibold">Nouvelle commande · {n.p}</span>
                  <span className="block truncate text-[11.5px] opacity-75">{n.d}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-[11px] text-fg-faint">Illustration · exemples de notifications</p>
    </div>
  );
}

const GAINS = [
  "Une boutique Shopify complète, prête en 3 minutes",
  "Des photos de pro, sans photographe",
  "Des textes qui donnent envie d'acheter",
  "Les vrais avis clients de ton produit, importés",
  "Des offres par lot pour vendre plus à chaque commande",
  "Ton fournisseur relié à ta boutique",
];

// Section « ce que Vigenia t'apporte ». Sur ordinateur, le téléphone est déjà en haut de la page :
// ici, il n'apparaît que sur téléphone et tablette.
export function PhoneNotifications() {
  return (
    <section className="mx-auto max-w-[1100px] px-5 py-20 sm:px-8">
      <div className="grid items-center gap-12 xl:grid-cols-1">
        <div className="grid items-center gap-12 lg:grid-cols-2 xl:grid-cols-1">
          <Reveal className="xl:mx-auto xl:max-w-3xl xl:text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#14b886]">Ce que Vigenia t'apporte</p>
            <h2 className="mt-3 text-h2">Tout pour que ton téléphone <span className="serif-accent">sonne</span></h2>
            <p className="mt-4 text-fg-muted">Vigenia s'occupe de la boutique. Toi, tu te concentres sur ce qui fait vendre : trouver tes clients.</p>
            <ul className="mt-6 grid gap-2.5 text-left sm:grid-cols-2">
              {GAINS.map((g) => <li key={g} className="flex gap-2.5 rounded-[14px] border border-white/10 bg-white/[0.03] px-3.5 py-3 text-[14.5px]"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#14b886]" strokeWidth={3} />{g}</li>)}
            </ul>
            <p className="mt-4 text-xs text-fg-faint">Les ventes dépendent de ton produit et de ta façon de trouver des clients : rien n'est garanti.</p>
          </Reveal>
          <NotificationPhone className="xl:hidden" />
        </div>
      </div>
    </section>
  );
}
