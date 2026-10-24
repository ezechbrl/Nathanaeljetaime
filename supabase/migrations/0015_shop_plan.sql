-- Forfait Shopify de la boutique connectée (Basic, Shopify, Advanced, essai, boutique de développement…).
alter table public.shop_connections add column if not exists shopify_plan text;
