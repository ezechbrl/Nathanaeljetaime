"use client";

import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";
import { CTA, isWaitlist } from "@/lib/launch";

// Barre simple : logo à gauche, Connexion et le bouton à droite. Exemples, Comment ça marche, Tarifs
// et Contact restent dans le pied de page.
export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-[background,border-color,backdrop-filter] duration-300", scrolled ? "border-b border-white/[0.06] bg-bg/75 backdrop-blur-xl" : "border-b border-transparent")}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-bg-3 focus:px-3 focus:py-2">Aller au contenu</a>
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:h-[72px] lg:px-10">
        <Logo className="lg:gap-3 lg:text-[22px] lg:font-semibold [&_svg]:lg:h-9 [&_svg]:lg:w-9" />
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ButtonLink href="/connexion" variant="ghost" size="md" className="!h-10 !px-2 !text-[15px] sm:!px-4 lg:!h-11 lg:!px-5 lg:!text-base">Connexion</ButtonLink>
          <ButtonLink href={isWaitlist ? "/inscription" : "/quiz"} size="md" className="!h-10 !px-3 !text-[14px] font-semibold sm:!px-4 sm:!text-[15px] lg:!h-11 lg:!px-6 lg:!text-base">{CTA.main}</ButtonLink>
        </div>
      </div>
    </header>
  );
}
