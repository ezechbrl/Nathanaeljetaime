import type { Metadata } from "next";
import { Container } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { FreeTools } from "@/components/site/FreeTools";
import { PageHero } from "@/components/site/PageHero";

export const metadata: Metadata = { title: "Outils gratuits", description: "Générateurs gratuits de noms de boutique, slogans, descriptions produit et FAQ, sans inscription." };

export default function ToolsPage() {
  return (
    <>
      <PageHero eyebrow="Outils gratuits" title={<>Des outils <span className="serif-accent">gratuits</span> pour ta boutique</>} subtitle="Noms, slogans, descriptions produit et FAQ. Sans inscription, en quelques secondes." />
      <Container className="max-w-[1050px]"><Reveal><FreeTools /></Reveal></Container>
    </>
  );
}
