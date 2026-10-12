import type { Metadata } from "next";
import { Suspense } from "react";
import { ConnectShopifyPanel } from "@/components/auth/AuthForms";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata: Metadata = { title: "Connecter Shopify", robots: { index: false } };

export default function Page() {
  return (
    <AuthShell title="Relie ta boutique Shopify" subtitle="Dernière étape : l'IA construit et publie directement dans ta boutique. Tu gardes la main sur tout.">
      <Suspense><ConnectShopifyPanel /></Suspense>
    </AuthShell>
  );
}
