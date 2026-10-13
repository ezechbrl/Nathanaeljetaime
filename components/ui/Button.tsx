import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-ctl font-medium transition-[background,border-color,box-shadow,transform,color] duration-200 ease-out active:translate-y-px disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "border border-accent/40 bg-[linear-gradient(180deg,#00a676,#007a5a)] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_0_0_1px_rgb(0_0_0/0.25),0_8px_24px_-8px_rgb(0_166_118/0.5)] hover:border-accent/70 hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.3),0_0_0_1px_rgb(0_0_0/0.25),0_10px_32px_-8px_rgb(0_166_118/0.65)]",
  secondary: "border border-white/10 bg-white/[0.04] text-fg hover:border-white/20 hover:bg-white/[0.07]",
  ghost: "text-fg-muted hover:bg-white/[0.05] hover:text-fg",
  danger: "border border-bad/30 bg-bad/10 text-bad hover:bg-bad/15",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

type Common = { variant?: Variant; size?: Size; className?: string; children: React.ReactNode };

export function Button({ variant = "primary", size = "md", className, ...props }: Common & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export function ButtonLink({ variant = "primary", size = "md", className, href, ...props }: Common & { href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return <Link href={href} className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export function Spinner({ className }: { className?: string }) {
  return <span aria-hidden className={cn("inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent", className)} />;
}
