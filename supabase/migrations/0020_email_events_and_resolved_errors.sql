-- Erreurs déjà corrigées : marquées « resolved » pour ne plus s'afficher dans Ventes.
alter table public.app_errors add column if not exists resolved boolean not null default false;
-- Erreur Stripe du 11/11/2026 (client créé en mode test) : corrigée le jour même (commit 8b4d18c).
update public.app_errors set resolved = true where message like 'No such customer:%a live mode key was used%';

-- Mails envoyés aux clients (rappels d'offre, lancement) avec leur identifiant Resend,
-- pour savoir s'ils ont été délivrés, ouverts ou cliqués.
create table if not exists public.email_events (
  id text primary key,              -- identifiant du mail chez Resend
  user_id uuid references public.users(id) on delete cascade,
  email text not null,
  kind text not null,               -- offer-reminder, offer-last, launch…
  sent_at timestamptz not null default now(),
  last_event text,                  -- sent, delivered, opened, clicked, bounced…
  checked_at timestamptz
);
create index if not exists email_events_user_idx on public.email_events (user_id);
alter table public.email_events enable row level security;
