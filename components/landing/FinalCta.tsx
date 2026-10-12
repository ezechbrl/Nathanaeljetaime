import Link from "next/link";

export function FinalCta() {
  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-5xl rounded-[2rem] bg-ink px-6 py-16 text-center text-white">
        <h2 className="mx-auto max-w-2xl text-3xl font-bold sm:text-4xl">Crée des boutiques Shopify à fort potentiel avec l'IA</h2>
        <p className="mx-auto mt-4 max-w-xl text-white/60">
          Décris ton projet. L'IA construit une boutique à l'image de ta marque, puis tu modifies tout en discutant ou dans l'éditeur avant de publier sur Shopify.
        </p>
        <Link href="/inscription" className="mt-8 inline-block rounded-full bg-white px-8 py-4 font-semibold text-ink hover:bg-white/90">
          Créer ma boutique
        </Link>
      </div>
    </section>
  );
}
