import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { site } from "@/lib/site";
import { NewsletterForm } from "./NewsletterForm";

const COLUMNS = [
  { title: "Produit", links: [["/produit", "Fonctionnalités"], ["/demo", "Comment ça marche"], ["/tarifs", "Tarifs"], ["/exemples", "Exemples"], ["/nouveautes", "Feuille de route"]] },
  { title: "Solutions", links: [["/boutique-shopify-cle-en-main", "Boutique prête à vendre"], ["/refonte-boutique-shopify", "Relancer ma boutique"], ["/outils", "Outils gratuits"], ["/affiliation", "Devenir partenaire"]] },
  { title: "Entreprise", links: [["/fondateurs", "Notre histoire"], ["/blog", "Blog"], ["/contact", "Contact"]] },
  { title: "Légal", links: [["/legal/mentions-legales", "Mentions légales"], ["/legal/confidentialite", "Confidentialité"], ["/legal/cgv", "CGV"], ["/legal/cgu", "CGU"], ["/legal/conditions-affiliation", "Conditions d'affiliation"]] },
] as const;

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/[0.06]">
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-fg-muted">{site.description}</p>
            <div className="mt-6 max-w-sm">
              <p className="mb-2 text-sm text-fg">Un conseil e-commerce par semaine</p>
              <NewsletterForm />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((c) => (
              <div key={c.title}>
                <p className="text-sm text-fg">{c.title}</p>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {c.links.map(([href, label]) => (
                    <li key={href}><Link href={href} className="text-fg-muted transition-colors hover:text-fg">{label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-white/[0.06] pt-8 text-xs text-fg-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. Shopify est une marque de Shopify Inc. {site.name} n'est pas affilié à Shopify.</p>
          <p>Fait en France</p>
        </div>
      </div>
    </footer>
  );
}
