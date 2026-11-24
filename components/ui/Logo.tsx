import Link from "next/link";
import { site } from "@/lib/site";
import { cn } from "@/lib/cn";

// Vigenia : un V net et moderne, blanc avec la branche droite en vert électrique, sur un carré noir.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("h-7 w-7", className)}>
      <rect x=".5" y=".5" width="31" height="31" rx="9" fill="#0a0a0a" stroke="rgb(255 255 255 / .18)" />
      <path d="M9 10.5l7 12.5" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M16 23l7-12.5" fill="none" stroke="#14b886" strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="24.6" cy="6.9" r="1.7" fill="#14b886" />
    </svg>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5 text-[18px] tracking-tight text-fg", className)} aria-label={`${site.name}, accueil`}>
      <LogoMark />
      <span>{site.name}</span>
    </Link>
  );
}
