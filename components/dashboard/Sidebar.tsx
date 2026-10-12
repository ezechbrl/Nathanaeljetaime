"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { site } from "@/lib/site";

const NAV = [
  { href: "/dashboard", label: "Mes boutiques", icon: "🏬" },
  { href: "/dashboard/nouvelle", label: "Nouvelle boutique", icon: "✨" },
  { href: "/dashboard/optimisation", label: "Optimisation", icon: "📈" },
  { href: "/dashboard/parametres", label: "Paramètres", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href || pathname.startsWith("/dashboard/boutiques") : pathname.startsWith(href);

  const links = (
    <nav className="space-y-1">
      {NAV.map((n) => (
        <Link
          key={n.href}
          href={n.href}
          onClick={() => setOpen(false)}
          className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${isActive(n.href) ? "bg-white font-semibold shadow-sm" : "text-black/60 hover:text-black"}`}
        >
          <span>{n.icon}</span>{n.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      <div className="flex h-14 items-center justify-between border-b border-black/5 bg-white px-4 lg:hidden">
        <Link href="/" className="font-bold">{site.name}</Link>
        <button aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="text-xl">{open ? "✕" : "☰"}</button>
      </div>
      {open && <div className="border-b border-black/5 bg-black/[0.02] p-3 lg:hidden">{links}</div>}

      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-black/5 bg-black/[0.02] p-4 lg:flex">
        <Link href="/" className="mb-8 flex items-center gap-2 px-2 text-lg font-bold">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand text-sm text-white">{site.name[0]}</span>
          {site.name}
        </Link>
        {links}
        <div className="mt-auto rounded-2xl bg-ink p-4 text-white">
          <p className="text-sm font-semibold">Plan Découverte</p>
          <p className="mt-1 text-xs text-white/60">3 boutiques · 1 génération restante</p>
          <Link href="/tarifs" className="mt-3 block rounded-full bg-white py-2 text-center text-xs font-semibold text-ink">Passer à Pro</Link>
        </div>
        <div className="mt-4 flex items-center gap-3 px-2 text-sm">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-soft font-semibold text-brand">N</span>
          <div className="leading-tight"><p className="font-medium">Mon compte</p><Link href="/connexion" className="text-xs text-black/50 hover:underline">Déconnexion</Link></div>
        </div>
      </aside>
    </>
  );
}
