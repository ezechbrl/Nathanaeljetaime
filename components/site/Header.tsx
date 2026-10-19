"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";
import { CTA } from "@/lib/launch";

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
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-[background,border-color,backdrop-filter] duration-300", scrolled || open ? "border-b border-white/[0.06] bg-bg/75 backdrop-blur-xl" : "border-b border-transparent")}>
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

        <button className="grid h-10 w-10 place-items-center rounded-ctl text-fg lg:hidden" aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="h-[calc(100dvh-4rem)] overflow-y-auto border-t border-white/[0.06] px-4 pb-10 pt-4 lg:hidden">
          <nav aria-label="Navigation mobile" className="flex flex-col">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="border-b border-white/[0.06] py-4 text-2xl tracking-tight">{n.label}</Link>
            ))}
            <p className="mt-8 text-xs uppercase tracking-[0.14em] text-fg-faint">Ressources</p>
            {RESOURCES.map((r) => (
              <Link key={r.href} href={r.href} className="py-2.5 text-fg-muted">{r.label}</Link>
            ))}
          </nav>
          <div className="mt-8 grid gap-2">
            <ButtonLink href="/inscription" size="lg">{CTA.main}</ButtonLink>
            <ButtonLink href="/connexion" variant="secondary" size="lg">Connexion</ButtonLink>
          </div>
        </div>
      )}
    </header>
  );
}
