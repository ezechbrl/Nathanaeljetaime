-- Installation complète de la base Vitrio : les 5 migrations, dans l'ordre.
-- À coller en une fois dans Supabase → SQL Editor → New query → Run.

-- ===== 0001_init.sql =====
-- Schéma Vitrio. À coller dans Supabase → SQL Editor → New query → Run (une seule fois).
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

-- ===== 0002_ai_budget.sql =====
-- Budget d'IA par client : 5 € par semaine glissante, puis blocage de 24 h.
-- À coller dans Supabase → SQL Editor → Run (après 0001_init.sql).

alter table public.users
  add column if not exists ai_spent_micros bigint not null default 0,       -- dépense en millionièmes d'euro
  add column if not exists ai_window_start timestamptz not null default now(),
  add column if not exists ai_blocked_until timestamptz;

-- Vérifie si le client peut utiliser l'IA. Renvoie la date de fin de blocage s'il est bloqué, sinon null.
create or replace function public.ai_budget_check(p_user uuid, p_budget bigint)
returns timestamptz language plpgsql security definer set search_path = public as $$
declare u record;
begin
  select ai_spent_micros, ai_window_start, ai_blocked_until into u from users where id = p_user for update;
  if not found then return null; end if;
  if u.ai_blocked_until is not null and u.ai_blocked_until > now() then
    return u.ai_blocked_until;
  end if;
  -- Fin du blocage, ou semaine écoulée : le compteur repart de zéro.
  if u.ai_blocked_until is not null or u.ai_window_start < now() - interval '7 days' then
    update users set ai_spent_micros = 0, ai_window_start = now(), ai_blocked_until = null where id = p_user;
    return null;
  end if;
  if u.ai_spent_micros >= p_budget then
    update users set ai_blocked_until = now() + interval '24 hours', ai_spent_micros = 0 where id = p_user;
    return now() + interval '24 hours';
  end if;
  return null;
end $$;

-- Ajoute le coût d'un appel. Déclenche le blocage de 24 h si le budget est dépassé.
create or replace function public.ai_budget_add(p_user uuid, p_micros bigint, p_budget bigint)
returns timestamptz language plpgsql security definer set search_path = public as $$
declare v_spent bigint;
begin
  update users set ai_spent_micros = ai_spent_micros + p_micros where id = p_user returning ai_spent_micros into v_spent;
  if v_spent >= p_budget then
    update users set ai_blocked_until = now() + interval '24 hours', ai_spent_micros = 0 where id = p_user;
    return now() + interval '24 hours';
  end if;
  return null;
end $$;

revoke execute on function public.ai_budget_check(uuid, bigint) from public, anon, authenticated;
revoke execute on function public.ai_budget_add(uuid, bigint, bigint) from public, anon, authenticated;

-- ===== 0003_ai_session_limit.sql =====
-- Deux limites d'IA par client, comme Claude :
--   1. une recharge toutes les 5 h : 1 € par tranche de 5 h (la tranche démarre à la première utilisation) ;
--   2. 3 € par semaine glissante (montant réglé dans lib/server/budget.ts), puis blocage de 24 h.
-- À coller dans Supabase → SQL Editor → Run (après 0001 et 0002).

alter table public.users
  add column if not exists ai_session_start timestamptz,
  add column if not exists ai_session_spent_micros bigint not null default 0;

drop function if exists public.ai_budget_check(uuid, bigint);
drop function if exists public.ai_budget_add(uuid, bigint, bigint);

-- Renvoie (bloqué_jusqu'à, raison) : raison = 'week' ou 'session' ; (null, null) si l'IA est disponible.
create or replace function public.ai_budget_check(p_user uuid, p_week_budget bigint, p_session_budget bigint, p_session_seconds int)
returns table (blocked_until timestamptz, reason text) language plpgsql security definer set search_path = public as $$
declare u record; v_session interval := make_interval(secs => p_session_seconds);
begin
  select * into u from users where id = p_user for update;
  if not found then return query select null::timestamptz, null::text; return; end if;

  -- Limite de la semaine.
  if u.ai_blocked_until is not null and u.ai_blocked_until > now() then
    return query select u.ai_blocked_until, 'week'::text; return;
  end if;
  if u.ai_blocked_until is not null or u.ai_window_start < now() - interval '7 days' then
    update users set ai_spent_micros = 0, ai_window_start = now(), ai_blocked_until = null where id = p_user;
  elsif u.ai_spent_micros >= p_week_budget then
    update users set ai_blocked_until = now() + interval '24 hours', ai_spent_micros = 0, ai_session_start = null, ai_session_spent_micros = 0 where id = p_user;
    return query select now() + interval '24 hours', 'week'::text; return;
  end if;

  -- Recharge toutes les 5 h.
  if u.ai_session_start is not null and u.ai_session_start + v_session <= now() then
    update users set ai_session_start = null, ai_session_spent_micros = 0 where id = p_user;
  elsif u.ai_session_start is not null and u.ai_session_spent_micros >= p_session_budget then
    return query select u.ai_session_start + v_session, 'session'::text; return;
  end if;

  return query select null::timestamptz, null::text;
end $$;

-- Ajoute le coût d'un appel aux deux compteurs. Déclenche le blocage de 24 h si la limite de la semaine est dépassée.
create or replace function public.ai_budget_add(p_user uuid, p_micros bigint, p_week_budget bigint)
returns void language plpgsql security definer set search_path = public as $$
declare v_spent bigint;
begin
  update users set
    ai_spent_micros = ai_spent_micros + p_micros,
    ai_session_start = coalesce(ai_session_start, now()),
    ai_session_spent_micros = ai_session_spent_micros + p_micros
  where id = p_user returning ai_spent_micros into v_spent;
  if v_spent >= p_week_budget then
    update users set ai_blocked_until = now() + interval '24 hours', ai_spent_micros = 0, ai_session_start = null, ai_session_spent_micros = 0 where id = p_user;
  end if;
end $$;

revoke execute on function public.ai_budget_check(uuid, bigint, bigint, int) from public, anon, authenticated;
revoke execute on function public.ai_budget_add(uuid, bigint, bigint) from public, anon, authenticated;

-- ===== 0004_waitlist.sql =====
-- Liste d'attente avant l'ouverture publique.
create table if not exists public.waitlist (
  email text primary key,
  brief text,
  ref text,
  created_at timestamptz not null default now()
);
alter table public.waitlist enable row level security;

-- ===== 0005_shopify_billing.sql =====
-- Paiement par Shopify : on mémorise la boutique qui porte l'abonnement.
alter table public.subscriptions add column if not exists shop_domain text;
create index if not exists subscriptions_shop on public.subscriptions(shop_domain);

-- ===== 0006_free_store_once.sql =====
-- Offre Découverte : une seule boutique offerte dans la vie du compte (même si elle est supprimée ensuite).
alter table public.users add column if not exists free_store_used boolean not null default false;
-- Les comptes qui ont déjà une boutique générée ont utilisé leur boutique offerte.
update public.users u set free_store_used = true
where exists (select 1 from public.stores s where s.user_id = u.id and s.status in ('ready', 'published'));
