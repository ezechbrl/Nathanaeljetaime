import { Check, Clock, Minus } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Section";
import { cn } from "@/lib/cn";

// Comparatif du temps et du coût pour lancer une boutique (fourchettes indicatives).
const ROWS = [
  { who: "Seul, dans Shopify", time: "2 à 4 semaines", cost: "0 €, mais tout ton temps", strategy: false, copy: false, visuals: false, daily: false },
  { who: "Un freelance", time: "1 à 3 semaines", cost: "500 à 1 500 €", strategy: false, copy: true, visuals: true, daily: false },
  { who: "Une agence", time: "3 à 6 semaines", cost: "2 000 € et plus", strategy: true, copy: true, visuals: true, daily: false },
  { who: "Vitrio", time: "10 minutes", cost: "Gratuit pour commencer", strategy: true, copy: true, visuals: true, daily: true, us: true },
];
const COLS = [
  { k: "strategy", label: "Stratégie" },
  { k: "copy", label: "Textes" },
  { k: "visuals", label: "Visuels" },
  { k: "daily", label: "Suivi quotidien" },
] as const;

export function Compare() {
  return (
    <section className="py-24">
      <Container>
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
          <Reveal as="h2" className="text-h2">Combien de temps pour <span className="serif-accent">lancer</span> ta boutique ?</Reveal>
          <Reveal delay={80} as="p" className="text-[17px] leading-relaxed text-fg-muted lg:pb-2">
            Le même résultat (une boutique complète, cohérente, prête à vendre), quatre façons d'y arriver. Fais le calcul.
          </Reveal>
        </div>
        <Reveal delay={120} className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-left text-sm">
            <thead className="text-fg-faint">
              <tr>
                <th className="px-5 py-2 font-normal">Qui s'en occupe</th>
                <th className="px-5 py-2 font-normal">Délai</th>
                <th className="px-5 py-2 font-normal">Coût</th>
                {COLS.map((c) => <th key={c.k} className="px-3 py-2 text-center font-normal">{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.who} className={cn(r.us ? "bg-accent-deep/40 text-fg" : "bg-white/[0.025] text-fg-muted")}>
                  <td className={cn("rounded-l-card px-5 py-4 text-[15px]", r.us && "font-medium text-fg")}>{r.who}</td>
                  <td className="px-5 py-4">
                    <span className={cn("inline-flex items-center gap-1.5", r.us && "text-accent")}><Clock className="h-3.5 w-3.5" />{r.time}</span>
                  </td>
                  <td className="px-5 py-4">{r.cost}</td>
                  {COLS.map((c, i) => (
                    <td key={c.k} className={cn("px-3 py-4 text-center", i === COLS.length - 1 && "rounded-r-card")}>
                      {r[c.k] ? <Check className="mx-auto h-4 w-4 text-accent" aria-label="oui" /> : <Minus className="mx-auto h-4 w-4 text-fg-faint" aria-label="non" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
        <p className="mt-3 text-xs text-fg-faint">Délais et tarifs : fourchettes habituelles du marché français, à titre indicatif.</p>
      </Container>
    </section>
  );
}
