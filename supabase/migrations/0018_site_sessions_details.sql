-- Audience plus détaillée (toujours anonyme) : d'où vient la visite, appareil, pays, page d'entrée, nombre de pages,
-- et un drapeau pour écarter les robots et les passages venant de Shopify (évaluateurs, aperçus).
alter table public.site_sessions
  add column if not exists source text,
  add column if not exists device text,
  add column if not exists country text,
  add column if not exists entry text,
  add column if not exists pages int not null default 1,
  add column if not exists excluded boolean not null default false;
