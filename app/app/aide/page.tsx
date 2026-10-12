import { PageHeader } from "@/components/app/PageHeader";
import { ContactForm } from "@/components/site/ContactForm";
import { FaqList } from "@/components/site/Faq";
import { HOME_FAQ } from "@/lib/content/faq";
import { site } from "@/lib/site";

export default function HelpPage() {
  return (
    <>
      <PageHeader title="Aide et contact" subtitle={`Une question ? Écris-nous, ou à ${site.email}.`} />
      <div className="grid gap-8 p-5 sm:p-8 xl:grid-cols-2">
        <div><h2 className="mb-4 text-lg tracking-tight">Questions fréquentes</h2><FaqList items={HOME_FAQ} defaultOpen={null} /></div>
        <div><h2 className="mb-4 text-lg tracking-tight">Nous écrire</h2><ContactForm /></div>
      </div>
    </>
  );
}
