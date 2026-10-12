import { ContactForm } from "@/components/ContactForm";
import { MarketingShell, PageHero } from "@/components/MarketingShell";
import { site } from "@/lib/site";

export const metadata = { title: `Contact — ${site.name}` };

export default function ContactPage() {
  return (
    <MarketingShell>
      <PageHero eyebrow="Contact" title="Une question ? Parlons-en." subtitle="Notre équipe te répond en moins de 24 h ouvrées." />
      <div className="mx-auto grid max-w-5xl gap-8 px-4 pb-24 md:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          {[
            { t: "Support", d: "Un souci avec ta boutique ou ton compte." },
            { t: "Partenariats & agences", d: "Gérer plusieurs boutiques, offres sur mesure." },
            { t: "Presse", d: "Demandes média et interviews." },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl border border-black/5 p-5">
              <p className="font-semibold">{c.t}</p>
              <p className="mt-1 text-sm text-black/60">{c.d}</p>
            </div>
          ))}
        </div>
        <ContactForm />
      </div>
    </MarketingShell>
  );
}
