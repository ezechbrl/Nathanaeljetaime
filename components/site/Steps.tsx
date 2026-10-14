import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Section";
import { VideoSteps } from "./VideoSteps";

export function Steps() {
  return (
    <section id="comment-ca-marche" className="py-20">
      <Container>
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
          <Reveal as="h2" className="text-h2">Regarde-la se <span className="serif-accent">construire</span>.</Reveal>
          <Reveal delay={80} as="p" className="text-[17px] leading-relaxed text-fg-muted lg:pb-2">
            Pas de maquette : c'est la vraie application, filmée écran par écran, de la connexion Shopify jusqu'aux recommandations du matin.
          </Reveal>
        </div>
        <Reveal delay={100} className="mt-12"><VideoSteps /></Reveal>
      </Container>
    </section>
  );
}
