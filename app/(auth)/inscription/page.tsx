import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPanel } from "@/components/auth/AuthForms";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata: Metadata = { title: "Crée ta boutique", robots: { index: false } };

export default function Page() {
  return (
    <AuthShell title="Crée ta boutique" subtitle="Ta première boutique est offerte. Connecte simplement ta boutique Shopify.">
      <Suspense><AuthPanel mode="register" /></Suspense>
    </AuthShell>
  );
}
