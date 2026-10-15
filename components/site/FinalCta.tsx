import { Check } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Section";
import { PromptBox } from "./PromptBox";

// Dernier appel : le générateur directement, à côté de la promesse.
export function FinalCta({ title = <>Ta boutique Shopify, prête <span className="serif-accent">ce soir</span>.</> }: { title?: React.ReactNode }) {
  return (
    <section className="py-20">
      <Container>
        <div className="relative overflow-hidden rounded-[22px] border border-white/[0.08] bg-bg-2 p-6 sm:p-10 lg:p-14">
          <div aria-hidden className="absolute inset-0 [background:repeating-linear-gradient(135deg,rgb(94_211_140/0.06)_0_1px,transparent_1px_16px)] [mask-image:linear-gradient(90deg,transparent_40%,black)]" />
          <div aria-hidden className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgb(0_128_96/0.35),transparent)]" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <Reveal as="h2" className="text-h1">{title}</Reveal>
              <Reveal delay={80} as="p" className="mt-5 max-w-md text-[17px] leading-relaxed text-fg-muted">
                Écris ce que tu vends et à qui. Dans dix minutes, tu relis ta boutique ; demain matin, tu as tes premières recommandations.
              </Reveal>
              <Reveal delay={140} className="mt-6">
                <ul className="space-y-2 text-sm text-fg-muted">
                  {["31 €/mois, sans engagement", "Tu gardes tout, même si tu arrêtes", "Payé directement sur ta facture Shopify"].map((t) => (
                    <li key={t} className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" /> {t}</li>
                  ))}
                </ul>
              </Reveal>
            </div>
            <Reveal delay={200}><PromptBox align="left" inputId="prompt-fin" className="max-w-none" /></Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
