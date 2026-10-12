import Link from "next/link";
import { site } from "@/lib/site";

const COLUMNS = [
  {
    title: "Produit",
    links: [
      { href: "/produit", label: "Fonctionnalités" },
      { href: "/demo", label: "Démo" },
      { href: "/tarifs", label: "Tarifs" },
      { href: "/inscription", label: "Lancer sa boutique" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { href: "/#faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Légal",
    links: [
      { href: "/legal/mentions-legales", label: "Mentions légales" },
      { href: "/legal/confidentialite", label: "Confidentialité" },
      { href: "/legal/cgv", label: "CGV" },
      { href: "/legal/cgu", label: "CGU" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-black/5 py-14 text-sm text-black/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <p className="font-semibold text-black">{site.name}</p>
          <p className="mt-2 max-w-xs">{site.tagline}</p>
        </div>
        {COLUMNS.map((c) => (
          <div key={c.title}>
            <p className="font-semibold text-black">{c.title}</p>
            <ul className="mt-3 space-y-2">
              {c.links.map((l) => (
                <li key={l.href}><Link href={l.href} className="hover:text-black">{l.label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-10 max-w-6xl px-4">© {new Date().getFullYear()} {site.name}. Tous droits réservés.</p>
    </footer>
  );
}
