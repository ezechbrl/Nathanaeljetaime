import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Section";

// Remplace les témoignages tant qu'il n'y a pas d'avis clients réels.
// Quand tu en as, ajoute-les dans lib/content/testimonials.ts et affiche <Testimonials /> à la place.
const AUDIENCES = [
  {
    who: "Tu te lances",
    quote: "Tu as un produit, pas encore de boutique, et pas envie de passer trois semaines dans les réglages de Shopify.",
    gets: "Une boutique complète et cohérente, prête à recevoir ses premières visites le jour même.",
  },
  {
    who: "Ta boutique ne convertit pas",
    quote: "Tu as du trafic, mais les visiteurs repartent sans acheter et tu ne sais pas pourquoi.",
    gets: "Une refonte des textes et de la fiche produit, puis des recommandations chaque jour pour corriger ce qui freine.",
  },
  {
    who: "Tu gères des boutiques pour d'autres",
    quote: "Tu crées des boutiques pour tes clients et chaque projet te prend des jours de rédaction.",
    gets: "Une première version complète en quelques minutes, que tu affines ensuite avec ton expertise.",
  },
];

export function Audience() {
  return (
    <section className="py-24">
      <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.4fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal><span className="eyebrow">Pour qui</span></Reveal>
          <Reveal delay={80} as="h2" className="mt-5 text-h1">Des marques ambitieuses, <span className="serif-accent">quel que soit</span> le point de départ.</Reveal>
        </div>
        <div className="divide-y divide-black/[0.07] border-y border-black/[0.07]">
          {AUDIENCES.map((a, i) => (
            <Reveal key={a.who} delay={i * 80} className="grid gap-4 py-9 sm:grid-cols-[150px_1fr]">
              <p className="text-sm text-accent">{a.who}</p>
              <div>
                <p className="text-xl leading-snug tracking-tight sm:text-[22px]">« {a.quote} »</p>
                <p className="mt-4 text-[15px] leading-relaxed text-fg-muted"><span className="text-fg">Ce que tu obtiens :</span> {a.gets}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
