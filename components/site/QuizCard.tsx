import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";

// Grand encart du quiz, avec un halo vert derrière pour qu'on le remarque tout de suite.
export function QuizCard({ href, className }: { href: string; className?: string }) {
  return (
    <div className={cn("relative w-full max-w-xl", className)}>
      <div aria-hidden className="pointer-events-none absolute -inset-3 rounded-[30px] bg-[radial-gradient(60%_80%_at_50%_50%,rgb(46_230_166/0.45),transparent_75%)] blur-2xl [animation:quiz-glow_3.2s_ease-in-out_infinite]" />
      <Link href={href} className="group relative flex items-center gap-4 rounded-[22px] border border-[#34f0b0]/50 bg-[linear-gradient(135deg,#0f4a3c,#0a3328_55%,#0d4034)] p-4 text-left shadow-[0_20px_50px_-20px_rgb(46_230_166/0.7),inset_0_1px_0_rgb(255_255_255/0.08)] transition-all hover:-translate-y-0.5 hover:border-[#34f0b0]/90 sm:p-5">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[16px] bg-[linear-gradient(160deg,#34f0b0,#0fae7c)] text-[#03140d] shadow-[0_0_24px_rgb(46_230_166/0.55),inset_0_1px_0_rgb(255_255_255/0.5)]"><Sparkles className="h-7 w-7" /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#86efc9]">Quiz · 1 minute</span>
          <span className="mt-0.5 block text-[17px] font-semibold leading-snug text-white sm:text-[19px]">Pas d'idée de produit ? <span className="serif-accent">Fais le quiz</span></span>
          <span className="mt-0.5 block text-[13px] leading-snug text-fg-muted">On te propose des idées de produits et on crée ta boutique.</span>
        </span>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-white transition-transform group-hover:translate-x-1"><ArrowRight className="h-5 w-5" /></span>
      </Link>
    </div>
  );
}
