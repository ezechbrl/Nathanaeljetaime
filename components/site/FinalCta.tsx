import { ArrowRight, Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Section";
import { CTA } from "@/lib/launch";

// Dernier appel : la promesse et un seul bouton (le générateur est déjà en haut de page).
export function FinalCta({ title = <>Ta boutique Shopify, prête en <span className="serif-accent">10 minutes</span>.</> }: { title?: React.ReactNode }) {
  return (
    <section className="py-20">
      <Container>
        <div className="relative overflow-hidden rounded-[22px] border border-white/[0.08] bg-bg-2 p-6 sm:p-10 lg:p-14">
          <div aria-hidden className="absolute inset-0 [background:repeating-linear-gradient(135deg,rgb(94_211_140/0.06)_0_1px,transparent_1px_16px)] [mask-image:linear-gradient(90deg,transparent_40%,black)]" />
          <div aria-hidden className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgb(0_128_96/0.35),transparent)]" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <Reveal as="h2" className="text-h1">{title}</Reveal>
              <Reveal delay={80} as="p" className="mt-5 max-w-md text-[17px] leading-relaxed text-fg-muted">
                Colle le lien de ton produit : en 10 minutes, ta boutique est prête, avec photos, textes et avis. Tu relis, tu publies, tu vends.
              </Reveal>
              <Reveal delay={140} className="mt-6">
                <ul className="space-y-2 text-sm text-fg-muted">
                  {["31 €/mois, sans engagement", "Tu gardes tout, même si tu arrêtes", "Payé directement sur ta facture Shopify"].map((t) => (
                    <li key={t} className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" /> {t}</li>
                  ))}
                </ul>
              </Reveal>
            </div>
            <Reveal delay={200} className="flex lg:justify-end"><ButtonLink href="/inscription?mode=start" size="lg">{CTA.main} <ArrowRight className="h-4 w-4" /></ButtonLink></Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
