"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

// Simulateur : temps et budget économisés par rapport à une boutique faite seul ou par une agence.
const HOURS_PER_STORE = 45; // ~3 semaines à temps partiel
const AGENCY_PER_STORE = 2000;
const VITRIO_HOURS = 0.5; // brief, relecture et publication

function Slider({ id, label, value, min, max, step = 1, suffix, onChange }: { id: string; label: string; value: number; min: number; max: number; step?: number; suffix: string; onChange: (v: number) => void }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm text-fg-muted">{label}</label>
        <span className="text-lg tabular-nums text-fg">{value}{suffix}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full accent-[rgb(94_211_140)]"
        style={{ background: `linear-gradient(90deg, rgb(94 211 140) ${pct}%, rgb(255 255 255 / 0.1) ${pct}%)` }}
      />
    </div>
  );
}

function Big({ value, label, className }: { value: string; label: string; className?: string }) {
  return (
    <div className={cn("rounded-card border border-white/[0.07] bg-bg/60 p-5", className)}>
      <p className="whitespace-nowrap text-[clamp(1.6rem,1.2rem+1.2vw,2.2rem)] leading-none tracking-[-0.04em] tabular-nums text-fg">{value}</p>
      <p className="mt-2 text-sm text-fg-muted">{label}</p>
    </div>
  );
}

export function SavingsCalculator() {
  const [stores, setStores] = useState(3);
  const [rate, setRate] = useState(25);
  const hours = Math.round(stores * (HOURS_PER_STORE - VITRIO_HOURS));
  const money = stores * AGENCY_PER_STORE;
  const fmt = (n: number) => n.toLocaleString("fr-FR");

  return (
    <div className="mt-6 grid gap-6 rounded-[18px] border border-accent/20 bg-accent-deep/20 p-6 sm:p-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
      <div className="space-y-7">
        <p className="text-h3">Calcule ce que tu gagnes</p>
        <Slider id="calc-stores" label="Boutiques à lancer cette année" value={stores} min={1} max={20} suffix="" onChange={setStores} />
        <Slider id="calc-rate" label="Ce que vaut une heure de ton temps" value={rate} min={10} max={150} step={5} suffix=" €" onChange={setRate} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Big value={`${fmt(hours)} h`} label="de travail en moins" />
        <Big value={`${fmt(hours * rate)} €`} label="de ton temps économisé" />
        <Big value={`${fmt(money)} €`} label="d'agence évités" className="border-accent/30" />
      </div>
    </div>
  );
}
