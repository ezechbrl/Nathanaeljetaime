import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicQuiz } from "./PublicQuiz";

export const metadata: Metadata = { title: "Le quiz : trouve ton produit et ta boutique", description: "Ton profil, un univers, un produit, tes clients et le style qui te plaît : réponds au quiz et Vigenia crée ta boutique Shopify." };

export default function Page() {
  return <div className="min-h-[100dvh] pt-20 sm:pt-24"><Suspense><PublicQuiz /></Suspense></div>;
}
