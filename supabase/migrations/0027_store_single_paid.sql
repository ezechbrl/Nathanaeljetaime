-- Chaque boutique achetée en « Ma boutique » est marquée : un 2e achat ne fait pas perdre la 1re.
alter table public.stores add column if not exists single_paid_at timestamptz;
update public.stores s set single_paid_at = now()
  from public.users u where u.single_store_id = s.id and s.single_paid_at is null;
