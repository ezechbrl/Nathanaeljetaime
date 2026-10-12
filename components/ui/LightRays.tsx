import { cn } from "@/lib/cn";

// Fond lumineux discret : halos verts sur blanc et grille fine qui s'efface.
export function LightRays({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="absolute inset-0 [background-image:linear-gradient(rgb(0_0_0/0.045)_1px,transparent_1px),linear-gradient(90deg,rgb(0_0_0/0.045)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,black,transparent_75%)]" />
      <div className="absolute left-1/2 top-[-14rem] h-[34rem] w-[64rem] -translate-x-1/2 animate-rays rounded-full bg-[radial-gradient(closest-side,rgb(149_191_71/0.28),transparent)]" />
      <div className="absolute right-[-10rem] top-[6rem] h-[24rem] w-[30rem] rounded-full bg-[radial-gradient(closest-side,rgb(0_128_96/0.12),transparent)]" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-bg" />
    </div>
  );
}
