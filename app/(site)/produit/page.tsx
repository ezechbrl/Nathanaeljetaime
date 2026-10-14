import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { ChatMock, PilotMock, RecraftMock, StrategyMock, StudioMock } from "@/components/site/FeatureMocks";
import { FeatureRow } from "@/components/site/FeatureRow";
import { FinalCta } from "@/components/site/FinalCta";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { Globe2, Languages, Layers, Lock, Search, Smartphone } from "lucide-react";

export const metadata: Metadata = { title: "Produit", description: "Stratégie, boutique, éditeur par chat, studio d'images et optimisation quotidienne : tout ce que fait l'IA pour ta boutique Shopify." };

const SMALL = [
  { icon: Languages, title: "Écrit dans ta langue", text: "Pas une traduction : les textes sont écrits directement pour ton marché." },
  { icon: Search, title: "SEO de base inclus", text: "Titres, méta-descriptions et URLs propres sur chaque page." },
  { icon: Smartphone, title: "Pensé mobile d'abord", text: "Le bouton d'achat et le prix restent visibles sans défiler." },
  { icon: Layers, title: "Historique des versions", text: "Chaque modification est réversible en un clic." },
  { icon: Lock, title: "Ta boutique t'appartient", text: "Tout reste sur ton compte Shopify, même si tu arrêtes." },
  { icon: Globe2, title: "Thème Shopify standard", text: "Compatible avec les apps Shopify que tu utilises déjà." },
];

export default function ProductPage() {
  return (
    <>
      <PageHero
        eyebrow="Fonctionnalités"
        title={<>Tout ce qu'une agence ferait. <span className="serif-accent">En une conversation.</span></>}
        subtitle="Stratégie, textes, visuels, mise en ligne, puis un suivi chaque matin : voici ce que Vitrio fait pour ta boutique Shopify."
      >
        <div className="flex flex-wrap justify-center gap-3">
          <ButtonLink href="/inscription" size="lg">Créer ma boutique</ButtonLink>
          <ButtonLink href="/demo" variant="secondary" size="lg">Voir la démo</ButtonLink>
        </div>
      </PageHero>

      <Container className="divide-y divide-white/[0.06]">
        <FeatureRow
          eyebrow="1 · Stratégie"
          title={<>D'abord le client. <span className="serif-accent">Ensuite</span> le design.</>}
          text="Avant d'écrire une ligne, l'IA définit ton marché, ton client, ta promesse, tes offres et les objections qui freinent l'achat. Chaque texte de la boutique en découle."
          points={["Persona et marché cible", "Promesse en une phrase", "Offres : seuil de livraison, lots, garanties", "Objections et réponses intégrées aux pages"]}
          visual={<StrategyMock />}
        />
        <FeatureRow
          reverse
          eyebrow="2 · Boutique complète"
          title="Une boutique entière, pas un modèle à remplir"
          text="Identité de marque, page d'accueil, fiches produits, FAQ, pages À propos, Livraison et Contact, menus : tout est créé et publié dans ta boutique Shopify."
          points={["Nom, ton, couleurs et typographies", "Fiches produits avec prix conseillé", "Pages et menus configurés", "Publication en brouillon, tu valides"]}
          visual={<RecraftMock />}
        />
        <FeatureRow
          eyebrow="3 · Éditeur IA"
          title="Modifie tout en une phrase"
          text="« Plus premium », « ajoute un lot de 3 », « raccourcis le titre » : l'IA applique, te montre ce qui a changé, et garde chaque version."
          points={["Changements visibles avant / après", "Annulation en un clic", "Éditeur visuel pour les retouches fines"]}
          visual={<ChatMock />}
        />
        <FeatureRow
          reverse
          eyebrow="4 · Studio"
          title="Des visuels dans le style de ta marque"
          text="À partir de tes photos produit, génère des mises en scène, des bannières et des visuels pour les réseaux, aux bons formats."
          points={["Photos d'ambiance et packshots", "Formats 1:1, 4:5 et 16:9", "Envoi direct dans Shopify"]}
          visual={<StudioMock />}
        />
        <FeatureRow
          eyebrow="5 · Pilotage"
          title="Un expert e-commerce qui regarde tes chiffres chaque matin"
          text="L'IA lit tes statistiques Shopify, repère ce qui freine la vente et te propose des corrections concrètes, que tu appliques en un clic."
          points={["Avis du jour en langage clair", "3 à 5 recommandations priorisées", "Mesure de l'effet de chaque changement"]}
          visual={<PilotMock />}
        />
      </Container>

      <section className="py-24">
        <Container>
          <Reveal as="h2" className="text-center text-h2">Et tout le reste</Reveal>
          <div className="mt-14 grid gap-px overflow-hidden rounded-card border border-white/[0.07] bg-white/[0.07] sm:grid-cols-2 lg:grid-cols-3">
            {SMALL.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 60} className="bg-bg p-7">
                <f.icon className="h-5 w-5 text-accent" />
                <h3 className="mt-4 text-lg tracking-tight">{f.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-fg-muted">{f.text}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <FinalCta />
    </>
  );
}
