import { Suspense } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Generator } from "@/components/Generator";

export const metadata = { title: "Nouvelle boutique" };

export default function NewStorePage() {
  return (
    <>
      <PageHeader title="Nouvelle boutique" subtitle="Décris ton projet, l'IA pose la stratégie puis construit ta boutique." />
      <div className="max-w-5xl px-6 py-8 sm:px-10">
        <Suspense>
          <Generator hideIntro />
        </Suspense>
      </div>
    </>
  );
}
