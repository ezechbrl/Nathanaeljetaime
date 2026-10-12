import Link from "next/link";
import { Faq } from "@/components/landing/Faq";
import { MarketingShell, PageHero } from "@/components/MarketingShell";
import { PLANS } from "@/lib/mock";
import { site } from "@/lib/site";

export const metadata = { title: `Tarifs — ${site.name}` };

export default function PricingPage() {
  return (
    <MarketingShell>
      <PageHero eyebrow="Tarifs" title="Simple, sans engagement" subtitle="Commence gratuitement, passe à Pro quand ta boutique décolle." />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 pb-24 md:grid-cols-3">
        {PLANS.map((p) => (
          <div
            key={p.name}
            className={`flex flex-col rounded-3xl border p-8 ${p.highlighted ? "border-brand bg-brand-soft/40 shadow-xl shadow-brand/10" : "border-black/10"}`}
          >
            {p.highlighted && <span className="mb-4 w-fit rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">Le plus choisi</span>}
            <h2 className="text-xl font-semibold">{p.name}</h2>
            <p className="mt-1 text-sm text-black/60">{p.description}</p>
            <p className="mt-6 text-4xl font-bold">{p.price}<span className="text-base font-normal text-black/50">{p.period}</span></p>
            <ul className="mt-6 flex-1 space-y-3 text-sm">
              {p.features.map((f) => <li key={f} className="flex gap-2"><span className="text-brand">✓</span>{f}</li>)}
            </ul>
            <Link
              href={p.name === "Agence" ? "/contact" : "/inscription"}
              className={`mt-8 rounded-full px-6 py-3 text-center text-sm font-semibold ${p.highlighted ? "bg-brand text-white hover:bg-brand/90" : "bg-ink text-white hover:bg-black/80"}`}
            >
              {p.cta}
            </Link>
          </div>
        ))}
      </div>
      <Faq />
    </MarketingShell>
  );
}
