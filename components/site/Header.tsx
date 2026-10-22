"use client";

import { ArrowRight, CircleDollarSign, LayoutGrid, Mail, PlayCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";
import { CTA } from "@/lib/launch";

// Seulement les pages utiles, en pilules bien visibles. Les autres pages sont dans le pied de page.
const NAV = [
  { href: "/exemples", label: "Exemples", icon: LayoutGrid, text: "Des boutiques créées avec Vigenia" },
  { href: "/demo", label: "Comment ça marche", icon: PlayCircle, text: "La démo en 3 étapes" },
  { href: "/tarifs", label: "Tarifs", icon: CircleDollarSign, text: "−50 % à vie au lancement" },
  { href: "/contact", label: "Contact", icon: Mail, text: "Une question ? On répond vite" },
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
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
        <Logo />

        <nav aria-label="Navigation principale" className="hidden items-center gap-2 lg:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={cn("rounded-full border px-4 py-2 text-[14.5px] font-medium backdrop-blur transition-all", active(n.href) ? "border-[#2ee6a6]/60 bg-[#2ee6a6]/15 text-white shadow-[0_0_16px_-2px_rgb(46_230_166/0.45)]" : "border-white/12 bg-white/[0.04] text-fg/85 hover:border-[#2ee6a6]/40 hover:text-white")}>
              {n.label}
            </Link>
          ))}
        </nav>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <ButtonLink href="/connexion" variant="ghost" size="sm">Connexion</ButtonLink>
          <ButtonLink href="/inscription" size="sm">{CTA.main}</ButtonLink>
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
        <div className="flex h-[calc(100dvh-4rem)] flex-col overflow-y-auto px-4 pb-6 pt-3 [animation:fade-in_.2s_ease-out] lg:hidden">
          <nav aria-label="Navigation mobile" className="grid gap-2.5">
            {NAV.map((n, i) => (
              <Link key={n.href} href={n.href} style={{ animationDelay: `${i * 50}ms` }} className={cn("group flex items-center gap-4 rounded-[20px] border p-4 [animation:rise_.4s_cubic-bezier(.2,.8,.2,1)_both]", active(n.href) ? "border-[#2ee6a6]/50 bg-[#2ee6a6]/10" : "border-white/10 bg-white/[0.04]")}>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[linear-gradient(160deg,#34f0b0,#0fae7c)] text-[#03140d] shadow-[0_8px_20px_-8px_rgb(46_230_166/0.8)]"><n.icon className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[17px] font-semibold tracking-tight">{n.label}</span>
                  <span className="block truncate text-[13px] text-fg-muted">{n.text}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-fg-faint transition-transform group-active:translate-x-0.5" />
              </Link>
            ))}
          </nav>
          <div className="mt-5 flex flex-wrap gap-2 [animation:fade-in_.4s_.2s_both]">
            {RESOURCES.map((r) => (
              <Link key={r.href} href={r.href} className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[13px] text-fg-muted">{r.label}</Link>
            ))}
          </div>
          <div className="mt-auto grid gap-2 pt-8">
            <div className="glow-frame rounded-[15px] p-[1.5px]"><ButtonLink href="/inscription" size="lg" className="w-full rounded-[14px]">{CTA.main} <ArrowRight className="h-4 w-4" /></ButtonLink></div>
            <ButtonLink href="/connexion" variant="secondary" size="lg">J'ai déjà un compte</ButtonLink>
          </div>
        </div>
      )}
    </header>
  );
}
