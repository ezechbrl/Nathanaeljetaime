-- Appareils du fondateur (app « Ventes ») : clé longue durée, stockée hachée, révocable en supprimant la ligne.
create table if not exists public.owner_devices (
  token_hash text primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_used_at timestamptz not null default now()
);
alter table public.owner_devices enable row level security;
