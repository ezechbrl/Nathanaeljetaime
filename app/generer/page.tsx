import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Generator } from "@/components/Generator";

export const metadata = { title: "Créer ma boutique" };

export default function GeneratePage() {
  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto max-w-5xl px-4 py-12">
        <Suspense>
          <Generator />
        </Suspense>
      </main>
    </>
  );
}
