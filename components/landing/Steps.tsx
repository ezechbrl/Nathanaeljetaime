import { site } from "@/lib/site";

function ConnectVisual() {
  return (
    <div className="flex h-44 flex-col items-center justify-center gap-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-brand-soft/70 p-5">
      <div className="flex items-center gap-3">
      <div className="rounded-xl bg-white px-3 py-2 text-xs font-semibold shadow-sm">🛍️ Shopify</div>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 rounded-full bg-brand/60" />)}
      </div>
      <div className="rounded-xl bg-ink px-3 py-2 text-xs font-semibold text-white shadow-sm">{site.name}</div>
      </div>
      <p className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-emerald-700 shadow-sm">
        ✓ Boutique connectée
      </p>
    </div>
  );
}

function BriefVisual() {
  return (
    <div className="flex h-44 flex-col justify-center gap-2 rounded-2xl bg-gradient-to-br from-amber-50 to-brand-soft/70 p-5 text-xs">
      <p className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-ink px-3 py-2 text-white">
        Crée une boutique premium pour ma marque de baumes à lèvres.
      </p>
      <p className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white px-3 py-2 shadow-sm">
        <span className="font-semibold text-brand">{site.name}</span> compose ta boutique…
        <span className="mt-1.5 block h-1 overflow-hidden rounded bg-black/5"><span className="block h-full w-2/3 rounded bg-brand" /></span>
      </p>
    </div>
  );
}

function OptimizeVisual() {
  return (
    <div className="flex h-44 flex-col justify-center gap-3 rounded-2xl bg-gradient-to-br from-sky-50 to-brand-soft/70 p-5 text-xs">
      <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm">
        <span className="text-black/50">Taux de conversion</span>
        <span className="font-semibold">1,5 % → <span className="text-emerald-600">4,2 % ↗</span></span>
      </div>
      <div className="space-y-1.5 rounded-xl bg-white px-3 py-2 shadow-sm">
        <p className="flex justify-between"><span>01 Copywriting affiné</span><span className="text-emerald-600">✓</span></p>
        <p className="flex justify-between"><span>02 Page produit optimisée</span><span className="text-emerald-600">✓</span></p>
      </div>
    </div>
  );
}

const STEPS = [
  {
    Visual: ConnectVisual,
    title: "Connecte ta boutique Shopify",
    text: `Relie ta boutique à ${site.name} en quelques clics pour réunir tes produits, ta marque et ton thème.`,
  },
  {
    Visual: BriefVisual,
    title: "L'IA construit et publie",
    text: "Elle définit ton marché, ta promesse, tes offres et les objections d'achat, puis construit toute la boutique dans la langue de ton marché. Tu vérifies, puis tu publies.",
  },
  {
    Visual: OptimizeVisual,
    title: "L'IA optimise chaque jour",
    text: "Elle analyse ta boutique et propose des améliorations pour faire progresser ton taux de conversion, en t'expliquant ce qui marche et ce qui freine la vente.",
  },
];

export function Steps() {
  return (
    <section id="comment-ca-marche" className="bg-black/[0.02] px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">Crée ta boutique Shopify<br />en 3 étapes.</h2>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map(({ Visual, title, text }, i) => (
            <div key={title} className="relative rounded-3xl border border-black/5 bg-white p-5">
              <Visual />
              <p className="mt-6 text-xs font-semibold text-black/40">Étape {i + 1}</p>
              <h3 className="mt-1 text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-black/60">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
