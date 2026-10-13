import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-ctl font-medium transition-[background,border-color,box-shadow,transform,color] duration-200 ease-out active:translate-y-px disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "border border-white/10 bg-[linear-gradient(180deg,#0b3324,#041a13)] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_10px_28px_-10px_rgb(4_26_19/0.8)] hover:border-accent/40 hover:bg-[linear-gradient(180deg,#0f3f2d,#06231a)] hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_14px_34px_-10px_rgb(4_26_19/0.9)]",
  secondary: "border border-white/20 bg-white/[0.08] text-fg hover:border-white/35 hover:bg-white/[0.14]",
  ghost: "text-fg-muted hover:bg-white/[0.08] hover:text-fg",
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
