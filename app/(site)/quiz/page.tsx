import type { Metadata } from "next";
import { PublicQuiz } from "./PublicQuiz";

export const metadata: Metadata = { title: "Trouve ton produit en 5 questions", description: "Niche, produit, clients, style, prix : réponds à 5 questions et Vigenia crée ta boutique Shopify." };

export default function Page() {
  return <div className="pt-20 sm:pt-24"><PublicQuiz /></div>;
}
