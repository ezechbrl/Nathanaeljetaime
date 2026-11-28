import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Container, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { FaqSection } from "@/components/site/Faq";
import { FinalCta } from "@/components/site/FinalCta";
import { NumberedList } from "@/components/site/NumberedList";
import { PageHero } from "@/components/site/PageHero";
import { PromptBox } from "@/components/site/PromptBox";
import { KeyGuides } from "@/components/site/KeyGuides";

export const metadata: Metadata = {
  title: { absolute: "Boutique Shopify clé en main : prix, contenu, agence ou IA · Vigenia" },
  alternates: { canonical: "/boutique-shopify-cle-en-main" },
  description: "Boutique Shopify clé en main : ce qu'elle doit contenir, combien elle coûte (agence, freelance ou IA), les pièges à éviter. Aperçu gratuit de ta boutique créée par l'IA en 3 minutes.",
};

const INCLUDED = [
  "Étude de marché et persona", "Promesse et positionnement", "Nom, slogan, ton de marque", "Palette et typographies",
  "Page d'accueil complète", "Fiches produits rédigées", "Prix conseillé et prix barré", "SEO de chaque page",
  "FAQ produit et générale", "Pages À propos, Livraison, Contact", "Menus principal et pied de page", "Visuels produit et bannières",
];

const FAQ = [
  { q: "Quelle différence avec une agence ?", a: "Une agence ou un freelance fait un travail sur mesure, avec un devis et un délai qui dépendent du projet : demande toujours plusieurs devis pour comparer. Ici, l'aperçu est prêt en quelques minutes et gratuit, et tu peux le modifier avant de payer." },
  { q: "Combien coûte une boutique Shopify clé en main ?", a: "Il y a deux coûts séparés : la création de la boutique (chez Vigenia : aperçu gratuit, puis 39 € une fois ou un abonnement dès 29 € par mois) et l'abonnement Shopify, payé directement à Shopify, dont les tarifs à jour sont sur son site officiel." },
  { q: "La boutique est-elle vraiment à moi ?", a: "Oui. Elle est installée sur ton propre compte Shopify : tu en gardes le contrôle, les clients et les ventes." },
  { q: "Une boutique clé en main garantit-elle des ventes ?", a: "Non, aucune boutique ne garantit des ventes. Elle te fait gagner le temps de la construction : c'est ensuite à toi de vérifier ton produit et de faire connaître ta boutique." },
  { q: "Dois-je déjà avoir une boutique Shopify ?", a: "Non. Tu peux en ouvrir une pendant la création (Shopify propose une période d'essai), puis la connecter en deux clics." },
  { q: "Est-ce que je peux vendre tout de suite ?", a: "Une fois la boutique publiée et le paiement configuré dans Shopify, oui. On te guide pour les réglages restants (paiement, livraison, domaine)." },
  { q: "Les textes sont-ils uniques ?", a: "Oui. Ils sont écrits pour ta marque à partir de ta stratégie, pas copiés d'un modèle." },
];

const COMPARE = [
  { t: "Une agence", d: "Une équipe crée ta boutique sur mesure, avec un accompagnement. C'est l'option la plus personnalisée, et en général la plus chère et la plus longue.", w: "le devis détaillé, le délai, ce qui est inclus (textes, photos, réglages) et qui garde l'accès à la boutique." },
  { t: "Un freelance", d: "Une personne seule crée ta boutique, souvent plus vite et moins cher qu'une agence, avec un résultat qui dépend beaucoup de son expérience.", w: "ses boutiques déjà réalisées, ses avis vérifiables et un devis écrit." },
  { t: "Une boutique toute faite", d: "Une boutique déjà construite autour d'un produit, vendue telle quelle. Rapide, mais souvent identique à beaucoup d'autres.", w: "que les textes sont uniques, que les produits ne sont pas des contrefaçons et qu'aucun chiffre de vente n'est promis." },
  { t: "Un outil d'IA comme Vigenia", d: "L'IA crée l'aperçu de ta boutique à partir de ton idée ou d'un lien produit, en quelques minutes. Tu le vois gratuitement avant de payer, et tu peux le retoucher.", w: "relis les textes, commande un échantillon et règle paiements et livraison dans Shopify avant de lancer." },
];

export default function TurnkeyPage() {
  return (
    <>
      <PageHero eyebrow="Boutique prête à vendre" title={<>Une boutique Shopify <span className="serif-accent">prête à vendre</span> en 3 minutes</>} subtitle="Stratégie, textes, visuels, pages et SEO : ce qui prend trois semaines à la main est prêt en quelques minutes, à importer dans ta boutique Shopify.">
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
          <Reveal className="mt-12 text-center"><ButtonLink href="/quiz" size="lg">Créer ma boutique clé en main</ButtonLink></Reveal>
        </Container>
      </section>


      <section className="py-20">
        <Container className="max-w-[860px]">
          <SectionHeading title="Agence, freelance, boutique toute faite ou IA : que choisir ?" subtitle="Quatre façons d'avoir une boutique Shopify clé en main, et ce qu'il faut regarder pour chacune." />
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {COMPARE.map((c) => (
              <div key={c.t} className="rounded-[18px] border border-white/10 bg-white/[0.03] p-5">
                <p className="text-lg font-semibold">{c.t}</p>
                <p className="mt-2 text-[15px] text-fg-muted">{c.d}</p>
                <p className="mt-3 text-sm"><span className="text-fg">À vérifier : </span><span className="text-fg-muted">{c.w}</span></p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container className="max-w-[760px] space-y-6 text-[17px] leading-[1.75] text-fg-muted">
          <h2 className="text-2xl tracking-tight text-fg">Combien coûte une boutique Shopify clé en main ?</h2>
          <p>Il faut séparer deux coûts. Le premier, c&apos;est la création de la boutique : il dépend de qui la fait (agence, freelance, boutique toute faite ou outil d&apos;IA). Le second, c&apos;est Shopify lui-même : l&apos;abonnement à la plateforme, les frais sur les paiements et les éventuelles applications payantes. Ces tarifs changent : vérifie-les toujours sur le site officiel de Shopify (on détaille tous les frais dans notre guide <Link href="/blog/combien-coute-shopify" className="text-accent hover:underline">Prix Shopify : combien ça coûte ?</Link>).</p>
          <p>Avec Vigenia, l&apos;aperçu de ta boutique est gratuit et sans carte bancaire. Pour la débloquer, tu paies 39 € une fois (« Ma boutique »), ou tu prends un abonnement si tu veux créer et retoucher plusieurs boutiques : Starter à 29 € par mois, Pro à 59 € par mois. Détails sur la page <Link href="/tarifs" className="text-accent hover:underline">Tarifs</Link>.</p>
          <h2 className="pt-6 text-2xl tracking-tight text-fg">Les pièges à éviter</h2>
          <ul className="space-y-2 border-l border-accent/30 pl-5">
            <li>Une boutique « déjà rentable » ou des promesses de gains, sans preuve vérifiable</li>
            <li>Des avis, des chiffres de vente ou des comptes à rebours inventés sur la boutique</li>
            <li>Des produits de marque ou sous licence : ce sont souvent des contrefaçons</li>
            <li>Une boutique copiée à des centaines d&apos;exemplaires, avec les mêmes textes</li>
            <li>Une boutique qui n&apos;est pas sur ton propre compte Shopify</li>
          </ul>
          <h2 className="pt-6 text-2xl tracking-tight text-fg">Clé en main ne veut pas dire « rien à faire »</h2>
          <p>Même avec une boutique complète, c&apos;est toi qui la fais vivre : commander un échantillon pour vérifier ton produit, relire les textes, régler les paiements et la livraison dans Shopify, puis faire connaître ta boutique, par exemple avec des vidéos courtes. La boutique clé en main te fait gagner le temps de la construction, pour que tu en passes plus à trouver tes clients. Pour démarrer, lis aussi <Link href="/blog/creer-boutique-en-ligne-debutant" className="text-accent hover:underline">créer sa boutique en ligne quand on débute</Link> et <Link href="/idees-produits" className="text-accent hover:underline">nos idées de produits</Link>.</p>
        </Container>
      </section>

      <FaqSection title="Questions fréquentes" items={FAQ} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }) }} />
      <Container className="max-w-[860px]"><KeyGuides exclude="/boutique-shopify-cle-en-main" /></Container>
      <FinalCta />
    </>
  );
}
