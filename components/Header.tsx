"use client";

import Link from "next/link";
import { useState } from "react";
import { site } from "@/lib/site";

const NAV = [
  { href: "/produit", label: "Produit" },
  { href: "/demo", label: "Démo" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/80 backdrop-blur">
      <a href="#main-content" className="sr-only focus:not-sr-only">Aller au contenu</a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand text-sm text-white">{site.name[0]}</span>
          {site.name}
        </Link>
        <nav className="hidden gap-8 text-sm text-black/70 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-black">{n.label}</Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/connexion" className="text-sm font-medium text-black/70 hover:text-black">Connexion</Link>
          <Link href="/dashboard" className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-black/80">
            Voir mon dashboard
          </Link>
        </div>
        <button
          className="grid h-10 w-10 place-items-center rounded-lg md:hidden"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="text-xl">{open ? "✕" : "☰"}</span>
        </button>
      </div>
      {open && (
        <nav className="border-t border-black/5 bg-white px-4 py-4 md:hidden">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="block py-2 text-sm" onClick={() => setOpen(false)}>{n.label}</Link>
          ))}
          <Link href="/connexion" className="block py-2 text-sm">Connexion</Link>
          <Link href="/inscription" className="mt-2 block rounded-full bg-ink px-4 py-2 text-center text-sm font-medium text-white">
            Créer ma boutique
          </Link>
        </nav>
      )}
    </header>
  );
}
