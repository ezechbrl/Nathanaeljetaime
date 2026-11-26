-- Ventes : savoir si la personne a ouvert le paiement au mois ou à l'année.
alter table revenue_events add column if not exists billing_interval text;
