import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Section";
import { SavingsCalculator } from "./SavingsCalculator";

// Le gain de temps, en un coup d'œil.
export function Compare() {
  return (
    <section className="py-20">
      <Container>
        <Reveal as="h2" className="max-w-2xl text-h2">Combien de temps tu <span className="serif-accent">gagnes</span> ?</Reveal>
        <Reveal delay={80}><SavingsCalculator /></Reveal>
        <p className="mt-3 text-xs text-fg-faint">Estimation : environ 3 semaines pour une boutique faite seul, 2 000 € en agence.</p>
      </Container>
    </section>
  );
}
