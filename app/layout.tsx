import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { PageBackdrop } from "@/components/ui/PageBackdrop";
import { site } from "@/lib/site";
import "./globals.css";
import { Tracker } from "@/components/Tracker";

// Polices hébergées dans le projet (app/fonts, sous-ensemble latin de Google Fonts) : la construction du site
// ne dépend plus du téléchargement chez Google, qui échouait parfois et bloquait la mise en ligne.
const sans = localFont({ src: "./fonts/plus-jakarta-sans-normal.woff2", weight: "300 600", style: "normal", variable: "--font-sans", display: "swap" });
// Titres : grotesque à caractère. Mots mis en avant : Fraunces en italique.
const display = localFont({ src: "./fonts/bricolage-grotesque-normal.woff2", weight: "400 600", style: "normal", variable: "--font-display", display: "swap" });
// Mots soulignés dans les titres : Bodoni moderne en italique.
const accent = localFont({ src: "./fonts/bodoni-moda-italic.woff2", weight: "500", style: "italic", variable: "--font-accent", display: "swap" });
const serif = localFont({
  src: [
    { path: "./fonts/fraunces-normal.woff2", weight: "100 900", style: "normal" },
    { path: "./fonts/fraunces-italic.woff2", weight: "100 900", style: "italic" },
  ],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: { default: `${site.name} — Créateur de boutique Shopify IA`, template: `%s · ${site.name}` },
  description: site.description,
  // Code de validation Google Search Console (balise HTML), à mettre dans Vercel.
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
  openGraph: { title: site.name, description: site.description, type: "website", locale: "fr_FR" },
  appleWebApp: { capable: true, title: site.name, statusBarStyle: "black" },
};

export const viewport: Viewport = { themeColor: "#05261d" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${sans.variable} ${display.variable} ${serif.variable} ${accent.variable}`}>
      <head>
        {/* Vérification du site pour le programme d'affiliation Shopify (impact.com). */}
        {/* @ts-expect-error -- impact.com lit l'attribut « value » */}
        <meta name="impact-site-verification" value="c74c98d0-75c9-4b7f-ba43-fd910cf5cbb8" content="c74c98d0-75c9-4b7f-ba43-fd910cf5cbb8" />
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important;filter:none!important}`}</style>
        </noscript>
      </head>
      <body><PageBackdrop />{children}<Tracker /></body>
    </html>
  );
}
