import Link from "next/link";
import { useId } from "react";
import { site } from "@/lib/site";
import { cn } from "@/lib/cn";

// Vitrio : un V en forme de coche (la vente réussie), dégradé émeraude → citron vert, avec l'étincelle de l'IA.
export function LogoMark({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("h-7 w-7", className)}>
      <defs>
        <linearGradient id={`${id}v`} x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#059669" /><stop offset=".6" stopColor="#2ee6a6" /><stop offset="1" stopColor="#d9f99d" /></linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="#04211a" />
      <rect x=".5" y=".5" width="31" height="31" rx="8.5" fill="none" stroke="#2ee6a6" strokeOpacity=".25" />
      <path d="M8.5 12.5l6.2 11.2c.5.9 1.8.9 2.3 0L24.5 9" fill="none" stroke={`url(#${id}v)`} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24.8" cy="5.6" r="1.6" fill="#d9f99d" />
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
