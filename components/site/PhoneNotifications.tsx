"use client";

import { Check, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ShopifyBag } from "@/components/auth/AuthForms";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

// Illustration : un iPhone qui reçoit des notifications de commandes Shopify, pour montrer à quoi ressemble une
// boutique qui vend. Ce sont des exemples (indiqué sous le téléphone), pas des ventes réelles de Vigenia.
// Notifications variées (titres, produits, villes, montants), comme dans l'app Shopify.
const NOTES = [
  { t: "Nouvelle commande", b: "Commande n° 1042 · 49,90 €", d: "2 × Lampe Aura · Lyon" },
  { t: "Paiement reçu", b: "74,70 € pour la commande n° 1043", d: "Lot de 3 · Bordeaux" },
  { t: "Nouvelle commande", b: "Commande n° 1044 · 29,90 €", d: "Coussin chauffant · Lille" },
  { t: "3 nouvelles commandes", b: "Total : 139,60 €", d: "Depuis ta dernière visite" },
  { t: "Nouvelle commande", b: "Commande n° 1048 · 59,80 €", d: "Livraison offerte · Nantes" },
  { t: "Nouveau client", b: "Camille a passé sa 2ᵉ commande", d: "34,90 € · Marseille" },
  { t: "Nouvelle commande", b: "Commande n° 1050 · 89,70 €", d: "Lot de 3 · Paris" },
];

// Petit « ka-ching » de caisse, fabriqué par le navigateur (aucun fichier son), seulement si le son est activé.
function chime() {
  try {
    const W = window as unknown as { webkitAudioContext?: typeof AudioContext };
    const ctx = new (window.AudioContext || W.webkitAudioContext!)();
    const now = ctx.currentTime;
    [[1318.5, 0], [1760, 0.09], [2637, 0.18]].forEach(([f, t]) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = "triangle"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, now + t); g.gain.exponentialRampToValueAtTime(0.18, now + t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.35);
      o.connect(g).connect(ctx.destination); o.start(now + t); o.stop(now + t + 0.4);
    });
    window.setTimeout(() => ctx.close(), 1000);
  } catch { /* son indisponible */ }
}

const ago = (i: number) => (i === 0 ? "maintenant" : `il y a ${[0, 2, 5, 9][i] ?? i * 3} min`);

export function NotificationPhone({ className }: { className?: string }) {
  const [shown, setShown] = useState(1);
  const [now, setNow] = useState<Date | null>(null);
  const [sound, setSound] = useState(false);
  const soundRef = useRef(false);
  soundRef.current = sound;
  useEffect(() => {
    setNow(new Date());
    const clock = window.setInterval(() => setNow(new Date()), 15_000);
    const t = window.setInterval(() => setShown((n) => (n >= NOTES.length ? 1 : n + 1)), 2400);
    return () => { window.clearInterval(clock); window.clearInterval(t); };
  }, []);
  // Une notification arrive : petit son, si la personne l'a activé.
  useEffect(() => { if (soundRef.current) chime(); }, [shown]);
  const d = now ? now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }) : "";
  const date = d.charAt(0).toUpperCase() + d.slice(1);
  const time = now ? now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "";
  return (
    <div className={cn("relative", className)}>
      <div aria-hidden className="absolute left-1/2 top-1/2 -z-10 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(20_184_134/0.35),transparent)]" />
      <div className="relative mx-auto h-[560px] w-[275px] rounded-[48px] border-[10px] border-[#1c1c1e] bg-black shadow-[0_0_0_2px_#3a3a3c,0_40px_80px_-20px_rgb(0_0_0/0.8)]">
        <div className="absolute left-1/2 top-2.5 z-10 h-[26px] w-[90px] -translate-x-1/2 rounded-full bg-black" />
        <div className="absolute inset-0 overflow-hidden rounded-[38px] bg-[radial-gradient(120%_80%_at_30%_10%,#2b5a4b,#0d1f1a_55%,#05100c)]">
          <div className="mt-12 text-center text-white" suppressHydrationWarning>
            <p className="h-5 text-[14px] font-medium opacity-80">{date}</p>
            <p className="h-[64px] text-[60px] font-semibold leading-none tracking-[-0.03em] tabular-nums">{time}</p>
          </div>
          <div className="mt-5 space-y-2 px-2.5">
            {NOTES.slice(0, shown).reverse().slice(0, 4).map((n, i) => (
              <div key={n.b} className="flex items-center gap-2.5 rounded-[17px] bg-white/[0.17] p-2.5 text-left text-white backdrop-blur-xl [animation:rise_.4s_cubic-bezier(.2,.8,.2,1)_both]" style={{ opacity: 1 - i * 0.14 }}>
                <span className="grid h-9 w-9 shrink-0 place-items-center"><ShopifyBag className="h-8 w-8" /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between text-[11px]"><span className="font-semibold uppercase tracking-wide opacity-90">Shopify</span><span className="opacity-60">{ago(i)}</span></span>
                  <span className="block truncate text-[12.5px] font-semibold">{n.t}</span>
                  <span className="block truncate text-[12px]">{n.b}</span>
                  <span className="block truncate text-[11px] opacity-70">{n.d}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-col items-center gap-2 text-[11px] text-fg-faint">
        <span>Illustration · exemples de notifications</span>
        <button type="button" onClick={() => { const v = !sound; setSound(v); if (v) chime(); }} aria-pressed={sound} className="pointer-events-auto inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-white/15 px-2 py-0.5 text-fg-muted hover:border-[#14b886] hover:text-white">
          {sound ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />} {sound ? "Son activé" : "Activer le son"}
        </button>
      </div>
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
