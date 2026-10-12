import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Crée ton compte", robots: { index: false } };

export default function Page() {
  return (
    <AuthShell title="Crée ton compte" subtitle="Ta première boutique est offerte, sans carte bancaire.">
      <Suspense><RegisterForm /></Suspense>
    </AuthShell>
  );
}
