"use client";

import {
  ChevronsUpDown, CreditCard, Gift, HelpCircle, Home, Image as ImageIcon, LayoutGrid, LogOut,
  Menu, MessageSquare, Plus, Settings, Sparkles, Store as StoreIcon, TrendingUp, Wand2, X,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UsagePercent } from "@/components/ui/Feedback";
import { Logo } from "@/components/ui/Logo";
import * as api from "@/lib/api/client";
import { cn } from "@/lib/cn";
import { useApp } from "./AppContext";

// Une petite couleur par rubrique (pastille d'icône), pour s'y retrouver d'un coup d'œil.
const TINTS = {
  green: "bg-white/[0.06] text-[#3dff9a]",
  blue: "bg-[#3b82f6]/15 text-[#7cb2ff]",
  violet: "bg-[#8b5cf6]/15 text-[#b49bff]",
  amber: "bg-[#f59e0b]/15 text-[#fbbf5a]",
  pink: "bg-[#ec4899]/15 text-[#f58bc0]",
  teal: "bg-[#14b8a6]/15 text-[#5eead4]",
  rose: "bg-[#f43f5e]/15 text-[#fb8197]",
  sky: "bg-[#0ea5e9]/15 text-[#6cc9f5]",
  grey: "bg-white/[0.08] text-white",
} as const;

function NavLink({ href, icon: Icon, children, exact, tint = "grey" }: { href: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode; exact?: boolean; tint?: keyof typeof TINTS }) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={cn("flex items-center gap-3 rounded-ctl px-2 py-[7px] text-[15px] text-white transition-colors", active ? "bg-white/[0.1] font-semibold" : "font-medium hover:bg-white/[0.05]")}>
      <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-[10px] transition-transform", TINTS[tint], active && "scale-105 ring-1 ring-white/20")}><Icon className="h-[18px] w-[18px]" /></span> {children}
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
        <span className="flex-1 truncate font-semibold text-white">{current.name}</span>
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
      {/* Le logo est déjà dans la barre du haut sur téléphone. */}
      <div className="hidden px-1.5 pb-4 pt-1 lg:block"><Logo href="/app" /></div>
      <NavLink href="/app" icon={Home} exact tint="green">Accueil</NavLink>
      <NavLink href="/app/boutiques" icon={StoreIcon} exact>Mes boutiques</NavLink>
      {user.isOwner && <NavLink href="/ventes" icon={TrendingUp} tint="amber">Mes ventes</NavLink>}

      {storeId && (
        <>
          <p className="mt-5 px-2.5 pb-1.5 font-serif text-[17px] italic text-white/90">Ma boutique</p>
          <StoreSwitcher currentId={params.id} />
          <div className="mt-1 space-y-0.5">
            <NavLink href={`/app/boutiques/${storeId}`} icon={LayoutGrid} exact>Tableau de bord</NavLink>
            <NavLink href={`/app/boutiques/${storeId}/editeur`} icon={MessageSquare} tint="amber">Éditeur IA</NavLink>
            <NavLink href={`/app/boutiques/${storeId}/studio`} icon={ImageIcon}>Studio et bibliothèque</NavLink>
            <NavLink href="/app/outils" icon={Wand2}>Outils IA (nom, slogan…)</NavLink>
          </div>
        </>
      )}

      <div className="mt-auto space-y-3">
        {user.plan === "free" ? (
          <div className="relative overflow-hidden rounded-card border border-white/15 bg-white/[0.03] p-3.5">
            <span aria-hidden className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/[0.06] blur-2xl" />
            <p className="relative flex items-center gap-1.5 font-serif text-[17px] italic text-white"><Sparkles className="h-4 w-4 text-[#3dff9a]" /> Débloque ta boutique complète</p>
            <p className="relative mt-1 text-[13px] leading-relaxed text-white/80">Textes, photos, éditeur IA et mise en ligne sur Shopify. Sans engagement.</p>
            <Link href="/app/abonnement" className="relative mt-3 flex h-10 items-center justify-center rounded-full bg-[linear-gradient(180deg,#34f0b0,#0fae7c)] glow-hover text-[13.5px] font-semibold text-[#03140d] transition hover:brightness-110">Choisir mon offre</Link>
          </div>
        ) : (
          <Link href="/app/abonnement" className="block rounded-card border border-white/[0.08] bg-black/20 p-3 transition-colors hover:border-accent/30">
            <UsagePercent usage={usage} />
          </Link>
        )}
        <div className="space-y-0.5">
          <NavLink href="/app/abonnement" icon={CreditCard}>Abonnement</NavLink>
          <NavLink href="/app/affiliation" icon={Gift} tint="rose">Affiliation</NavLink>
          <NavLink href="/app/aide" icon={HelpCircle}>Aide et contact</NavLink>
          <NavLink href="/app/parametres" icon={Settings}>Paramètres</NavLink>
        </div>
        <div className="flex items-center gap-2.5 border-t border-white/[0.06] px-1.5 pt-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white glow-hover text-sm font-semibold text-[#03140d]">{user.firstName.charAt(0).toUpperCase()}</span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[14px] font-semibold text-white">{user.firstName}</p>
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
      <aside className="sticky top-0 hidden h-dvh w-[248px] shrink-0 border-r border-white/[0.06] bg-black/10 backdrop-blur-sm lg:block">
        <SidebarBody />
      </aside>
    </>
  );
}
