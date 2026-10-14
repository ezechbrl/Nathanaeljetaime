-- Liste d'attente avant l'ouverture publique.
create table if not exists public.waitlist (
  email text primary key,
  brief text,
  ref text,
  created_at timestamptz not null default now()
);
alter table public.waitlist enable row level security;
