import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Mot de passe oublié", robots: { index: false } };

export default function Page() {
  return (
    <AuthShell title="Mot de passe oublié" subtitle="On t'envoie un lien pour en choisir un nouveau.">
      <Suspense><ForgotForm /></Suspense>
    </AuthShell>
  );
}
