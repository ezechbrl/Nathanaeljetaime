import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Section";
import { BeforeAfter } from "./BeforeAfter";
import { SavingsCalculator } from "./SavingsCalculator";

// Le gain de temps : avant / maintenant en images, puis le calcul.
export function Compare() {
  return (
    <section className="py-12 sm:py-20">
      <Container>
        <Reveal as="h2" className="max-w-2xl text-h2">Combien de temps tu <span className="serif-accent">gagnes</span> ?</Reveal>
        <Reveal delay={80} className="mt-6 sm:mt-8"><BeforeAfter /></Reveal>
        <Reveal delay={120} className="hidden sm:block"><SavingsCalculator /></Reveal>
        <p className="mt-3 hidden text-xs text-fg-faint sm:block">Estimation : environ 3 semaines pour une boutique faite seul, 2 000 € en agence.</p>
      </Container>
    </section>
  );
}
