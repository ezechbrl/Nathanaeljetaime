-- Inscrits de la liste d'attente : prix réservé à vie (voir WAITLIST_PRICES dans lib/content/pricing.ts).
alter table public.users add column if not exists waitlist_member boolean not null default false;
