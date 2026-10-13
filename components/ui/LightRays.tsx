import { cn } from "@/lib/cn";

// Fond lumineux : faisceaux verts diffus, halo vert Shopify et grille fine qui s'efface.
export function LightRays({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="absolute inset-0 [background-image:linear-gradient(rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.035)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_65%_50%_at_50%_0%,black,transparent_75%)]" />
      <div className="absolute inset-x-[-20%] top-[-30%] h-[120%] animate-rays opacity-90 [background:repeating-linear-gradient(100deg,transparent_0_6%,rgb(94_211_140/0.06)_8%,transparent_12%_18%)] [filter:blur(28px)] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_20%,black,transparent_75%)]" />
      <div className="absolute left-1/2 top-[-12rem] h-[34rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(0_128_96/0.32),transparent)]" />
      <div className="absolute right-[-12rem] top-[4rem] h-[22rem] w-[30rem] rounded-full bg-[radial-gradient(closest-side,rgb(149_191_71/0.10),transparent)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />
    </div>
  );
}
