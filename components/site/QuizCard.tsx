import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";

// Grand encart du quiz, avec un halo vert derrière pour qu'on le remarque tout de suite.
export function QuizCard({ href, className }: { href: string; className?: string }) {
  return (
    <div className={cn("relative w-full max-w-xl", className)}>
      <div aria-hidden className="pointer-events-none absolute -inset-3 rounded-[30px] blur-2xl [animation:quiz-glow_3.2s_ease-in-out_infinite]" />
      <Link href={href} className="group relative flex items-center gap-4 rounded-[22px] border border-white/15 bg-[linear-gradient(135deg,#0f4a3c,#0a3328_55%,#0d4034)] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-white/15 sm:p-5">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[16px] bg-[#3dff9a] glow-hover text-[#03140d]"><Sparkles className="h-7 w-7" /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">Quiz · 1 minute</span>
          <span className="mt-0.5 block text-[17px] font-semibold leading-snug text-white sm:text-[19px]">Pas d'idée de produit ? <span className="serif-accent">Fais le quiz</span></span>
          <span className="mt-0.5 block text-[13px] leading-snug text-fg-muted">On te propose des idées de produits et on crée ta boutique.</span>
        </span>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-white transition-transform group-hover:translate-x-1"><ArrowRight className="h-5 w-5" /></span>
      </Link>
    </div>
  );
}
