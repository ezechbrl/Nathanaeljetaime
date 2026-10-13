import { ShoppingBag } from "lucide-react";

// Bandeau défilant : tout ce que l'IA livre pour une boutique.
const ITEMS = [
  "Étude de marché", "Persona", "Promesse", "Nom et ton de marque", "Palette et polices", "Page d'accueil",
  "Fiche produit", "Offres et lots", "FAQ anti-objections", "SEO", "Visuels produit", "Pages livraison et retours", "Menus",
];

export function Stats() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <section className="border-y border-white/[0.06] bg-bg-2/60 py-5">
      <div className="mx-auto flex max-w-[1200px] items-center gap-6 px-4 sm:px-6">
        <p className="hidden shrink-0 items-center gap-2 text-sm text-fg-muted md:flex">
          <ShoppingBag className="h-4 w-4 text-[#95bf47]" aria-hidden /> Livré dans ta boutique
        </p>
        <div className="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
          <ul className="flex w-max animate-marquee gap-3">
            {row.map((t, i) => (
              <li key={i} aria-hidden={i >= ITEMS.length} className="shrink-0 rounded-full border border-white/[0.08] px-3.5 py-1.5 text-sm text-fg-muted">{t}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
