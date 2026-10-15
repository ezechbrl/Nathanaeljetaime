-- Offre Découverte : une seule boutique offerte dans la vie du compte (même si elle est supprimée ensuite).
alter table public.users add column if not exists free_store_used boolean not null default false;
-- Les comptes qui ont déjà une boutique générée ont utilisé leur boutique offerte.
update public.users u set free_store_used = true
where exists (select 1 from public.stores s where s.user_id = u.id and s.status in ('ready', 'published'));
