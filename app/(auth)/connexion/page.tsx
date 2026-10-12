import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Bon retour", robots: { index: false } };

export default function Page() {
  return (
    <AuthShell title="Bon retour" subtitle="Connecte-toi pour retrouver tes boutiques.">
      <Suspense><LoginForm /></Suspense>
    </AuthShell>
  );
}
