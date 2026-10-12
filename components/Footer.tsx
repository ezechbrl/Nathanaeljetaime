import Link from "next/link";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-black/5 py-12 text-sm text-black/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 md:flex-row md:justify-between">
        <div>
          <p className="font-semibold text-black">{site.name}</p>
          <p className="mt-1 max-w-xs">{site.tagline}</p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/generer">Lancer sa boutique</Link>
          <a href="/#faq">FAQ</a>
          <span>Mentions légales</span>
          <span>Confidentialité</span>
          <span>CGU / CGV</span>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-6xl px-4">© {new Date().getFullYear()} {site.name}</p>
    </footer>
  );
}
