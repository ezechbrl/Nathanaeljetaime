import { ArrowRight, Check } from "lucide-react";
import { CTA, isWaitlist } from "@/lib/launch";
import { Reveal } from "@/components/ui/Reveal";
import { PromptBox } from "./PromptBox";
import { DemoVideos } from "./DemoVideos";
import { StoreMarquee } from "./StoreMarquee";
import { NotificationPhone } from "./PhoneNotifications";

export function Hero() {
  return (
    <section className="relative pb-16 pt-24 sm:pt-36">
      <div className="relative mx-auto max-w-[1100px] px-4 sm:px-6 xl:grid xl:max-w-[1320px] xl:grid-cols-[minmax(0,1fr)_300px] xl:items-center xl:gap-14">
        <div className="min-w-0 text-center">
        {/* Sur téléphone, on va droit au titre (la pastille ne s'affiche que sur grand écran). */}
        <Reveal className="hidden sm:block">
          <span className="eyebrow mx-auto">
            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgb(94_211_140)]" />
            {CTA.eyebrow}
          </span>
        </Reveal>
        <Reveal delay={80} as="h1" className="mx-auto mt-2 sm:mt-7 max-w-4xl text-[clamp(2.6rem,1.4rem+3.8vw,4.8rem)] leading-[1.02] tracking-[-0.045em] [text-shadow:0_4px_40px_rgb(0_0_0/0.35)]">
          Ta boutique Shopify qui <span className="serif-accent pr-1">vend</span>, en 3 minutes
        </Reveal>
        <Reveal delay={180} as="p" className="mx-auto mt-5 max-w-2xl text-[16px] font-medium leading-relaxed text-fg-muted sm:mt-6 sm:text-lg">
          <span className="sm:hidden"><span className="font-semibold text-white">La qualité d'une agence</span>, pour <span className="underline-green text-white">le prix d'un resto</span>.</span>
          <span className="hidden sm:inline">Textes, photos, vrais avis et design à ta marque : <span className="font-semibold text-white">la qualité d'une agence</span>, pour <span className="underline-green text-white">le prix d'un resto</span>. Toi, tu valides et tu vends.</span>
        </Reveal>
        <Reveal delay={260} className="mt-9">
          <div id="creer" className="scroll-mt-28"><PromptBox align="center" /></div>
        </Reveal>
        {/* Beaucoup de visiteurs (TikTok) n'ont pas encore d'idée : une porte d'entrée claire vers le quiz. */}
        {!isWaitlist && (
          <Reveal delay={300} className="mt-4">
            <a href="/quiz" className="group mx-auto flex w-full max-w-[560px] items-center gap-3 rounded-[18px] border border-[#3dff9a]/35 bg-[#3dff9a]/[0.06] px-4 py-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-[#3dff9a]/70 hover:bg-[#3dff9a]/[0.1]">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#3dff9a] text-[18px]">🎯</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold text-white">Pas encore d'idée de produit ?</span>
                <span className="block text-[13px] text-white/65">Réponds à quelques questions (2 min) : on te propose les produits et on crée ta boutique.</span>
              </span>
              <ArrowRight className="h-5 w-5 shrink-0 text-[#3dff9a] transition-transform group-hover:translate-x-0.5" />
            </a>
          </Reveal>
        )}
        {/* Petits arguments vérifiables (pas de prix ici : il vient plus tard) (pas de « moins cher du marché » qu'on ne peut pas prouver) */}
        <Reveal delay={320} className="mt-6"><ul className="flex flex-wrap justify-center gap-2 text-[13px] sm:text-sm">
          {[
            { t: "Prête en 3 minutes", mobile: true },
            { t: "Aucune compétence", mobile: true },
            { t: "Photos de pro incluses", mobile: false },
            { t: "Annulable en un clic", mobile: false },
          ].map(({ t, mobile }) => (
            <li key={t} className={`${mobile ? "flex" : "hidden sm:flex"} items-center gap-1.5 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-fg/85`}><Check className="h-3.5 w-3.5 text-accent" /> {t}</li>
          ))}</ul>
        </Reveal>
        </div>
        {/* Grand écran : le téléphone qui reçoit des commandes, aligné avec le titre (sur téléphone, il est plus bas). */}
        <NotificationPhone className="hidden xl:block" />
      </div>
      <div className="relative mx-auto max-w-[1100px] px-4 sm:px-6"><StoreMarquee /></div>
      <div className="relative px-4 sm:px-6">
        {/* Démonstration : enregistrement réel de l'app, sous les boutiques qui défilent. */}
        <Reveal delay={380} className="relative mx-auto mt-10 max-w-[1320px] sm:mt-14">
          <div aria-hidden className="absolute -inset-6 rounded-[32px] blur-2xl" />
          <div className="relative"><DemoVideos /></div>
        </Reveal>
      </div>
    </section>
  );
}
