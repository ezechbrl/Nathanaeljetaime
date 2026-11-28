import Link from "next/link";

// Maillage interne : chaque page de contenu renvoie vers les pages « piliers » qu'on veut faire monter sur Google.
const GUIDES = [
  ["/boutique-shopify-cle-en-main", "Boutique Shopify clé en main", "Ce qu'elle contient, son prix, agence ou IA"],
  ["/blog/combien-coute-shopify", "Prix Shopify : combien ça coûte ?", "Abonnement, frais, applications, domaine"],
  ["/blog/creer-boutique-en-ligne-debutant", "Créer sa boutique en ligne", "La méthode pas à pas pour débuter"],
  ["/blog/dropshipping-c-est-quoi", "Le dropshipping, c'est quoi ?", "Le fonctionnement, les avantages, les pièges"],
  ["/idees-produits", "Idées de produits à vendre", "12 univers, avec à qui vendre et à quel prix"],
  ["/tarifs", "Tarifs Vigenia", "Aperçu gratuit, boutique dès 39 €"],
] as const;

export function KeyGuides({ exclude }: { exclude?: string }) {
  const list = GUIDES.filter(([href]) => href !== exclude);
  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold">Les guides essentiels</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {list.map(([href, title, text]) => (
          <Link key={href} href={href} className="rounded-[16px] border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-white/25">
            <p className="font-semibold text-fg">{title}</p>
            <p className="mt-1 text-sm text-fg-muted">{text}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
