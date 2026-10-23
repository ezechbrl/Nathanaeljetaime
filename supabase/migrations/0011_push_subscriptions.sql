-- Notifications push de l'app « Vigenia Ventes » (écran d'accueil du téléphone du fondateur).
create table if not exists public.push_subscriptions (
  endpoint text primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  keys jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
