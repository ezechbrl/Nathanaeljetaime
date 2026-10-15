import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Bricolage_Grotesque, Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const sans = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-sans", display: "swap" });
// Titres : grotesque à caractère. Mots mis en avant : Fraunces en italique.
const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-display", display: "swap" });
// Mots soulignés dans les titres : Bodoni moderne en italique.
const accent = Bodoni_Moda({ subsets: ["latin"], weight: ["500"], style: ["italic"], variable: "--font-accent", display: "swap" });
const serif = Fraunces({ subsets: ["latin"], style: ["italic", "normal"], axes: ["SOFT", "WONK", "opsz"], variable: "--font-serif", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: { default: `${site.name} — Créateur de boutique Shopify IA`, template: `%s · ${site.name}` },
  description: site.description,
  openGraph: { title: site.name, description: site.description, type: "website", locale: "fr_FR" },
};

export const viewport: Viewport = { themeColor: "#0f312c" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${sans.variable} ${display.variable} ${serif.variable} ${accent.variable}`}>
      <head>
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important;filter:none!important}`}</style>
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
