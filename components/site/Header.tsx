"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/produit", label: "Produit" },
  { href: "/exemples", label: "Exemples" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/demo", label: "Démo" },
];

const RESOURCES = [
  { href: "/blog", label: "Blog", text: "Guides pour vendre sur Shopify" },
  { href: "/outils", label: "Outils gratuits", text: "Noms, slogans, descriptions" },
  { href: "/nouveautes", label: "Nouveautés", text: "Ce qui sort et ce qui arrive" },
  { href: "/fondateurs", label: "Notre histoire", text: "Pourquoi on construit ça" },
  { href: "/affiliation", label: "Affiliation", text: "30 % de commission récurrente" },
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
        <Logo />

        <nav aria-label="Navigation principale" className="surface hidden items-center gap-0.5 rounded-full p-1 text-sm md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={cn("rounded-full px-3.5 py-1.5 transition-colors", active(n.href) ? "bg-white/[0.08] text-fg" : "text-fg-muted hover:text-fg")}>
              {n.label}
            </Link>
          ))}
          <div className="group relative">
            <button className="flex items-center gap-1 rounded-full px-3.5 py-1.5 text-fg-muted transition-colors hover:text-fg group-focus-within:text-fg" aria-haspopup="true">
              Ressources <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180" />
            </button>
            <div className="invisible absolute left-1/2 top-full w-72 -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              <div className="rounded-card border border-white/10 bg-bg-2/95 p-1.5 shadow-2xl backdrop-blur-xl">
                {RESOURCES.map((r) => (
                  <Link key={r.href} href={r.href} className="block rounded-ctl px-3 py-2.5 hover:bg-white/[0.05]">
                    <span className="block text-sm text-fg">{r.label}</span>
                    <span className="block text-xs text-fg-faint">{r.text}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <Link href="/contact" className={cn("rounded-full px-3.5 py-1.5 transition-colors", active("/contact") ? "bg-white/[0.08] text-fg" : "text-fg-muted hover:text-fg")}>Contact</Link>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ButtonLink href="/connexion" variant="ghost" size="sm">Connexion</ButtonLink>
          <ButtonLink href="/inscription" size="sm">Essayer gratuitement</ButtonLink>
        </div>

        <button className="grid h-10 w-10 place-items-center rounded-ctl text-fg md:hidden" aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="h-[calc(100dvh-4rem)] overflow-y-auto border-t border-white/[0.06] px-4 pb-10 pt-4 md:hidden">
          <nav aria-label="Navigation mobile" className="flex flex-col">
            {[...NAV, { href: "/contact", label: "Contact" }].map((n) => (
              <Link key={n.href} href={n.href} className="border-b border-white/[0.06] py-4 text-2xl tracking-tight">{n.label}</Link>
            ))}
            <p className="mt-8 text-xs uppercase tracking-[0.14em] text-fg-faint">Ressources</p>
            {RESOURCES.map((r) => (
              <Link key={r.href} href={r.href} className="py-2.5 text-fg-muted">{r.label}</Link>
            ))}
          </nav>
          <div className="mt-8 grid gap-2">
            <ButtonLink href="/inscription" size="lg">Essayer gratuitement</ButtonLink>
            <ButtonLink href="/connexion" variant="secondary" size="lg">Connexion</ButtonLink>
          </div>
        </div>
      )}
    </header>
  );
}
