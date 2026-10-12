import { site } from "@/lib/site";

export const FAQ_ITEMS = [
  {
    q: "C'est quoi, un créateur de boutique IA ?",
    a: `Un outil qui construit ta boutique en ligne à partir de ce que tu lui dis. Avec ${site.name}, tu décris ton projet, tu colles le lien d'un produit ou tu connectes ta boutique existante. L'IA pose d'abord ton marché, ta promesse et tes offres, puis génère toute la boutique Shopify à partir de ça.`,
  },
  { q: `${site.name} est-il gratuit ?`, a: "Tu peux générer ta première boutique gratuitement. Les offres payantes débloquent les boutiques illimitées, l'éditeur par chat et l'optimisation quotidienne." },
  { q: "Ça marche avec Shopify ?", a: "Oui. Le contenu généré est envoyé directement sur ta boutique Shopify via l'API officielle. Tu gardes la propriété de ta boutique, de tes produits et de tes données." },
  { q: "Que génère l'IA exactement ?", a: "La stratégie (marché, promesse, offres, objections), l'identité de marque, la page d'accueil, les fiches produits avec prix conseillé et SEO, la FAQ et la page « À propos »." },
  { q: "Peut-on modifier la boutique après ?", a: "Oui, tout se modifie : en discutant avec l'IA, dans l'éditeur, ou directement dans Shopify." },
  { q: "Dans quelles langues ?", a: "Toutes les langues principales : français, anglais, espagnol, allemand, italien, néerlandais, portugais, et plus." },
];

export function Faq() {
  return (
    <section id="faq" className="bg-black/[0.02] px-4 py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">Le créateur de boutique Shopify IA, en questions</h2>
        <p className="mt-3 text-center text-black/60">Ce que fait {site.name}, ce qui est gratuit, et ce que tu gardes.</p>
        <div className="mt-10 divide-y divide-black/5 rounded-3xl border border-black/5 bg-white">
          {FAQ_ITEMS.map((item, i) => (
            <details key={item.q} className="group p-6" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {item.q}
                <span className="text-xl text-black/40 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-black/60">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
