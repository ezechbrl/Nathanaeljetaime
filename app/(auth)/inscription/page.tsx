import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthPanel } from "@/components/auth/AuthForms";
import { AuthShell } from "@/components/auth/AuthShell";
import { WaitlistForm } from "@/components/auth/WaitlistForm";
import { isWaitlist } from "@/lib/launch";

export const metadata: Metadata = { title: isWaitlist ? "Réserve ta place" : "Crée ta boutique", robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  // Venu d'un aperçu créé sans compte : on lui fait juste voir sa boutique, sans parler de paiement.
  const next = (await searchParams).next;
  const claiming = typeof next === "string" && next.includes("claim=");
  if (isWaitlist) {
    return (
      <AuthShell title="Réserve ta place" subtitle="Vigenia ouvre très bientôt. Inscris-toi maintenant : tu seras prévenu en premier, avec un prix réservé à vie.">
        <Suspense><WaitlistForm /></Suspense>
        <p className="mt-8 text-sm text-fg-faint">Tu as déjà un accès ? <Link href="/connexion" className="text-fg-muted underline underline-offset-4 hover:text-fg">Se connecter</Link></p>
      </AuthShell>
    );
  }
  if (claiming) {
    return (
      <AuthShell title="Connecte-toi pour voir ta boutique" subtitle="Ton e-mail et un code à 6 chiffres, pas de mot de passe. Ta boutique t'attend dans ton compte.">
        <Suspense><AuthPanel mode="register" /></Suspense>
      </AuthShell>
    );
  }
  return (
    <AuthShell title="Crée ta boutique" subtitle="Indique ta boutique Shopify (ou crée-la), puis choisis ton offre (dès 39 €/mois avec l'offre de lancement, sans engagement).">
      <Suspense><AuthPanel mode="register" /></Suspense>
    </AuthShell>
  );
}
