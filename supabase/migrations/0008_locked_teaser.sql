-- Boutique floue gratuite : aperçu (« teaser ») généré à bas coût, débloqué après abonnement.
alter table public.stores drop constraint stores_status_check;
alter table public.stores add constraint stores_status_check check (status in ('generating','locked','ready','publishing','published','failed'));
alter table public.stores add column if not exists teaser jsonb;
