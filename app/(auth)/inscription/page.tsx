import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthPanel } from "@/components/auth/AuthForms";
import { AuthShell } from "@/components/auth/AuthShell";
import { WaitlistForm } from "@/components/auth/WaitlistForm";
import { isWaitlist } from "@/lib/launch";

export const metadata: Metadata = { title: isWaitlist ? "Réserve ta place" : "Crée ta boutique", robots: { index: false } };

export default function Page() {
  if (isWaitlist) {
    return (
      <AuthShell title="Réserve ta place" subtitle="Vitrio ouvre très bientôt. Laisse ton e-mail : tu seras prévenu en premier.">
        <Suspense><WaitlistForm /></Suspense>
        <p className="mt-8 text-sm text-fg-faint">Tu as déjà un accès ? <Link href="/connexion" className="text-fg-muted underline underline-offset-4 hover:text-fg">Se connecter</Link></p>
      </AuthShell>
    );
  }
  return (
    <AuthShell title="Crée ta boutique" subtitle="Connecte ta boutique Shopify, puis choisis ton offre (dès 50 €/mois, sans engagement).">
      <Suspense><AuthPanel mode="register" /></Suspense>
    </AuthShell>
  );
}
