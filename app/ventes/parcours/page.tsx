"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Journeys } from "../Journeys";

// Le parcours des clients en grand tableau, pour un écran d'ordinateur.
export default function ParcoursPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6">
      <Link href="/ventes" className="mb-4 inline-flex items-center gap-2 text-sm text-white/80 hover:text-white"><ArrowLeft className="h-4 w-4" /> Ventes</Link>
      <Journeys wide />
    </div>
  );
}
