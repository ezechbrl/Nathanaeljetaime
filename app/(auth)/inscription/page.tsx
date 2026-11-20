import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthPanel } from "@/components/auth/AuthForms";
import { AuthShell } from "@/components/auth/AuthShell";
import { WaitlistForm } from "@/components/auth/WaitlistForm";
import { isWaitlist } from "@/lib/launch";

export const metadata: Metadata = { title: isWaitlist ? "Réserve ta place" : "Crée ta boutique", robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  // Venu d'un aperçu créé depuis la page d'accueil : mêmes boutons Shopify, sans parler du prix.
  const sp = await searchParams;
  const next = sp.next;
  const claiming = typeof next === "string" && next.includes("claim=");
  // Déjà un projet en cours (produit décrit, lien collé ou quiz fait) : il ne reste que le compte.
  const started = !!(sp.brief || sp.url || (typeof next === "string" && next.includes("quiz")));
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
      <AuthShell title="Débloque ta boutique" subtitle="Indique ta boutique Shopify (ou crée-la) et ton e-mail : tu retrouves ta boutique dans ton compte.">
        <Suspense><AuthPanel mode="register" /></Suspense>
      </AuthShell>
    );
  }
  return (
    <AuthShell title={started ? "Plus qu'une étape" : "Crée ton compte"} subtitle={started ? "Entre ton e-mail pour enregistrer ta boutique. Elle se prépare juste après, en quelques minutes." : "Entre ton e-mail, et ta première boutique est prête en quelques minutes."}>
      <Suspense><AuthPanel mode="register" /></Suspense>
    </AuthShell>
  );
}
