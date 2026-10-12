import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-[1200px] px-4 sm:px-6", className)}>{children}</div>;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-xl", className)}>
      {eyebrow && <Reveal><span className="eyebrow">{eyebrow}</span></Reveal>}
      <Reveal delay={60}><h2 className={cn("text-h2", eyebrow && "mt-5")}>{title}</h2></Reveal>
      {subtitle && <Reveal delay={120}><p className="mt-4 text-[17px] leading-relaxed text-fg-muted">{subtitle}</p></Reveal>}
    </div>
  );
}
