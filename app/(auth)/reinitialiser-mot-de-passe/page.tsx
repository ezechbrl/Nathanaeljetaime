import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Nouveau mot de passe", robots: { index: false } };

export default function Page() {
  return (
    <AuthShell title="Nouveau mot de passe" subtitle="Choisis un mot de passe d'au moins 8 caractères.">
      <Suspense><ResetForm /></Suspense>
    </AuthShell>
  );
}
