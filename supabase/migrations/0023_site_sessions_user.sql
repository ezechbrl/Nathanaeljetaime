-- Visite reliée au compte dès que le visiteur est connecté : d'où vient chaque client (Ventes).
alter table public.site_sessions add column if not exists user_id uuid references public.users(id) on delete set null;
create index if not exists site_sessions_user_idx on public.site_sessions (user_id);
-- Identifiant aléatoire du navigateur (gardé dans le navigateur) : relie aussi les visites d'avant l'inscription.
alter table public.site_sessions add column if not exists visitor text;
create index if not exists site_sessions_visitor_idx on public.site_sessions (visitor);
