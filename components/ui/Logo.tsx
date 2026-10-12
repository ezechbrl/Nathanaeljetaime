import Link from "next/link";
import { site } from "@/lib/site";
import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("h-7 w-7", className)}>
      <defs>
        <linearGradient id="lm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7af0de" />
          <stop offset="1" stopColor="#0f8f86" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="8" fill="#063139" stroke="url(#lm)" strokeOpacity=".6" />
      <path d="M10 12.5h12l-1.2 10.2a2 2 0 0 1-2 1.8h-5.6a2 2 0 0 1-2-1.8L10 12.5Z" fill="none" stroke="url(#lm)" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M13 12.5V11a3 3 0 0 1 6 0v1.5" fill="none" stroke="url(#lm)" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m13.5 18.5 2 2 3.5-4" fill="none" stroke="#7af0de" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5 text-[17px] tracking-tight text-fg", className)} aria-label={`${site.name}, accueil`}>
      <LogoMark />
      <span>{site.name}</span>
    </Link>
  );
}
