import { Footer } from "./Footer";
import { Header } from "./Header";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}

export function PageHero({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <section className="bg-gradient-to-b from-brand-soft/60 to-white px-4 pb-16 pt-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand">{eyebrow}</p>
      <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
      {subtitle && <p className="mx-auto mt-5 max-w-xl text-lg text-black/60">{subtitle}</p>}
    </section>
  );
}
