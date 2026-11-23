-- Paiement unique « Ma boutique » (49 €, 39 € pendant 24 h après l'inscription) : une boutique complète
-- et 7 jours de retouches avec l'IA, sans abonnement.
alter table public.users add column if not exists single_until timestamptz;
alter table public.users add column if not exists single_store_id uuid references public.stores(id) on delete set null;
