import { LightRays } from "@/components/ui/LightRays";
import { Logo } from "@/components/ui/Logo";
import { StoreFrame } from "@/components/site/StoreFrame";
import { SHOWCASE } from "@/lib/content/showcase";

export function AuthShell({ title, subtitle, children }: { title: React.ReactNode; subtitle?: string; children: React.ReactNode }) {
  return (
    <main id="main" className="grid min-h-dvh grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="flex min-w-0 flex-col px-5 py-8 sm:px-12 lg:px-20">
        <Logo />
        <div className="relative mx-auto flex w-full max-w-[480px] flex-1 flex-col justify-center py-10 sm:py-12">
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(46_230_166/0.18),transparent)]" />
          <h1 className="bg-[linear-gradient(180deg,#ffffff_30%,#a7f3d0)] bg-clip-text text-[2.4rem] font-semibold leading-tight tracking-[-0.04em] text-transparent sm:text-[2.8rem]">{title}</h1>
          {subtitle && <p className="mt-2 text-fg-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden border-l border-white/[0.06] lg:block">
        <LightRays />
        <div className="absolute inset-0 flex flex-col justify-center px-16">
          <p className="max-w-md text-h2">Ta vitrine Shopify, prête en <span className="serif-accent">10 minutes</span>.</p>
          {/* Deux vraies boutiques créées par Vitrio (photos produit générées par l'IA). */}
          <div className="relative mt-12 h-[360px]">
            <div className="absolute left-0 top-16 w-[58%] -rotate-3 transition-transform duration-500 hover:rotate-0"><StoreFrame s={SHOWCASE.find((x) => x.slug === "macho")!} phone={false} /></div>
            <div className="absolute right-0 top-0 w-[62%] rotate-2 transition-transform duration-500 hover:rotate-0"><StoreFrame s={SHOWCASE.find((x) => x.slug === "norde")!} /></div>
          </div>
          <p className="mt-6 text-sm text-fg-muted">Deux vraies boutiques créées par Vitrio : textes, photos et offres.</p>
        </div>
      </div>
    </main>
  );
}
