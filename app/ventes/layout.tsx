import type { Metadata, Viewport } from "next";

// App « Vigenia Ventes » à ajouter sur l'écran d'accueil : nom, icône noire et manifest propres.
export const metadata: Metadata = {
  title: "Ventes",
  manifest: "/ventes.webmanifest",
  appleWebApp: { capable: true, title: "Ventes", statusBarStyle: "black" },
  icons: { apple: "/brand/ventes-180.png" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#05261d" };

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh">{children}</div>;
}
