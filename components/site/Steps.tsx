import { Reveal } from "@/components/ui/Reveal";
import { Container, SectionHeading } from "@/components/ui/Section";
import { VideoSteps } from "./VideoSteps";

export function Steps() {
  return (
    <section id="comment-ca-marche" className="py-24">
      <Container>
        <SectionHeading
          eyebrow="Comment ça marche"
          title={<>Quatre gestes, <span className="serif-accent">une</span> boutique.</>}
          subtitle="Pas de maquette : c'est la vraie application, filmée écran par écran."
        />
        <Reveal delay={100} className="mt-14"><VideoSteps /></Reveal>
      </Container>
    </section>
  );
}
