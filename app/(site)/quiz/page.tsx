import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicQuiz } from "./PublicQuiz";

export const metadata: Metadata = { title: "Quoi vendre en ligne ? Le quiz pour trouver ton produit (2 min)", description: "Réponds à quelques questions : on te propose des produits à vendre et Vigenia crée l'aperçu gratuit de ta boutique Shopify.", alternates: { canonical: "/quiz" } };

export default function Page() {
  return <div className="min-h-[100dvh] pt-20 sm:pt-24"><Suspense><PublicQuiz /></Suspense></div>;
}
