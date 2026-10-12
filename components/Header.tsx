import Link from "next/link";
import { site } from "@/lib/site";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/80 backdrop-blur">
      <a href="#main-content" className="sr-only focus:not-sr-only">Aller au contenu</a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold tracking-tight">{site.name}</Link>
        <nav className="hidden gap-8 text-sm text-black/70 md:flex">
          <a href="/#comment-ca-marche" className="hover:text-black">Produit</a>
          <a href="/#faq" className="hover:text-black">FAQ</a>
        </nav>
        <Link href="/generer" className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-black/80">
          Créer ma boutique
        </Link>
      </div>
    </header>
  );
}
