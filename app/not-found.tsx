import { ButtonLink } from "@/components/ui/Button";
import { LightRays } from "@/components/ui/LightRays";
import { Logo } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <main className="relative grid min-h-dvh place-items-center px-4 text-center">
      <LightRays />
      <div className="relative">
        <Logo className="justify-center" />
        <p className="mt-12 font-serif text-[8rem] italic leading-none text-accent">404</p>
        <h1 className="mt-4 text-h2">Cette page n'existe pas</h1>
        <p className="mx-auto mt-4 max-w-sm text-fg-muted">Le lien est peut-être ancien, ou la page a changé d'adresse.</p>
        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink href="/">Retour à l'accueil</ButtonLink>
          <ButtonLink href="/contact" variant="secondary">Nous écrire</ButtonLink>
        </div>
      </div>
    </main>
  );
}
