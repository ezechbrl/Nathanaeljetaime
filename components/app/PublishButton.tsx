"use client";

import { ShopifyBag } from "@/components/auth/AuthForms";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useStore } from "./StoreContext";

// Mise en ligne : page guidée pour télécharger la boutique et l'importer dans Shopify (sans app Shopify).
export function PublishButton({ size = "md" }: { size?: "sm" | "md" }) {
  const { store } = useStore();
  if (!store.plan) return null;
  return (
    <Link
      href={`/app/boutiques/${store.id}/installer`}
      aria-label="Publier sur Shopify"
      className={cn("inline-flex items-center gap-2 rounded-ctl border border-[#14b886]/60 bg-[linear-gradient(180deg,#14b886,#00876a)] font-semibold text-white glow-hover transition-transform hover:-translate-y-0.5", size === "sm" ? "h-9 px-3 text-sm" : "h-10 px-4 text-sm")}
    >
      Publier <ShopifyBag className="h-5 w-5" />
    </Link>
  );
}
