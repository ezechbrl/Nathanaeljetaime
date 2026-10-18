import type { Metadata } from "next";
import { Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Container, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { FaqSection } from "@/components/site/Faq";
import { FinalCta } from "@/components/site/FinalCta";
import { NumberedList } from "@/components/site/NumberedList";
import { PageHero } from "@/components/site/PageHero";
import { PromptBox } from "@/components/site/PromptBox";

export const metadata: Metadata = {
  title: "Boutique Shopify clé en main",
  description: "Une boutique Shopify complète, prête à vendre, générée par l'IA en quelques minutes : stratégie, design, fiches produits, pages et SEO.",
};

const INCLUDED = [
  "Étude de marché et persona", "Promesse et positionnement", "Nom, slogan, ton de marque", "Palette et typographies",
  "Page d'accueil complète", "Fiches produits rédigées", "Prix conseillé et prix barré", "SEO de chaque page",
  "FAQ produit et générale", "Pages À propos, Livraison, Contact", "Menus principal et pied de page", "Visuels produit et bannières",
];

const FAQ = [
  { q: "Quelle différence avec une agence ?", a: "Une agence facture plusieurs centaines à plusieurs milliers d'euros et prend des semaines. Ici, la première version est prête en quelques minutes, et tu peux la modifier autant que tu veux." },
  { q: "Dois-je déjà avoir une boutique Shopify ?", a: "Non. Tu peux en ouvrir une pendant la création (Shopify propose une période d'essai), puis la connecter en deux clics." },
  { q: "Est-ce que je peux vendre tout de suite ?", a: "Une fois la boutique publiée et le paiement configuré dans Shopify, oui. On te guide pour les réglages restants (paiement, livraison, domaine)." },
  { q: "Les textes sont-ils uniques ?", a: "Oui. Ils sont écrits pour ta marque à partir de ta stratégie, pas copiés d'un modèle." },
];

export default function TurnkeyPage() {
  return (
    <>
      <PageHero eyebrow="Boutique prête à vendre" title={<>Une boutique Shopify <span className="serif-accent">prête à vendre</span> en 10 minutes</>} subtitle="Stratégie, textes, visuels, pages et SEO : ce qui prend trois semaines à la main est prêt en une dizaine de minutes, directement dans ta boutique.">
        <PromptBox />
      </PageHero>

      <section className="py-20">
        <Container>
          <SectionHeading title="Ce qui est inclus" subtitle="Tout est créé dans ta boutique Shopify, prêt à relire." />
          <div className="mx-auto mt-12 grid max-w-4xl gap-x-10 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {INCLUDED.map((x, i) => (
              <Reveal key={x} delay={(i % 3) * 50} className="flex gap-3 border-b border-white/[0.06] py-3 text-[15px]">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {x}
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <SectionHeading title="Comment ça se passe" />
          <div className="mt-12">
            <NumberedList items={[
              { title: "Tu décris ton produit", text: "Deux lignes, ou le lien d'une page produit." },
              { title: "L'IA pose la stratégie", text: "Marché, promesse, offres, objections." },
              { title: "Elle construit la boutique", text: "Identité, pages, fiches produits, visuels." },
              { title: "Tu relis et tu publies", text: "Modifie en discutant, puis publie sur Shopify." },
            ]} />
          </div>
          <Reveal className="mt-12 text-center"><ButtonLink href="/inscription" size="lg">Créer ma boutique clé en main</ButtonLink></Reveal>
        </Container>
      </section>

      <FaqSection title="Questions fréquentes" items={FAQ} />
      <FinalCta />
    </>
  );
}
