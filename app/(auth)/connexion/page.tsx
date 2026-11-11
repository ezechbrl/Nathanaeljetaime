import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPanel } from "@/components/auth/AuthForms";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata: Metadata = { title: "Connexion", robots: { index: false } };

export default function Page() {
  return (
    <AuthShell title="Connexion" subtitle="Choisis ton cas : tu as déjà Shopify, ou tu crées ton compte Shopify. Ensuite, tu reçois un code par e-mail, sans mot de passe.">
      <Suspense><AuthPanel mode="login" /></Suspense>
    </AuthShell>
  );
}
