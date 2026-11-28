-- Dépenses du fondateur (abonnements et services payés pour faire tourner Vigenia), visibles dans Ventes.
-- (Appliquée le 28 nov. 2026 avec quelques lignes de départ ; les montants inconnus restent vides.)
create table if not exists owner_costs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  what text,
  amount_cents integer,
  currency text not null default 'EUR',
  period text not null default 'month',
  method text,
  essential boolean not null default false,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);
alter table owner_costs enable row level security;
