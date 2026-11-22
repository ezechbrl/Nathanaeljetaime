-- Réponses à « Qu'est-ce qui te fait hésiter ? », posée sur l'aperçu (boutique pas encore débloquée).
create table if not exists public.hesitations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  store_id uuid references public.stores(id) on delete set null,
  email text,
  reason text,
  details text,
  created_at timestamptz not null default now()
);
create index if not exists hesitations_created_idx on public.hesitations (created_at desc);
alter table public.hesitations enable row level security;
