import { Star } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { REVIEWS, type Review } from "@/lib/content/reviews";
import { db } from "@/lib/server/supabase";

// Avis approuvés laissés par les utilisateurs dans l'app (table testimonials).
async function approved(): Promise<Review[]> {
  try {
    const { data } = await db().from("testimonials").select("name, role, text, rating").eq("approved", true).order("created_at", { ascending: false }).limit(12);
    return (data ?? []).map((r) => ({ name: r.name, role: r.role ?? "Utilisateur de Vigenia", text: r.text, rating: r.rating }));
  } catch {
    return []; // base indisponible (build local) : section masquée
  }
}

// Avis des utilisateurs : cartes en verre lumineuses. Masqué tant qu'il n'y a pas de vrais avis.
export async function Reviews() {
  const all = [...REVIEWS, ...(await approved())];
  if (!all.length) return null;
  return (
    <section className="py-20">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <Reveal as="h2" className="text-center text-h2">Ils ont lancé leur boutique avec <span className="serif-accent">Vigenia</span></Reveal>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {all.map((r, i) => (
            <Reveal key={r.name + i} delay={(i % 3) * 80} className="group rounded-[22px] bg-[linear-gradient(160deg,rgb(46_230_166/0.55),rgb(255_255_255/0.05)_40%,rgb(163_230_53/0.25))] p-px transition-transform duration-500 hover:-translate-y-1">
              <figure className="relative h-full overflow-hidden rounded-[21px] bg-[linear-gradient(180deg,rgb(8_40_31/0.92),rgb(3_16_12/0.96))] p-6 backdrop-blur-xl">
                <div aria-hidden className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[radial-gradient(closest-side,rgb(46_230_166/0.25),transparent)] transition-opacity duration-500 group-hover:opacity-100 md:opacity-60" />
                <div className="flex gap-0.5" aria-label={`${r.rating} sur 5`}>
                  {Array.from({ length: 5 }).map((_, k) => <Star key={k} className={k < r.rating ? "h-4 w-4 fill-[#2ee6a6] text-[#2ee6a6] drop-shadow-[0_0_6px_rgb(46_230_166/0.8)]" : "h-4 w-4 text-white/20"} />)}
                </div>
                <blockquote className="relative mt-4 text-[15.5px] leading-relaxed text-fg/90">« {r.text} »</blockquote>
                <figcaption className="relative mt-6 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[conic-gradient(from_180deg,#2ee6a6,#a3e635,#2ee6a6)] p-[2px]"><span className="grid h-full w-full place-items-center rounded-full bg-[#05261d] text-sm font-semibold text-[#a7f3d0]">{r.name.charAt(0)}</span></span>
                  <span className="leading-tight"><span className="block text-[14px] font-semibold">{r.name}</span><span className="block text-[12.5px] text-fg-faint">{r.role}</span></span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
