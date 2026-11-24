"use client";

import { Upload } from "lucide-react";
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
      className={cn("inline-flex items-center gap-2 rounded-ctl bg-white/[0.03] font-medium text-black glow-hover transition-transform hover:-translate-y-0.5", size === "sm" ? "h-9 px-3 text-sm" : "h-10 px-4 text-sm")}
    >
      <Upload className="h-4 w-4" /> Mettre en ligne sur Shopify
    </Link>
  );
}
