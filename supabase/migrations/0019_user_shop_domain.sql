-- Boutique Shopify du client (ma-boutique.myshopify.com), saisie à l'inscription.
-- Sert à ouvrir directement les bonnes pages de son admin Shopify pendant la mise en ligne.
alter table public.users add column if not exists shop_domain text;
