import Link from "next/link";
import { site } from "@/lib/site";
import { cn } from "@/lib/cn";

// Vitrio : une vitrine (store) stylisée en V.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("h-7 w-7", className)}>
      <rect width="32" height="32" rx="8" fill="#008060" />
      <path d="M7 10.5h18l-1.4-3.2a1.5 1.5 0 0 0-1.37-.9H9.77a1.5 1.5 0 0 0-1.37.9L7 10.5Z" fill="#95bf47" />
      <path d="m10.5 13.5 5.5 11 5.5-11" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5 font-display text-[19px] font-semibold tracking-tight text-fg", className)} aria-label={`${site.name}, accueil`}>
      <LogoMark />
      <span>{site.name}</span>
    </Link>
  );
}
