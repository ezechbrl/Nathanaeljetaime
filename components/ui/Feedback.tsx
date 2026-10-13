import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-shimmer rounded-ctl bg-[linear-gradient(90deg,rgb(255_255_255/0.03),rgb(255_255_255/0.07),rgb(255_255_255/0.03))] bg-[length:200%_100%]", className)} />;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-card border border-bad/20 bg-bad/5 p-8 text-center">
      <AlertTriangle className="h-5 w-5 text-bad" />
      <p className="text-sm text-fg-muted">{message}</p>
      {onRetry && <button onClick={onRetry} className="text-sm text-fg underline underline-offset-4">Réessayer</button>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, action }: { icon: React.ComponentType<{ className?: string }>; title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-card border border-dashed border-white/10 px-6 py-14 text-center">
      <span className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.03]"><Icon className="h-5 w-5 text-fg-muted" /></span>
      <p className="mt-4 text-lg tracking-tight">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-fg-muted">{text}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Meter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = limit >= 999 ? 4 : Math.min(100, (used / Math.max(limit, 1)) * 100);
  return (
    <div>
      <div className="flex justify-between text-[11px] text-fg-muted">
        <span>{label}</span>
        <span className="tabular-nums">{used} / {limit >= 999 ? "∞" : limit}</span>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded bg-white/[0.06]">
        <div className={cn("h-full rounded transition-[width] duration-500", pct > 85 ? "bg-warn" : "bg-accent/80")} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    generating: ["En génération", "border-accent/30 text-accent"],
    ready: ["Prête à publier", "border-warn/30 text-warn"],
    publishing: ["Publication…", "border-accent/30 text-accent"],
    published: ["En ligne", "border-good/30 text-good"],
    failed: ["Échec", "border-bad/30 text-bad"],
  };
  const [label, cls] = map[status] ?? [status, "border-white/15 text-fg-muted"];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px]", cls)}>
      <span className={cn("h-1.5 w-1.5 rounded-full bg-current", (status === "generating" || status === "publishing") && "animate-pulse")} />
      {label}
    </span>
  );
}

type AiBudget = {
  spentEur: number; limitEur: number; blockedUntil: string | null; resetsAt: string | null;
  session: { spentEur: number; limitEur: number; hours: number; resetsAt: string | null; blockedUntil: string | null };
};

const euros = (n: number) => n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
function inText(until: string) {
  const min = Math.max(1, Math.ceil((new Date(until).getTime() - Date.now()) / 60_000));
  return min < 60 ? `${min} min` : `${Math.floor(min / 60)} h${min % 60 ? ` ${String(min % 60).padStart(2, "0")}` : ""}`;
}

function Bar({ label, value, limit, hint }: { label: string; value: number; limit: number; hint?: string }) {
  const pct = Math.min(100, (value / limit) * 100);
  return (
    <div>
      <div className="flex justify-between text-[11px] text-fg-muted">
        <span>{label}</span>
        <span className="tabular-nums">{euros(value)} / {euros(limit)}</span>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded bg-white/[0.06]">
        <div className={cn("h-full rounded transition-[width] duration-500", pct > 80 ? "bg-warn" : "bg-accent/80")} style={{ width: `${pct}%` }} />
      </div>
      {hint && <p className="mt-1 text-[10.5px] text-fg-faint">{hint}</p>}
    </div>
  );
}

// Crédit d'IA, comme Claude : une recharge toutes les quelques heures, et une limite par semaine.
export function AiBudgetMeter({ budget }: { budget: AiBudget }) {
  if (budget.blockedUntil) {
    return (
      <div className="rounded-ctl border border-warn/30 bg-warn/5 p-2 text-[11px] leading-snug text-fg-muted" role="status">
        <span className="font-medium text-fg">IA en pause · {inText(budget.blockedUntil)}</span><br />
        Limite de la semaine ({euros(budget.limitEur)}) atteinte.
      </div>
    );
  }
  const s = budget.session;
  const left = Math.max(0, budget.limitEur - budget.spentEur);
  const low = left / budget.limitEur <= 0.25;
  return (
    <div className="space-y-2.5">
      {low && (
        <p className="rounded-ctl border border-warn/30 bg-warn/5 p-2 text-[11px] leading-snug text-fg-muted" role="status">
          <span className="font-medium text-fg">Plus que {euros(left)} cette semaine</span><br />
          Environ {Math.max(1, Math.floor(left / 0.07))} messages à l'IA avant la pause.
        </p>
      )}
      {s.blockedUntil ? (
        <div className="rounded-ctl border border-warn/30 bg-warn/5 p-2 text-[11px] leading-snug text-fg-muted" role="status">
          <span className="font-medium text-fg">Crédit épuisé</span><br />
          Se recharge dans {inText(s.blockedUntil)}.
        </div>
      ) : (
        <Bar label={`Crédit IA (${s.hours} h)`} value={s.spentEur} limit={s.limitEur} hint={s.resetsAt ? `Se recharge dans ${inText(s.resetsAt)}` : `Démarre à ta prochaine demande`} />
      )}
      <Bar label="Cette semaine" value={budget.spentEur} limit={budget.limitEur} />
    </div>
  );
}
