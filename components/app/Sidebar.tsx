"use client";

import {
  BarChart3, ChevronsUpDown, CreditCard, Gift, HelpCircle, Home, Image as ImageIcon, LayoutGrid, LogOut,
  Menu, MessageSquare, Plus, Settings, Store as StoreIcon, X,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AiBudgetMeter, Meter } from "@/components/ui/Feedback";
import { Logo } from "@/components/ui/Logo";
import * as api from "@/lib/api/client";
import { cn } from "@/lib/cn";
import { useApp } from "./AppContext";

function NavLink({ href, icon: Icon, children, exact }: { href: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode; exact?: boolean }) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={cn("flex items-center gap-2.5 rounded-ctl px-2.5 py-[7px] text-[13.5px] transition-colors", active ? "bg-white/[0.09] font-medium text-white" : "text-fg/90 hover:bg-white/[0.04] hover:text-white")}>
      <Icon className={cn("h-4 w-4", active && "text-accent")} /> {children}
    </Link>
  );
}

function StoreSwitcher({ currentId }: { currentId?: string }) {
  const { stores } = useApp();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const current = stores.find((s) => s.id === currentId) ?? stores[0];
  if (!current) return null;
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-2.5 rounded-ctl border border-white/[0.07] bg-white/[0.02] px-2.5 py-2 text-left text-[13.5px] hover:border-white/15">
        <span className="h-5 w-5 shrink-0 rounded-[6px]" style={{ background: `linear-gradient(135deg, ${current.theme.colors.accent}, ${current.theme.colors.primary})` }} />
        <span className="flex-1 truncate">{current.name}</span>
        <ChevronsUpDown className="h-3.5 w-3.5 text-fg-faint" />
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-card border border-white/10 bg-bg-2 p-1 shadow-2xl">
          {stores.map((s) => (
            <button key={s.id} onClick={() => { setOpen(false); router.push(`/app/boutiques/${s.id}`); }} className={cn("flex w-full items-center gap-2.5 rounded-ctl px-2.5 py-2 text-left text-[13px] hover:bg-white/[0.05]", s.id === current.id && "text-accent")}>
              <span className="h-4 w-4 shrink-0 rounded-[5px]" style={{ background: `linear-gradient(135deg, ${s.theme.colors.accent}, ${s.theme.colors.primary})` }} />
              <span className="truncate">{s.name}</span>
            </button>
          ))}
          <Link href="/app" onClick={() => setOpen(false)} className="mt-1 flex items-center gap-2.5 border-t border-white/[0.06] px-2.5 py-2 text-[13px] text-fg/90 hover:text-white"><Plus className="h-4 w-4" /> Nouvelle boutique</Link>
        </div>
      )}
    </div>
  );
}

function SidebarBody() {
  const { user, usage, stores } = useApp();
  const params = useParams<{ id?: string }>();
  const router = useRouter();
  const storeId = params.id ?? stores[0]?.id;

  async function signOut() {
    await api.logout();
    router.push("/connexion");
  }

  return (
    <div className="flex h-full flex-col gap-1 p-3">
      <div className="px-1.5 pb-4 pt-1"><Logo href="/app" /></div>
      <NavLink href="/app" icon={Home} exact>Accueil</NavLink>
      <NavLink href="/app/boutiques" icon={StoreIcon} exact>Mes boutiques</NavLink>

      {storeId && (
        <>
          <p className="mt-5 px-2.5 pb-1.5 text-[10.5px] uppercase tracking-[0.14em] text-fg-muted">Ma boutique</p>
          <StoreSwitcher currentId={params.id} />
          <div className="mt-1 space-y-0.5">
            <NavLink href={`/app/boutiques/${storeId}`} icon={LayoutGrid} exact>Tableau de bord</NavLink>
            <NavLink href={`/app/boutiques/${storeId}/editeur`} icon={MessageSquare}>Éditeur IA</NavLink>
            <NavLink href={`/app/boutiques/${storeId}/studio`} icon={ImageIcon}>Studio et bibliothèque</NavLink>
            <NavLink href={`/app/boutiques/${storeId}/pilotage`} icon={BarChart3}>Pilotage</NavLink>
          </div>
        </>
      )}

      <div className="mt-auto space-y-3">
        {user.plan === "free" ? (
          <div className="rounded-card border border-accent/25 bg-accent-deep/30 p-3">
            <p className="text-xs leading-relaxed text-fg-muted">Active Vitrio Pro pour créer et modifier tes boutiques avec l'IA.</p>
            <Link href="/app" className="mt-2.5 block rounded-ctl bg-accent-strong py-1.5 text-center text-xs font-medium text-white transition hover:brightness-110">Activer Pro · 31 €/mois</Link>
          </div>
        ) : (
          <div className="space-y-2.5 rounded-card border border-white/[0.07] p-3">
            <AiBudgetMeter budget={usage.aiBudget} />
            <Meter label="Messages IA" used={usage.conversations.used} limit={usage.conversations.limit} />
            <Meter label="Images" used={usage.images.used} limit={usage.images.limit} />
          </div>
        )}
        <div className="space-y-0.5">
          <NavLink href="/app/abonnement" icon={CreditCard}>Abonnement</NavLink>
          <NavLink href="/app/affiliation" icon={Gift}>Affiliation</NavLink>
          <NavLink href="/app/aide" icon={HelpCircle}>Aide et contact</NavLink>
          <NavLink href="/app/parametres" icon={Settings}>Paramètres</NavLink>
        </div>
        <div className="flex items-center gap-2.5 border-t border-white/[0.06] px-1.5 pt-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent-deep text-sm text-accent">{user.firstName.charAt(0).toUpperCase()}</span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[13px]">{user.firstName}</p>
            <p className="truncate text-[11px] text-fg-faint">{user.email}</p>
          </div>
          <button onClick={signOut} aria-label="Se déconnecter" className="grid h-8 w-8 place-items-center rounded-ctl text-fg-faint hover:bg-white/5 hover:text-fg"><LogOut className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/[0.06] bg-bg/90 px-4 backdrop-blur lg:hidden">
        <Logo href="/app" />
        <button aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={open} onClick={() => setOpen((o) => !o)} className="grid h-10 w-10 place-items-center">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 top-14 z-40 overflow-y-auto bg-bg lg:hidden"><SidebarBody /></div>
      )}
      <aside className="sticky top-0 hidden h-dvh w-[248px] shrink-0 border-r border-white/[0.06] bg-bg-2 lg:block">
        <SidebarBody />
      </aside>
    </>
  );
}
