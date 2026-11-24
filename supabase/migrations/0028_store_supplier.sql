-- Fournisseur relié à la boutique (lien du produit chez AliExpress, Alibaba, CJ…).
alter table public.stores add column if not exists supplier_url text;
