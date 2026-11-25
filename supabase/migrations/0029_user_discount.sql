-- Réduction personnelle (ex. −15 % pour ceux qui ont ouvert la page de paiement sans payer), valable jusqu'à discount_until.
alter table public.users add column if not exists discount_percent integer;
alter table public.users add column if not exists discount_until timestamptz;
