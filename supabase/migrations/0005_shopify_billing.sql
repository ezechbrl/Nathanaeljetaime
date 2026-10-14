-- Paiement par Shopify : on mémorise la boutique qui porte l'abonnement.
alter table public.subscriptions add column if not exists shop_domain text;
create index if not exists subscriptions_shop on public.subscriptions(shop_domain);
