-- Avis des utilisateurs sur Vigenia : envoyés depuis l'app, affichés sur le site seulement une fois approuvés.
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  text text not null check (char_length(text) between 10 and 600),
  name text not null check (char_length(name) between 2 and 60),
  role text,
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id)
);
alter table public.testimonials enable row level security;
