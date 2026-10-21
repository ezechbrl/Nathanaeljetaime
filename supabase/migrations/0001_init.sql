-- Schéma Vigenia. À coller dans Supabase → SQL Editor → New query → Run (une seule fois).
-- Toutes les lectures/écritures passent par le serveur (clé service_role) : la RLS est activée
-- sans politique, ce qui bloque tout accès direct depuis le navigateur.

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  first_name text not null default '',
  avatar_url text,
  plan text not null default 'free' check (plan in ('free','pro','agency')),
  stripe_customer_id text unique,
  referred_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shop_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  shop_domain text not null,
  shop_name text not null default '',
  access_token_encrypted text,
  scopes text not null default '',
  status text not null default 'active' check (status in ('active','uninstalled','error')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, shop_domain)
);
create index if not exists shop_connections_domain on public.shop_connections(shop_domain);

create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  shop_connection_id uuid references public.shop_connections(id) on delete set null,
  name text not null,
  niche text not null default '',
  language text not null default 'français',
  mode text not null default 'start' check (mode in ('start','link','recraft')),
  status text not null default 'generating' check (status in ('generating','ready','publishing','published','failed')),
  brief text not null default '',
  source_url text,
  theme jsonb not null default '{}'::jsonb,
  plan jsonb,
  shopify jsonb not null default '{}'::jsonb, -- ids créés sur Shopify (produit, pages)
  preview_url text,
  live_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists stores_user on public.stores(user_id, updated_at desc);

create table if not exists public.store_versions (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  label text not null,
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists store_versions_store on public.store_versions(store_id, created_at desc);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  kind text not null check (kind in ('generate','publish','image','recraft')),
  status text not null default 'queued' check (status in ('queued','running','succeeded','failed')),
  progress int not null default 0,
  steps jsonb not null default '[]'::jsonb,
  input jsonb not null default '{}'::jsonb,
  error text,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);
create index if not exists jobs_store on public.jobs(store_id, created_at desc);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  changes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists chat_messages_store on public.chat_messages(store_id, created_at);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  kind text not null check (kind in ('product','lifestyle','banner','logo','upload')),
  storage_path text,
  url text not null,
  width int not null default 0,
  height int not null default 0,
  prompt text,
  created_at timestamptz not null default now()
);
create index if not exists assets_store on public.assets(store_id, created_at desc);

create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  title text not null,
  rationale text not null,
  area text not null,
  expected_impact text not null check (expected_impact in ('low','medium','high')),
  status text not null default 'proposed' check (status in ('proposed','applied','dismissed')),
  instruction text not null default '', -- demande à rejouer dans l'éditeur IA si appliquée
  created_at timestamptz not null default now()
);

create table if not exists public.insights (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  summary text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.metrics_daily (
  store_id uuid not null references public.stores(id) on delete cascade,
  date date not null,
  sessions int not null default 0,
  orders int not null default 0,
  revenue_cents bigint not null default 0,
  primary key (store_id, date)
);

create table if not exists public.usage (
  user_id uuid not null references public.users(id) on delete cascade,
  period text not null, -- AAAA-MM
  conversations int not null default 0,
  images int not null default 0,
  primary key (user_id, period)
);

create table if not exists public.subscriptions (
  user_id uuid primary key references public.users(id) on delete cascade,
  stripe_subscription_id text unique,
  plan text not null default 'free',
  status text not null default 'active',
  interval text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.affiliates (
  user_id uuid primary key references public.users(id) on delete cascade,
  code text not null unique,
  commission_rate numeric not null default 0.3,
  payout_email text,
  created_at timestamptz not null default now()
);

create table if not exists public.affiliate_events (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  kind text not null check (kind in ('click','signup','payment')),
  amount_cents bigint not null default 0,
  referred_user_id uuid,
  external_id text unique, -- id de facture Stripe pour éviter les doublons
  created_at timestamptz not null default now()
);
create index if not exists affiliate_events_code on public.affiliate_events(code);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null, email text not null, topic text not null, message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.newsletter (
  email text primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.webhook_events (
  id text primary key, -- "<source>:<id externe>"
  created_at timestamptz not null default now()
);

create table if not exists public.rate_limits (
  key text primary key,
  window_start timestamptz not null,
  count int not null
);

-- Compteur de débit atomique : renvoie true si la requête est autorisée.
create or replace function public.hit_rate_limit(p_key text, p_window_seconds int, p_max int)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_count int;
begin
  insert into rate_limits(key, window_start, count) values (p_key, now(), 1)
  on conflict (key) do update set
    count = case when rate_limits.window_start < now() - make_interval(secs => p_window_seconds) then 1 else rate_limits.count + 1 end,
    window_start = case when rate_limits.window_start < now() - make_interval(secs => p_window_seconds) then now() else rate_limits.window_start end
  returning count into v_count;
  return v_count <= p_max;
end $$;

-- Incrément atomique des quotas du mois.
create or replace function public.increment_usage(p_user uuid, p_period text, p_field text, p_by int default 1)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into usage(user_id, period) values (p_user, p_period) on conflict do nothing;
  if p_field = 'conversations' then update usage set conversations = conversations + p_by where user_id = p_user and period = p_period;
  elsif p_field = 'images' then update usage set images = images + p_by where user_id = p_user and period = p_period;
  end if;
end $$;

-- RLS activée partout, sans politique : seul le serveur (service_role) y accède.
do $$ declare t text; begin
  foreach t in array array['users','shop_connections','stores','store_versions','jobs','chat_messages','assets','recommendations','insights','metrics_daily','usage','subscriptions','affiliates','affiliate_events','contact_messages','newsletter','webhook_events','rate_limits']
  loop execute format('alter table public.%I enable row level security', t); end loop;
end $$;

revoke execute on function public.hit_rate_limit(text, int, int) from public, anon, authenticated;
revoke execute on function public.increment_usage(uuid, text, text, int) from public, anon, authenticated;

-- Stockage des images (lecture publique, écriture par le serveur uniquement).
insert into storage.buckets (id, name, public) values ('assets', 'assets', true) on conflict (id) do nothing;
