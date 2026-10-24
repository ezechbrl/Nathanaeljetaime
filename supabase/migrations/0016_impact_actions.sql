-- Parrainages Shopify (programme d'affiliation Shopify via Impact) : essais, essais payants, commissions.
create table if not exists public.impact_actions (
  id text primary key,
  tracker text,
  state text,
  payout_cents integer not null default 0,
  currency text,
  event_at timestamptz,
  updated_at timestamptz not null default now()
);
create index if not exists impact_actions_event on public.impact_actions(event_at);
alter table public.impact_actions enable row level security;
