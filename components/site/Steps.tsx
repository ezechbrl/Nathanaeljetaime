import { Reveal } from "@/components/ui/Reveal";
import { Container, SectionHeading } from "@/components/ui/Section";
import { VideoSteps } from "./VideoSteps";

export function Steps() {
  return (
    <section id="comment-ca-marche" className="py-24">
      <Container>
        <SectionHeading
          eyebrow="Comment ça marche"
          title={<>Ta boutique Shopify en <span className="serif-accent">4 étapes</span>.</>}
          subtitle="L'interface réelle de Vitrio, filmée pas à pas : de la connexion Shopify à la boutique qui s'améliore toute seule."
        />
        <Reveal delay={100} className="mt-14"><VideoSteps /></Reveal>
      </Container>
    </section>
  );
}
