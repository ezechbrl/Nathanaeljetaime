-- Erreurs serveur (5xx) pour le tableau de bord du fondateur, et ouverture de la page de paiement (entonnoir).
create table if not exists public.app_errors (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  status integer not null,
  code text,
  message text,
  created_at timestamptz not null default now()
);
create index if not exists app_errors_created on public.app_errors(created_at);
alter table public.app_errors enable row level security;
alter table public.revenue_events drop constraint if exists revenue_events_kind_check;
alter table public.revenue_events add constraint revenue_events_kind_check check (kind in ('new','payment','cancel','checkout'));
