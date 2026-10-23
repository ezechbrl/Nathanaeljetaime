-- Historique des ventes (nouvel abonné, paiement d'une période, désabonnement) pour le tableau de bord du fondateur.
create table if not exists public.revenue_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  kind text not null check (kind in ('new','payment','cancel')),
  plan text,
  amount_cents integer not null default 0,
  currency text not null default 'EUR',
  external_id text unique,
  created_at timestamptz not null default now()
);
create index if not exists revenue_events_created on public.revenue_events(created_at);
alter table public.revenue_events enable row level security;

-- Abonnements de test (boutiques de développement) : exclus du MRR et des revenus.
alter table public.subscriptions add column if not exists test boolean not null default false;
