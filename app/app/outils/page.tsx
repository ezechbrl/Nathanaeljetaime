import { PageHeader } from "@/components/app/PageHeader";
import { FreeTools } from "@/components/site/FreeTools";

// Petits outils IA pour peaufiner sa boutique après la génération : nom, slogan, description, FAQ.
export default function ToolsPage() {
  return (
    <>
      <PageHeader title="Outils IA" subtitle="Trouve un vrai nom, un slogan, ou réécris une description, puis colle-les dans ta boutique." />
      <div className="p-5 sm:p-8"><div className="max-w-[1050px]"><FreeTools inApp /></div></div>
    </>
  );
}
