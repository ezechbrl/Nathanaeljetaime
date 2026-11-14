-- Aperçus créés depuis la page d'accueil, sans compte. Le visiteur garde un jeton dans un cookie ;
-- quand il crée son compte pour débloquer sa boutique, l'aperçu devient une boutique de son compte.
create table if not exists public.previews (
  id uuid primary key default gen_random_uuid(),
  claim_token text not null,
  visitor text,                          -- empreinte anonyme (IP hachée) pour limiter les abus
  mode text not null check (mode in ('start', 'link')),
  brief text not null,
  source_url text,
  language text not null default 'français',
  status text not null default 'generating' check (status in ('generating', 'ready', 'failed')),
  name text,
  teaser jsonb,
  theme jsonb,
  error text,
  claimed_by uuid references public.users(id) on delete set null,
  store_id uuid references public.stores(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists previews_created_idx on public.previews (created_at desc);
alter table public.previews enable row level security;
