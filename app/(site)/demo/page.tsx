import type { Metadata } from "next";
import { Container } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { VideoSteps } from "@/components/site/VideoSteps";
import { PageHero } from "@/components/site/PageHero";
import { FinalCta } from "@/components/site/FinalCta";

export const metadata: Metadata = { title: "Comment ça marche", description: "Regarde un brief de deux lignes devenir une boutique Shopify complète." };

const TIMELINE = [
  { t: "0:00", title: "Le brief", text: "Deux lignes : ton produit, ta cible, l'ambiance voulue. Ou le lien d'une page produit." },
  { t: "0:40", title: "La stratégie", text: "Marché, persona, promesse, trois offres et les objections d'achat avec leurs réponses." },
  { t: "2:00", title: "La boutique", text: "Identité, page d'accueil, fiche produit, FAQ, pages, visuels. Tu relis et tu ajustes en discutant." },
  { t: "4:30", title: "La publication", text: "Thème, produits, pages et menus arrivent dans ta boutique Shopify, en brouillon." },
];

export default function DemoPage() {
  return (
    <>
      <PageHero eyebrow="Comment ça marche" title={<>De ta phrase à ta boutique, <span className="serif-accent">écran par écran</span>.</>} subtitle="La vraie application, filmée du début à la fin : voici ce qui se passe quand tu cliques sur « Générer »." />
      <Container>
        <Reveal><VideoSteps /></Reveal>
        <ol className="mt-20 grid gap-px overflow-hidden rounded-card border border-white/[0.07] bg-white/[0.07] md:grid-cols-4">
          {TIMELINE.map((s, i) => (
            <Reveal as="li" key={s.t} delay={i * 80} className="bg-bg p-6">
              <p className="font-mono text-xs text-accent">{s.t}</p>
              <p className="mt-3 text-lg tracking-tight">{s.title}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-fg-muted">{s.text}</p>
            </Reveal>
          ))}
        </ol>
        <Reveal className="mt-14 text-center"><ButtonLink href="/inscription" size="lg">Essayer avec mon produit</ButtonLink></Reveal>
      </Container>
      <FinalCta />
    </>
  );
}
