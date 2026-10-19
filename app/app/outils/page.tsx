"use client";

import { useApp } from "@/components/app/AppContext";
import { PageHeader } from "@/components/app/PageHeader";
import { FreeTools } from "@/components/site/FreeTools";

// Outils IA pour peaufiner et faire connaître sa boutique : nom, slogan, description, FAQ, vidéos TikTok, Instagram.
// Les champs sont pré-remplis avec la dernière boutique prête.
export default function ToolsPage() {
  const { stores } = useApp();
  const s = stores.find((x) => x.plan);
  const defaults: Record<string, string> = s?.plan
    ? { niche: s.niche, brandName: s.plan.brand.name || s.name, productName: s.plan.product.title, details: s.plan.product.subtitle }
    : {};
  return (
    <>
      <PageHeader title="Outils IA" subtitle="Trouve un nom, écris tes textes et prépare tes vidéos : copie le résultat en un clic." />
      <div className="p-5 sm:p-8"><div className="max-w-[1100px]"><FreeTools inApp defaults={defaults} /></div></div>
    </>
  );
}
