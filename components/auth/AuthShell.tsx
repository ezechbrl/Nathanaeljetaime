import { LightRays } from "@/components/ui/LightRays";
import { Logo } from "@/components/ui/Logo";
import { StoreFrame } from "@/components/site/StoreFrame";
import { SHOWCASE } from "@/lib/content/showcase";

export function AuthShell({ title, subtitle, children }: { title: React.ReactNode; subtitle?: string; children: React.ReactNode }) {
  return (
    <main id="main" className="grid min-h-dvh lg:grid-cols-[1fr_1.05fr]">
      <div className="flex flex-col px-5 py-8 sm:px-12 lg:px-20">
        <Logo />
        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-12">
          <h1 className="text-[2.25rem] leading-tight tracking-[-0.04em]">{title}</h1>
          {subtitle && <p className="mt-2 text-fg-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden border-l border-black/[0.06] bg-bg-2 lg:block">
        <LightRays />
        <div className="absolute inset-0 flex flex-col justify-center px-16">
          <p className="max-w-md text-h2">Décris ton produit. <span className="serif-accent">L'IA</span> construit ta boutique.</p>
          <div className="relative mt-14 h-[320px]">
            <div className="absolute left-0 top-10 w-[58%] -rotate-3 opacity-80"><StoreFrame s={SHOWCASE[2]} phone={false} /></div>
            <div className="absolute right-0 top-0 w-[62%] rotate-2"><StoreFrame s={SHOWCASE[1]} /></div>
          </div>
        </div>
      </div>
    </main>
  );
}
