import Link from "next/link";
import { MarketingShell, PageHero } from "@/components/MarketingShell";
import { site } from "@/lib/site";

export const metadata = { title: `Démo — ${site.name}` };

const TIMELINE = [
  { t: "0:00", label: "Le brief", text: "« Marque de baumes à lèvres naturels, cible 25-40 ans, positionnement premium. »" },
  { t: "0:40", label: "La stratégie", text: "Marché, promesse, 3 offres et 5 objections d'achat avec leurs réponses." },
  { t: "2:10", label: "La boutique", text: "Marque, page d'accueil, fiche produit, FAQ et page « À propos »." },
  { t: "4:30", label: "La publication", text: "Le produit et les pages arrivent dans Shopify, prêts à relire." },
];

export default function DemoPage() {
  return (
    <MarketingShell>
      <PageHero eyebrow="Démo" title="Une boutique en 5 minutes, en vrai" subtitle="Regarde comment un simple brief devient une boutique Shopify prête à vendre." />
      <div className="mx-auto max-w-5xl px-4 pb-24">
        <div className="grid aspect-video place-items-center rounded-3xl bg-ink text-white">
          <div className="text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/10 text-2xl">▶</span>
            <p className="mt-4 text-sm text-white/60">Vidéo de démonstration à venir</p>
          </div>
        </div>
        <ol className="mt-12 grid gap-4 md:grid-cols-4">
          {TIMELINE.map((s) => (
            <li key={s.t} className="rounded-2xl border border-black/5 p-5">
              <p className="font-mono text-xs text-brand">{s.t}</p>
              <p className="mt-1 font-semibold">{s.label}</p>
              <p className="mt-2 text-sm text-black/60">{s.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 text-center">
          <Link href="/generer" className="inline-block rounded-full bg-brand px-8 py-4 font-semibold text-white hover:bg-brand/90">
            Essayer maintenant
          </Link>
        </div>
      </div>
    </MarketingShell>
  );
}
