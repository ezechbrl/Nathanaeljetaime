"use client";

import { useState } from "react";
import { OPTIMIZATIONS } from "@/lib/mock";

export function OptimizationList() {
  const [items, setItems] = useState(OPTIMIZATIONS);

  return (
    <ul className="divide-y divide-black/5 rounded-3xl border border-black/5 bg-white">
      {items.map((o, i) => (
        <li key={o.title} className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="flex items-start gap-3">
            <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs ${o.done ? "bg-emerald-50 text-emerald-700" : "bg-brand-soft text-brand"}`}>
              {o.done ? "✓" : String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="text-sm font-medium">{o.title}</p>
              <p className="text-xs text-black/50">Impact estimé : {o.impact}</p>
            </div>
          </div>
          {o.done ? (
            <span className="text-xs font-medium text-emerald-700">Appliquée</span>
          ) : (
            <button
              onClick={() => setItems((all) => all.map((x) => (x.title === o.title ? { ...x, done: true, impact: "en mesure" } : x)))}
              className="rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-white"
            >
              Appliquer
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
