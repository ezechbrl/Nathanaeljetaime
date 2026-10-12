import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { Container } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { FinalCta } from "@/components/site/FinalCta";
import { PageHero } from "@/components/site/PageHero";
import { FOUNDERS } from "@/lib/content/team";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Notre histoire", description: `Pourquoi on construit ${site.name}, et comment on travaille.` };

const PRINCIPLES = [
  { title: "La vente avant le design", text: "Une belle boutique qui ne vend pas est un échec. On part toujours du client, de la promesse et de l'offre." },
  { title: "Pas de faux", text: "L'IA n'invente ni avis, ni chiffres, ni labels. Elle te dit quoi collecter pour prouver ce que tu avances." },
  { title: "Tout t'appartient", text: "Ta boutique, tes textes, tes clients restent chez toi, sur Shopify. Tu peux partir quand tu veux." },
  { title: "Expliquer, pas seulement faire", text: "Chaque recommandation est justifiée. Tu apprends le e-commerce en même temps que ta boutique grandit." },
];

export default function StoryPage() {
  return (
    <>
      <PageHero eyebrow="Notre histoire" title={<>On construit l'outil qu'on aurait <span className="serif-accent">voulu</span> avoir</>} />
      <Container className="max-w-[760px]">
        <div className="space-y-6 text-[18px] leading-[1.75] text-fg-muted">
          <Reveal as="p">Lancer une boutique Shopify, c'est des semaines de réglages, de textes à écrire et de choix de design, avant même la première vente. La plupart des gens abandonnent ou publient une boutique qui ne convertit pas.</Reveal>
          <Reveal as="p" delay={60}>Pourtant, les boutiques qui vendent suivent toutes les mêmes règles : une promesse claire, une offre qui donne envie d'acheter maintenant, des réponses aux objections, une fiche produit lisible sur mobile. Ces règles s'appliquent, elles ne s'inventent pas à chaque fois.</Reveal>
          <Reveal as="p" delay={120}><span className="text-fg">{site.name} applique ces règles pour toi.</span> L'IA pose ta stratégie comme le ferait un expert, construit la boutique entière, puis continue de l'améliorer chaque jour à partir de tes vrais chiffres.</Reveal>
        </div>
      </Container>

      <section className="py-24">
        <Container>
          <Reveal as="h2" className="text-center text-h2">Ce qui guide nos choix</Reveal>
          <div className="mt-12 grid gap-px overflow-hidden rounded-card border border-black/[0.07] bg-black/[0.07] sm:grid-cols-2">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.title} delay={(i % 2) * 70} className="bg-bg p-8">
                <p className="font-serif text-3xl italic text-accent">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-4 text-xl tracking-tight">{p.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-fg-muted">{p.text}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {FOUNDERS.length > 0 && (
        <section className="pb-12">
          <Container>
            <Reveal as="h2" className="text-center text-h2">L'équipe</Reveal>
            <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
              {FOUNDERS.map((f) => (
                <Reveal key={f.name} className="surface rounded-card p-6">
                  {f.photo && <img src={f.photo} alt="" className="h-16 w-16 rounded-full object-cover" />}
                  <p className="mt-4 text-xl tracking-tight">{f.name}</p>
                  <p className="text-sm text-accent">{f.role}</p>
                  <p className="mt-3 text-[15px] leading-relaxed text-fg-muted">{f.bio}</p>
                  {f.linkedin && <a href={f.linkedin} className="mt-4 inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg"><ExternalLink className="h-4 w-4" /> LinkedIn</a>}
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}
      <FinalCta />
    </>
  );
}
