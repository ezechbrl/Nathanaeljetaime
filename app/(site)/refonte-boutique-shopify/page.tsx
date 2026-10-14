import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { Container, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { FaqSection } from "@/components/site/Faq";
import { RecraftMock } from "@/components/site/FeatureMocks";
import { FinalCta } from "@/components/site/FinalCta";
import { NumberedList } from "@/components/site/NumberedList";
import { PageHero } from "@/components/site/PageHero";

export const metadata: Metadata = {
  title: "Refonte de boutique Shopify",
  description: "Ta boutique a du trafic mais ne vend pas assez ? L'IA analyse tes pages et réécrit ce qui freine la vente, sans toucher à tes commandes.",
};

const CHECKS = [
  { title: "Promesse floue", text: "Le visiteur ne comprend pas en 5 secondes ce que tu vends et pourquoi toi." },
  { title: "Fiche produit qui décrit au lieu de vendre", text: "Des caractéristiques, pas de bénéfices, pas de réponse aux objections." },
  { title: "Bouton d'achat trop bas sur mobile", text: "Le prix et le bouton n'apparaissent qu'après plusieurs écrans." },
  { title: "Pas d'offre", text: "Aucune raison d'acheter maintenant ni d'ajouter un deuxième article." },
  { title: "Réassurance absente", text: "Délais, retours et paiement sécurisé introuvables avant le paiement." },
  { title: "Ton incohérent", text: "Chaque page semble écrite par quelqu'un de différent." },
];

const FAQ = [
  { q: "Est-ce que je perds mes commandes ou mes clients ?", a: "Non. La refonte touche le thème, les textes et les pages. Tes commandes, clients, avis et réglages de paiement ne bougent pas." },
  { q: "Est-ce que c'est publié tout de suite ?", a: "Non. La nouvelle version est créée comme thème non publié. Tu la prévisualises, tu ajustes, puis tu la publies quand tu veux." },
  { q: "Et si je préfère mon ancienne version ?", a: "Ton thème actuel n'est pas modifié. Tu peux revenir dessus en un clic dans Shopify." },
];

export default function RecraftPage() {
  return (
    <>
      <PageHero eyebrow="Relancer ma boutique" title={<>Des visiteurs, mais pas de ventes ? <span className="serif-accent">On trouve pourquoi.</span></>} subtitle="Connecte ta boutique Shopify : l'IA analyse tes pages, repère ce qui freine la vente et propose une version réécrite, sans toucher à tes commandes.">
        <div className="flex flex-wrap justify-center gap-3">
          <ButtonLink href="/inscription?mode=recraft" size="lg">Analyser ma boutique</ButtonLink>
          <ButtonLink href="/demo" variant="secondary" size="lg">Voir la démo</ButtonLink>
        </div>
      </PageHero>

      <Container className="max-w-[1000px]"><Reveal><RecraftMock /></Reveal></Container>

      <section className="py-24">
        <Container>
          <SectionHeading title="Ce que l'IA vérifie" subtitle="Les six problèmes qu'on retrouve sur la plupart des boutiques qui ne convertissent pas." />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CHECKS.map((c, i) => (
              <Reveal key={c.title} delay={(i % 3) * 60} className="surface rounded-card p-6">
                <p className="text-lg tracking-tight">{c.title}</p>
                <p className="mt-2 text-[15px] leading-relaxed text-fg-muted">{c.text}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-12">
        <Container>
          <SectionHeading title="En quatre étapes" />
          <div className="mt-12">
            <NumberedList items={[
              { title: "Connexion", text: "Tu relies ta boutique Shopify en deux clics." },
              { title: "Analyse", text: "L'IA lit ton thème, tes produits et tes pages." },
              { title: "Nouvelle version", text: "Textes, structure et offres réécrits dans un thème non publié." },
              { title: "Publication", text: "Tu compares, tu ajustes, tu publies." },
            ]} />
          </div>
        </Container>
      </section>

      <FaqSection title="Questions fréquentes" items={FAQ} />
      <FinalCta title="Donne une deuxième vie à ta boutique" />
    </>
  );
}
