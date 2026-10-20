import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPanel } from "@/components/auth/AuthForms";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata: Metadata = { title: "Connexion", robots: { index: false } };

export default function Page() {
  return (
    <AuthShell title="Connexion" subtitle="Connecte-toi avec ton compte Shopify.">
      <Suspense><AuthPanel mode="login" /></Suspense>
    </AuthShell>
  );
}
