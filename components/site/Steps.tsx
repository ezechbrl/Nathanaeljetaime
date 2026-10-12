import { Check, ShoppingBag, TrendingUp } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { Reveal } from "@/components/ui/Reveal";
import { Container, SectionHeading } from "@/components/ui/Section";
import { site } from "@/lib/site";

function ConnectVisual() {
  return (
    <div className="relative h-full">
      <p className="text-[10px] uppercase tracking-[0.14em] text-fg-faint">Connexion boutique</p>
      <div className="anim absolute left-2 top-10 text-center [animation:pop-in_.6s_.2s_cubic-bezier(.22,1,.36,1)]">
        <div className="grid h-14 w-14 place-items-center rounded-[12px] bg-[#f4f6f1] shadow-lg"><ShoppingBag className="h-7 w-7 text-[#5e8e3e]" /></div>
        <p className="mt-1.5 text-[10px] text-fg-muted">Shopify</p>
      </div>
      <svg className="absolute left-[4.5rem] top-[4.25rem] h-20 w-[calc(100%-9rem)] overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 60" aria-hidden>
        <path d="M0 0 H50 V60 H100" fill="none" stroke="rgb(79 227 207 / .25)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
        <path d="M0 0 H50 V60 H100" fill="none" stroke="rgb(79 227 207)" strokeWidth="1.6" strokeDasharray="6 14" vectorEffect="non-scaling-stroke" className="anim [animation:flow-dash_1.2s_linear_infinite]" />
      </svg>
      <div className="anim absolute bottom-2 right-2 text-center [animation:pop-in_.6s_.7s_cubic-bezier(.22,1,.36,1)]">
        <div className="grid h-14 w-14 place-items-center rounded-[12px] border border-accent/40 bg-accent-deep/60 shadow-[0_0_24px_rgb(79_227_207/0.3)]"><LogoMark className="h-8 w-8" /></div>
        <p className="mt-1.5 text-[10px] text-fg-muted">{site.name}</p>
      </div>
    </div>
  );
}

function BuildVisual() {
  return (
    <div className="relative h-full">
      <div className="anim ml-auto w-[85%] rounded-[10px] border border-white/10 bg-black/30 p-2.5 [animation:pop-in_.5s_.2s_ease-out]">
        <p className="text-[9px] uppercase tracking-[0.14em] text-fg-faint">Ton brief</p>
        <p className="anim mt-1 text-[11px] leading-snug text-fg [animation:type-in_1.4s_.5s_steps(40,end)]">Crée une boutique premium pour ma marque de baumes à lèvres.</p>
      </div>
      <div className="anim mt-4 w-[88%] rounded-[10px] border border-accent/25 bg-accent-deep/30 p-2.5 [animation:pop-in_.5s_1.9s_ease-out]">
        <p className="flex items-center gap-1.5 text-[11px] text-fg"><LogoMark className="h-4 w-4" /> {site.name} compose ta boutique</p>
        <div className="mt-2 h-1 overflow-hidden rounded bg-white/10"><div className="anim h-full origin-left rounded bg-accent [animation:grow-x_2.4s_2.1s_cubic-bezier(.4,0,.2,1)]" /></div>
        <ul className="mt-2 space-y-1 text-[10px] text-fg-muted">
          {["Marché et promesse", "Identité de marque", "Pages et fiche produit"].map((t, i) => (
            <li key={t} className="anim flex items-center gap-1.5 [animation:fade-in_.4s_both]" style={{ animationDelay: `${2.4 + i * 0.7}s` }}>
              <Check className="h-3 w-3 text-accent" /> {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function OptimizeVisual() {
  return (
    <div className="relative h-full">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-fg-faint">Pilotage</p>
          <p className="mt-0.5 text-xs text-fg">Optimisation quotidienne</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-accent/30 px-2 py-0.5 text-[10px] text-accent"><span className="anim h-1.5 w-1.5 rounded-full bg-accent [animation:pulse-dot_1.8s_infinite]" />Actif</span>
      </div>
      <p className="mt-3 text-[9px] uppercase tracking-[0.14em] text-fg-faint">Taux de conversion</p>
      <div className="relative h-9 text-3xl tracking-tight">
        <span className="anim absolute [animation:fade-out_.4s_2.2s_both]">1,5 %</span>
        <span className="anim absolute flex items-center gap-2 text-fg [animation:fade-in_.4s_2.4s_both]">4,2 % <TrendingUp className="h-5 w-5 text-good" /></span>
      </div>
      <svg viewBox="0 0 200 60" className="mt-1 h-14 w-full overflow-visible" aria-hidden>
        <defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgb(79 227 207)" stopOpacity=".35" /><stop offset="1" stopColor="rgb(79 227 207)" stopOpacity="0" /></linearGradient></defs>
        <path d="M0 52 C30 50 45 46 70 42 S110 36 130 26 S170 12 200 6 V60 H0Z" fill="url(#area)" className="anim [animation:fade-in_1s_1.4s_both]" />
        <path d="M0 52 C30 50 45 46 70 42 S110 36 130 26 S170 12 200 6" fill="none" stroke="rgb(79 227 207)" strokeWidth="2" strokeDasharray="400" className="anim [animation:draw_2s_.3s_cubic-bezier(.4,0,.2,1)_both]" />
      </svg>
      <ul className="mt-2 space-y-1 text-[10px] text-fg-muted">
        {["01 Copywriting affiné", "02 Page produit optimisée"].map((t, i) => (
          <li key={t} className="anim flex justify-between border-t border-white/[0.06] pt-1 [animation:fade-in_.4s_both]" style={{ animationDelay: `${2.6 + i * 0.4}s` }}>
            {t} <Check className="h-3 w-3 text-accent" />
          </li>
        ))}
      </ul>
    </div>
  );
}

const STEPS = [
  { Visual: ConnectVisual, title: "Connecte ta boutique Shopify", text: `Relie ta boutique à ${site.name} en deux clics pour réunir tes produits, ta marque et ton thème.` },
  { Visual: BuildVisual, title: "L'IA construit, tu publies", text: "Elle définit ton marché, ta promesse, tes offres et les objections d'achat, puis construit toute la boutique dans la langue de ton marché. Tu vérifies, tu publies." },
  { Visual: OptimizeVisual, title: "L'IA optimise chaque jour", text: "Elle lit tes statistiques chaque matin et te dit, comme un expert e-commerce, ce qui marche, ce qui freine la vente, et quoi changer." },
];

export function Steps() {
  return (
    <section id="comment-ca-marche" className="py-24">
      <Container>
        <SectionHeading title={<>Crée ta boutique Shopify<br />en 3 étapes.</>} />
        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {STEPS.map(({ Visual, title, text }, i) => (
            <Reveal key={title} delay={i * 120} className="surface group relative overflow-hidden rounded-card">
              <div aria-hidden className="absolute inset-0 opacity-60 transition-opacity duration-500 [background:radial-gradient(ellipse_80%_50%_at_50%_0%,rgb(22_170_156/0.18),transparent)] group-hover:opacity-100" />
              <div className="relative h-56 p-5"><Visual /></div>
              <div className="relative p-5 pt-2">
                <span className="rounded-full border border-accent/30 bg-accent-deep/40 px-2.5 py-0.5 text-[11px] text-accent">Étape {i + 1}</span>
                <h3 className="mt-4 text-h3">{title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-fg-muted">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
