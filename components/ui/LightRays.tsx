import { cn } from "@/lib/cn";

// Fond de section « auvent de vitrine » : rayures diagonales fines dans un coin,
// lueur vert Shopify sur le côté et reflet vert feuille en bas. Le grain global est dans globals.css.
export function LightRays({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="absolute inset-0 [background:repeating-linear-gradient(135deg,rgb(94_211_140/0.09)_0_1px,transparent_1px_16px)] [mask-image:radial-gradient(ellipse_55%_70%_at_100%_0%,black,transparent_70%)]" />
      <div className="absolute -right-40 top-10 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(closest-side,rgb(0_128_96/0.32),transparent)]" />
      <div className="absolute -left-48 bottom-[-10rem] h-[28rem] w-[40rem] rounded-full bg-[radial-gradient(closest-side,rgb(149_191_71/0.09),transparent)]" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-bg" />
    </div>
  );
}
