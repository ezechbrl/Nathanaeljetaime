import Link from "next/link";
import { useId } from "react";
import { site } from "@/lib/site";
import { cn } from "@/lib/cn";

// Vigenia : un sac de boutique (notre forme, pas celle de Shopify) avec le V au milieu,
// et une pastille « commande validée ».
export function LogoMark({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("h-7 w-7", className)}>
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#6ee7b7" /><stop offset=".55" stopColor="#10b07f" /><stop offset="1" stopColor="#047857" /></linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="#04211a" />
      <path d="M11.2 11.5V9.8a3.8 3.8 0 0 1 7.6 0v1.7" fill="none" stroke="#a7f3d0" strokeWidth="2" strokeLinecap="round" />
      <path d="M6.4 13c.1-.9.8-1.5 1.7-1.5h13.8c.9 0 1.6.6 1.7 1.5l.8 11.3A2.5 2.5 0 0 1 21.9 27H8.1a2.5 2.5 0 0 1-2.5-2.7z" fill={`url(#${id}g)`} />
      <path d="M10.6 15.6l4.4 7.6 4.4-7.6" fill="none" stroke="#04211a" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24.5" cy="8.5" r="4.3" fill="#d9f99d" stroke="#04211a" strokeWidth="1.5" />
      <path d="M22.6 8.6l1.3 1.3 2.4-2.6" fill="none" stroke="#04211a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
