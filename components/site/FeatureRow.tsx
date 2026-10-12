import { Check } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

export function FeatureRow({
  eyebrow,
  title,
  text,
  points,
  visual,
  reverse,
}: {
  eyebrow: string;
  title: React.ReactNode;
  text: string;
  points: string[];
  visual: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <div className="grid items-center gap-10 py-16 lg:grid-cols-2 lg:gap-20">
      <div className={cn(reverse && "lg:order-2")}>
        <Reveal><p className="text-sm text-accent">{eyebrow}</p></Reveal>
        <Reveal delay={60} as="h2" className="mt-3 text-h2">{title}</Reveal>
        <Reveal delay={120} as="p" className="mt-5 text-[17px] leading-relaxed text-fg-muted">{text}</Reveal>
        <ul className="mt-7 space-y-3">
          {points.map((p, i) => (
            <Reveal key={p} as="li" delay={160 + i * 50} className="flex gap-3 text-[15px]">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {p}
            </Reveal>
          ))}
        </ul>
      </div>
      <Reveal delay={100} className={cn(reverse && "lg:order-1")}>{visual}</Reveal>
    </div>
  );
}
