import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Section";
import { PageHero } from "@/components/site/PageHero";
import { QUESTIONS, QUESTION_CATS, questionSlug } from "@/lib/content/questions";

export const metadata: Metadata = { title: "Questions sur Shopify, AliExpress et le e-commerce : nos réponses", description: "Créer sa boutique Shopify, importer un produit AliExpress, dropshipping, paiement, livraison, légal : les réponses simples aux questions qu'on se pose.", alternates: { canonical: "/questions" } };

export default function QuestionsIndex() {
  const cats = [...QUESTION_CATS, ...new Set(QUESTIONS.map((q) => q.cat).filter((c) => !(QUESTION_CATS as readonly string[]).includes(c)))];
  return (
    <>
      <PageHero eyebrow="Questions" title="Tes questions sur Shopify et le e-commerce" subtitle="Des réponses simples et honnêtes aux questions qu'on se pose quand on lance sa boutique." />
      <Container className="max-w-[900px] space-y-10">
        {cats.map((c) => {
          const list = QUESTIONS.filter((q) => q.cat === c);
          if (!list.length) return null;
          return (
            <section key={c}>
              <h2 className="text-xl font-semibold">{c}</h2>
              <div className="mt-3 divide-y divide-white/[0.07] border-y border-white/[0.07]">{list.map((q) => <Link key={q.q} href={`/questions/${questionSlug(q.q)}`} className="block py-3 text-[15px] hover:text-accent">{q.q}</Link>)}</div>
            </section>
          );
        })}
      </Container>
    </>
  );
}
