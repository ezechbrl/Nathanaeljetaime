import { LightRays } from "@/components/ui/LightRays";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

export function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative pb-16 pt-36 text-center sm:pt-44", className)}>
      <LightRays />
      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6">
        {eyebrow && <Reveal><span className="eyebrow">{eyebrow}</span></Reveal>}
        <Reveal delay={80} as="h1" className="mx-auto mt-6 max-w-4xl text-h1">{title}</Reveal>
        {subtitle && <Reveal delay={160} as="p" className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-fg-muted sm:text-lg">{subtitle}</Reveal>}
        {children && <Reveal delay={240} className="mt-10">{children}</Reveal>}
      </div>
    </section>
  );
}
