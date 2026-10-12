import Link from "next/link";
import { StatusBadge } from "@/components/ui/Feedback";
import type { Store } from "@/lib/api/types";
import { timeAgo } from "@/lib/format";
import { StoreThumb } from "./StorePreview";

export function StoreCard({ store }: { store: Store }) {
  return (
    <Link href={`/app/boutiques/${store.id}`} className="group block rounded-card border border-white/[0.07] bg-white/[0.02] p-3 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-white/15">
      <StoreThumb store={store} />
      <div className="mt-3 flex items-start justify-between gap-3 px-1">
        <div className="min-w-0">
          <p className="truncate tracking-tight group-hover:text-accent">{store.name}</p>
          <p className="truncate text-xs text-fg-faint">{store.language} · modifiée {timeAgo(store.updatedAt)}</p>
        </div>
        <StatusBadge status={store.status} />
      </div>
    </Link>
  );
}
