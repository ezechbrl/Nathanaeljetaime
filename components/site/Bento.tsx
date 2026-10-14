import { Check, Globe2, ShoppingBag } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Section";
import { PilotMock, StrategyMock, StudioMock } from "./FeatureMocks";

const LANGS = ["Français", "English", "Español", "Deutsch", "Italiano", "Nederlands", "Português", "Polski", "Svenska"];

function Tile({ title, text, children, className = "", delay = 0 }: { title: string; text: string; children?: React.ReactNode; className?: string; delay?: number }) {
  return (
    <Reveal delay={delay} className={`flex flex-col rounded-[18px] border border-white/[0.07] bg-bg-2/70 p-6 ${className}`}>
      <h3 className="text-h3">{title}</h3>
      <p className="mt-2 max-w-md text-[15px] leading-relaxed text-fg-muted">{text}</p>
      {children && <div className="mt-6 flex-1">{children}</div>}
    </Reveal>
  );
}

// Grille « tout ce que l'IA fait » : un bloc par métier remplacé.
export function Bento() {
  return (
    <section className="py-24">
      <Container>
        <Reveal as="h2" className="max-w-3xl text-h2">Un stratège, un rédacteur, un graphiste et un analyste. <span className="serif-accent">Dans un seul outil.</span></Reveal>
        <div className="mt-12 grid gap-4 lg:grid-cols-6">
          <Tile className="lg:col-span-4" title="Il réfléchit avant d'écrire" text="Cible, promesse, offres, objections : la stratégie est posée en premier, et chaque page en découle.">
            <StrategyMock />
          </Tile>
          <Tile className="lg:col-span-2" delay={80} title="Il installe tout dans Shopify" text="Pas de copier-coller : tout arrive directement dans ta boutique.">
            <ul className="surface space-y-2.5 rounded-card p-4 text-sm">
              <li className="flex items-center gap-2 text-fg-faint"><ShoppingBag className="h-4 w-4 text-[#95bf47]" /> ta-boutique.myshopify.com</li>
              {["Fiche produit et prix", "Page d'accueil", "FAQ, livraison, à propos", "Menus et réglages du thème"].map((t, i) => (
                <li key={t} className="anim flex items-center gap-2 text-fg-muted" style={{ animationName: "pop-in", animationDuration: ".4s", animationDelay: `${0.3 + i * 0.25}s` }}><Check className="h-4 w-4 text-accent" /> {t}</li>
              ))}
            </ul>
          </Tile>
          <Tile className="lg:col-span-2" delay={60} title="Il parle la langue de tes clients" text="Textes écrits directement dans la langue du marché, pas traduits.">
            <ul className="flex flex-wrap gap-2">
              {LANGS.map((l) => <li key={l} className="flex items-center gap-1.5 rounded-full border border-white/[0.08] px-3 py-1 text-sm text-fg-muted"><Globe2 className="h-3.5 w-3.5 text-accent" />{l}</li>)}
            </ul>
          </Tile>
          <Tile className="lg:col-span-2" delay={120} title="Il crée tes visuels" text="Photos d'ambiance et bannières aux couleurs de ta marque.">
            <StudioMock />
          </Tile>
          <Tile className="lg:col-span-2" delay={180} title="Il surveille tes ventes" text="Chaque matin, ce qui freine et la correction à appliquer.">
            <PilotMock />
          </Tile>
        </div>
      </Container>
    </section>
  );
}
