import { cn } from "@/lib/cn";

// Faisceaux de lumière diffus en arrière-plan (pur CSS, animés lentement).
export function LightRays({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="absolute inset-x-[-20%] top-[-30%] h-[120%] animate-rays opacity-90 [background:repeating-linear-gradient(100deg,transparent_0_6%,rgb(79_227_207/0.07)_8%,transparent_12%_18%)] [filter:blur(28px)] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_20%,black,transparent_75%)]" />
      <div className="absolute left-1/2 top-[-12rem] h-[34rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(22_170_156/0.28),transparent)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />
    </div>
  );
}
