import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { site } from "@/lib/site";
import { NewsletterForm } from "./NewsletterForm";

const COLUMNS = [
  { title: "Produit", links: [["/produit", "Fonctionnalités"], ["/demo", "Comment ça marche"], ["/tarifs", "Tarifs"], ["/exemples", "Exemples"], ["/nouveautes", "Feuille de route"]] },
  { title: "Solutions", desktop: true, links: [["/boutique-shopify-cle-en-main", "Boutique prête à vendre"], ["/refonte-boutique-shopify", "Relancer ma boutique"], ["/affiliation", "Devenir partenaire"]] },
  { title: "Entreprise", desktop: true, links: [["/fondateurs", "Notre histoire"], ["/blog", "Blog"], ["/contact", "Contact"]] },
  { title: "Légal", links: [["/legal/mentions-legales", "Mentions légales"], ["/legal/confidentialite", "Confidentialité"], ["/legal/cgv", "CGV"], ["/legal/cgu", "CGU"], ["/legal/conditions-affiliation", "Conditions d'affiliation"]] },
] as const;

export function Footer() {
  return (
    <footer className="relative mt-12 border-t border-white/[0.06] sm:mt-24">
      <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 sm:py-16">
        <div className="grid gap-8 sm:gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <Logo />
            <p className="mt-4 hidden max-w-sm text-sm leading-relaxed text-fg-muted sm:block">{site.description}</p>
            <div className="mt-6 hidden max-w-sm sm:block">
              <p className="mb-2 text-sm text-fg">Un conseil e-commerce par semaine</p>
              <NewsletterForm />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((c) => (
              <div key={c.title} className={"desktop" in c ? "hidden sm:block" : undefined}>
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

        <p className="mt-8 text-sm sm:hidden"><Link href="/contact" className="text-fg-muted">Contact</Link> · <Link href="/blog" className="text-fg-muted">Blog</Link> · <Link href="/affiliation" className="text-fg-muted">Devenir partenaire</Link></p>
        <div className="mt-8 flex flex-col sm:mt-16 gap-3 border-t border-white/[0.06] pt-8 text-xs text-fg-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. Shopify est une marque de Shopify Inc. {site.name} n'est pas affilié à Shopify.</p>
          <p>Fait en France</p>
        </div>
      </div>
    </footer>
  );
}
