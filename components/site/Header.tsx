"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";
import { CTA, isWaitlist } from "@/lib/launch";

// Seulement les pages utiles, en pilules bien visibles. Les autres pages sont dans le pied de page.
const NAV = [
  { href: "/exemples", label: "Exemples" },
  { href: "/demo", label: "Comment ça marche" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/contact", label: "Contact" },
];

const RESOURCES = [
  { href: "/blog", label: "Blog", text: "Guides pour vendre sur Shopify" },
  { href: "/nouveautes", label: "Feuille de route", text: "Ce qui sort et ce qui arrive" },
  { href: "/fondateurs", label: "Notre histoire", text: "Pourquoi on construit ça" },
  { href: "/affiliation", label: "Devenir partenaire", text: "30 % de commission récurrente" },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-[background,border-color,backdrop-filter] duration-300", open ? "border-b border-white/[0.06] bg-[#05261d]/95 backdrop-blur-xl" : scrolled ? "border-b border-white/[0.06] bg-bg/75 backdrop-blur-xl" : "border-b border-transparent")}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-bg-3 focus:px-3 focus:py-2">Aller au contenu</a>
      {/* Comme une barre d'appli : logo bien à gauche, les liens groupés dans une seule pilule au centre, les boutons à droite. */}
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:grid lg:h-[72px] lg:grid-cols-[1fr_auto_1fr] lg:px-10">
        <div className="justify-self-start"><Logo className="lg:gap-3 lg:text-[22px] lg:font-semibold [&_svg]:lg:h-9 [&_svg]:lg:w-9" /></div>

        <nav aria-label="Navigation principale" className="hidden items-center gap-1 rounded-full border border-white/12 bg-white/[0.05] p-1.5 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.5),inset_0_1px_0_rgb(255_255_255/0.06)] backdrop-blur-xl lg:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={cn("rounded-full px-4 py-2 text-[15px] font-semibold transition-all", active(n.href) ? "bg-[#2ee6a6]/15 text-white shadow-[0_0_16px_-4px_rgb(46_230_166/0.5)]" : "text-white/90 hover:bg-white/[0.07] hover:text-white")}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 justify-self-end lg:flex">
          <ButtonLink href="/connexion" variant="ghost" size="sm">Connexion</ButtonLink>
          <ButtonLink href={isWaitlist ? "/inscription" : "/quiz"} size="sm">{CTA.main}</ButtonLink>
        </div>

        {/* Bouton burger animé : les barres se croisent pour former une croix. */}
        <button className="relative grid h-11 w-11 place-items-center rounded-full border border-white/12 bg-white/[0.05] text-fg backdrop-blur lg:hidden" aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <span aria-hidden className="relative block h-3.5 w-5">
            <span className={cn("absolute left-0 h-[2px] w-5 rounded-full bg-current transition-all duration-300", open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0")} />
            <span className={cn("absolute left-0 top-1/2 h-[2px] w-3.5 -translate-y-1/2 rounded-full bg-current transition-all duration-200", open && "opacity-0")} />
            <span className={cn("absolute left-0 h-[2px] w-5 rounded-full bg-current transition-all duration-300", open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0")} />
          </span>
        </button>
      </div>

      {open && (
        // Menu plein écran : grands liens animés, offre mise en avant, boutons en bas.
        <div className="relative flex h-[calc(100dvh-4rem)] flex-col overflow-y-auto px-5 pb-6 pt-2 lg:hidden">
          <div aria-hidden className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgb(46_230_166/0.25),transparent)] blur-2xl" />
          <nav aria-label="Navigation mobile" className="relative">
            {NAV.map((n, i) => (
              <Link key={n.href} href={n.href} style={{ animationDelay: `${60 + i * 60}ms` }} className="group flex items-center justify-between border-b border-white/[0.08] py-4 [animation:rise_.5s_cubic-bezier(.2,.8,.2,1)_both]">
                <span className="flex items-baseline gap-3">
                  <span className="font-mono text-[11px] text-accent/70">0{i + 1}</span>
                  <span className={cn("text-[2rem] font-semibold leading-none tracking-[-0.04em]", active(n.href) ? "text-accent" : "text-fg")}>{n.label}</span>
                </span>
                <span className="grid h-9 w-9 place-items-center rounded-full border border-white/12 transition-colors group-active:bg-accent group-active:text-[#03140d]"><ArrowRight className="h-4 w-4" /></span>
              </Link>
            ))}
          </nav>
          <Link href="/tarifs" className="relative mt-6 overflow-hidden rounded-[20px] bg-[linear-gradient(120deg,#10b981,#2ee6a6_55%,#a3e635)] p-4 text-[#03140d] [animation:rise_.5s_.3s_cubic-bezier(.2,.8,.2,1)_both]">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] opacity-70">Offre de lancement</p>
            <p className="mt-1 text-xl font-bold tracking-tight">−50 % à vie sur ton abonnement</p>
            <p className="mt-0.5 text-sm font-medium opacity-80">Valable 24 h après ton inscription →</p>
          </Link>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[14px] text-fg-muted [animation:fade-in_.5s_.4s_both]">
            {RESOURCES.map((r) => <Link key={r.href} href={r.href} className="hover:text-fg">{r.label}</Link>)}
          </div>
          <div className="mt-auto grid grid-cols-2 gap-2 pt-8">
            <ButtonLink href="/connexion" variant="secondary" size="lg">Connexion</ButtonLink>
            <ButtonLink href={isWaitlist ? "/inscription" : "/quiz"} size="lg">{CTA.short}</ButtonLink>
          </div>
        </div>
      )}
    </header>
  );
}
