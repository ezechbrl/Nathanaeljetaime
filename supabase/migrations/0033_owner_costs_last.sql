-- Dernier paiement vu (mis à jour par le topo à partir des reçus reçus par e-mail).
alter table owner_costs add column if not exists last_cents integer, add column if not exists last_currency text, add column if not exists last_at timestamptz;
