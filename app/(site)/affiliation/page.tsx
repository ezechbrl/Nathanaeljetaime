import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { AffiliateCalculator } from "@/components/site/AffiliateCalculator";
import { FaqSection } from "@/components/site/Faq";
import { NumberedList } from "@/components/site/NumberedList";
import { PageHero } from "@/components/site/PageHero";
import { AFFILIATE } from "@/lib/content/affiliate";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Programme d'affiliation", description: `Gagne ${AFFILIATE.rate * 100} % de commission récurrente pendant ${AFFILIATE.months} mois sur chaque client que tu recommandes.` };

const FAQ = [
  { q: "Qui peut devenir affilié ?", a: `Tout le monde : créateurs de contenu, formateurs e-commerce, agences, clients de ${site.name}. Il suffit d'un compte.` },
  { q: "Comment sont suivis mes filleuls ?", a: `Ton lien pose un cookie de ${AFFILIATE.cookieDays} jours. Si la personne crée un compte dans ce délai, elle t'est attribuée.` },
  { q: "Quand suis-je payé ?", a: `Chaque mois, par virement, dès que tes commissions validées atteignent ${AFFILIATE.minPayout} €. Une commission est validée 30 jours après le paiement du client.` },
  { q: "Puis-je utiliser la publicité payante ?", a: `Oui, sauf sur le nom « ${site.name} » en mot-clé de recherche. Les conditions complètes sont dans les conditions d'affiliation.` },
];

export default function AffiliatePage() {
  return (
    <>
      <PageHero eyebrow="Devenir partenaire" title={<><span className="serif-accent">{AFFILIATE.rate * 100} %</span> sur chaque client que tu recommandes</>} subtitle={`Une commission récurrente pendant ${AFFILIATE.months} mois. Un lien, un tableau de bord, des paiements mensuels.`}>
        <ButtonLink href="/inscription?next=/app/affiliation" size="lg">Devenir affilié</ButtonLink>
      </PageHero>
      <Container className="grid max-w-[1050px] items-center gap-12 lg:grid-cols-2">
        <div>
          <Reveal as="h2" className="text-h2">Combien tu peux gagner</Reveal>
          <Reveal delay={80} as="p" className="mt-4 text-[17px] leading-relaxed text-fg-muted">Tu touches {AFFILIATE.rate * 100} % de chaque paiement de tes filleuls, chaque mois, pendant {AFFILIATE.months} mois. Pas de plafond.</Reveal>
        </div>
        <Reveal delay={100}><AffiliateCalculator /></Reveal>
      </Container>
      <section className="py-24">
        <Container>
          <NumberedList items={[
            { title: "Inscris-toi", text: "Crée ton compte et active l'affiliation en un clic." },
            { title: "Partage ton lien", text: "Vidéos, newsletter, formation, clients : où tu veux." },
            { title: "Ils créent leur boutique", text: `Cookie de ${AFFILIATE.cookieDays} jours, attribution automatique.` },
            { title: "Tu es payé chaque mois", text: `Virement dès ${AFFILIATE.minPayout} € de commissions validées.` },
          ]} />
        </Container>
      </section>
      <FaqSection title="Questions sur l'affiliation" items={FAQ} />
    </>
  );
}
