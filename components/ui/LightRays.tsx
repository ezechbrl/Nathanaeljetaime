import { cn } from "@/lib/cn";

// Fond de section : ondes concentriques qui partent du haut, halo clair qui tourne lentement,
// semis de points et dégradé vers le vert foncé. Le grain global est dans globals.css.
export function LightRays({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgb(0_166_118),transparent_70%)]" />
      <div className="absolute left-1/2 top-[-38rem] h-[76rem] w-[76rem] -translate-x-1/2 animate-spin-slow opacity-60 [background:conic-gradient(from_0deg,transparent_0deg,rgb(212_245_156/0.22)_40deg,transparent_95deg,transparent_180deg,rgb(255_255_255/0.12)_230deg,transparent_290deg)] [filter:blur(60px)] [mask-image:radial-gradient(closest-side,black,transparent)]" />
      <div className="absolute inset-0 [background:repeating-radial-gradient(circle_at_50%_-8%,transparent_0_70px,rgb(255_255_255/0.075)_71px_72px)] [mask-image:radial-gradient(ellipse_70%_65%_at_50%_0%,black_10%,transparent_75%)]" />
      <div className="absolute inset-0 [background-image:radial-gradient(rgb(255_255_255/0.16)_1px,transparent_1.5px)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_45%_35%_at_85%_30%,black,transparent_70%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />
    </div>
  );
}
