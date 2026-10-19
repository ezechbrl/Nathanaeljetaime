import Link from "next/link";
import { useId } from "react";
import { site } from "@/lib/site";
import { cn } from "@/lib/cn";

// Vitrio : un V taillé comme un prisme de verre (la vitrine), avec l'étincelle de l'IA.
export function LogoMark({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("h-7 w-7", className)}>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#0d5c44" /><stop offset="1" stopColor="#04241b" /></linearGradient>
        <linearGradient id={`${id}l`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d9fbe9" /><stop offset="1" stopColor="#6ee7b7" /></linearGradient>
        <linearGradient id={`${id}r`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#34d399" /><stop offset="1" stopColor="#059669" /></linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${id}bg)`} />
      <rect x=".5" y=".5" width="31" height="31" rx="8.5" fill="none" stroke="#6ee7b7" strokeOpacity=".35" />
      <path d="M6.5 9h5.2L16 20.6V26z" fill={`url(#${id}l)`} />
      <path d="M25.5 9h-5.2L16 20.6V26z" fill={`url(#${id}r)`} />
      <path d="M11.7 9h8.6L16 20.6z" fill="#a7f3d0" fillOpacity=".22" />
      <path d="M24.6 3.2l.75 1.9 1.9.75-1.9.75-.75 1.9-.75-1.9-1.9-.75 1.9-.75z" fill="#d9f99d" />
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
