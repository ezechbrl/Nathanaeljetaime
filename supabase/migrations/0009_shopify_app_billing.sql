-- Facturation par Shopify (Billing API) : abonnement Shopify, montant réel et dernière période payée.
alter table public.subscriptions add column if not exists shopify_subscription_id text unique;
alter table public.subscriptions add column if not exists amount_cents integer;
alter table public.subscriptions add column if not exists currency text;
