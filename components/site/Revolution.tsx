"use client";

import { Check, ChevronRight, Eye, GripVertical, Plus, Sparkles } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Section";
import { useScrollProgress } from "@/components/ui/useScrollProgress";

function ShopifyEditorMock() {
  const rows = ["En-tête", "Image avec texte", "Collection en vedette", "Diaporama", "Texte enrichi", "Multicolonne", "Newsletter", "Pied de page"];
  return (
    <div className="overflow-hidden rounded-card border border-black/10 bg-[#f1f2f4] text-[#303030] shadow-2xl">
      <div className="flex items-center justify-between border-b border-black/10 bg-white px-3 py-2 text-[11px]">
        <span className="font-medium">Dawn · Page d'accueil</span>
        <span className="flex gap-2 text-black/40"><Eye className="h-3.5 w-3.5" /> ⋯</span>
      </div>
      <div className="grid grid-cols-[150px_1fr] sm:grid-cols-[180px_1fr]">
        <div className="border-r border-black/10 bg-white p-2 text-[10px]">
          <p className="mb-1.5 font-medium text-black/50">Sections</p>
          {rows.map((r) => (
            <div key={r} className="flex items-center gap-1 rounded px-1 py-1 text-black/70"><GripVertical className="h-3 w-3 text-black/25" />{r}<ChevronRight className="ml-auto h-3 w-3 text-black/25" /></div>
          ))}
          <div className="mt-1 flex items-center gap-1 px-1 py-1 text-[#2c6ecb]"><Plus className="h-3 w-3" /> Ajouter une section</div>
        </div>
        <div className="grid place-items-center p-4">
          <div className="grid aspect-[4/3] w-full place-items-center rounded border-2 border-dashed border-black/10 text-[11px] text-black/30">
            Diaporama · Ajoute une image
          </div>
        </div>
      </div>
    </div>
  );
}

function OurEditorMock() {
  return (
    <div className="surface relative overflow-hidden rounded-card p-5 sm:p-8">
      <div aria-hidden className="absolute inset-0 [background:radial-gradient(ellipse_70%_60%_at_50%_0%,rgb(22_170_156/0.22),transparent)]" />
      <p className="relative text-center text-xl tracking-tight sm:text-2xl">Une boutique à partir d'une <span className="serif-accent">phrase</span></p>
      <div className="relative mt-5 rounded-[10px] border border-accent/25 bg-bg-2 p-3">
        <p className="text-sm text-fg">Matcha bio d'Uji, kit de préparation inclus, ton calme et premium.</p>
        <div className="mt-3 flex justify-end"><span className="inline-flex items-center gap-1.5 rounded-[7px] border border-accent/40 bg-accent-strong/70 px-2.5 py-1 text-[11px] text-white"><Sparkles className="h-3 w-3" /> Générer</span></div>
      </div>
      <ul className="relative mt-4 space-y-1.5 text-xs text-fg-muted">
        {["Marché et promesse définis", "Identité de marque", "Page d'accueil et fiche produit", "FAQ, livraison, à propos"].map((t) => (
          <li key={t} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-accent" />{t}</li>
        ))}
      </ul>
    </div>
  );
}

export function Revolution() {
  const ref = useScrollProgress<HTMLHeadingElement>(0.5);
  return (
    <section className="overflow-hidden py-24">
      <Container>
        <h2
          ref={ref}
          className="select-none text-center text-[clamp(4rem,14vw,11rem)] leading-[0.95] tracking-[-0.06em]"
          style={{
            backgroundImage: "linear-gradient(90deg, rgb(var(--fg)) 0%, rgb(var(--fg)) calc(var(--p, 0) * 100%), rgb(var(--fg) / 0.14) calc(var(--p, 0) * 100% + 12%))",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Une révolution
        </h2>
        <div className="mt-16 grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <div className="opacity-80 grayscale-[0.4] transition duration-500 hover:opacity-100 hover:grayscale-0"><ShopifyEditorMock /></div>
            <p className="surface mt-4 rounded-card px-4 py-3 text-[15px] text-fg-muted">
              <span className="text-fg">Avant :</span> des heures dans les réglages de Shopify, section par section, sans savoir quoi écrire.
            </p>
          </Reveal>
          <Reveal delay={150}>
            <OurEditorMock />
            <p className="surface mt-4 rounded-card px-4 py-3 text-[15px] text-fg-muted">
              <span className="text-fg">Maintenant :</span> tu décris ton produit, l'IA crée une boutique complète à l'image de ta marque, dans la langue de ton marché.
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
