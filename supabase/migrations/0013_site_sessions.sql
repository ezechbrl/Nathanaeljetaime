-- Mesure d'audience anonyme : une ligne par visite (identifiant aléatoire de session, sans cookie ni donnée personnelle).
create table if not exists public.site_sessions (
  id text primary key,
  path text not null default '/',
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now()
);
create index if not exists site_sessions_last_seen on public.site_sessions(last_seen);
create index if not exists site_sessions_first_seen on public.site_sessions(first_seen);
alter table public.site_sessions enable row level security;
