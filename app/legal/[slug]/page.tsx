import { notFound } from "next/navigation";
import { MarketingShell, PageHero } from "@/components/MarketingShell";
import { site } from "@/lib/site";

const PAGES: Record<string, string> = {
  "mentions-legales": "Mentions légales",
  confidentialite: "Politique de confidentialité",
  cgv: "Conditions générales de vente",
  cgu: "Conditions générales d'utilisation",
};

export function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }));
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = PAGES[slug];
  if (!title) notFound();
  return (
    <MarketingShell>
      <PageHero eyebrow="Légal" title={title} />
      <div className="mx-auto max-w-3xl px-4 pb-24 text-sm leading-relaxed text-black/70">
        <p className="rounded-2xl bg-amber-50 p-4 text-amber-900">
          Contenu à rédiger avant le lancement (éditeur du site, hébergeur, traitement des données personnelles RGPD, conditions d'abonnement et de remboursement de {site.name}).
        </p>
      </div>
    </MarketingShell>
  );
}
