-- Photos des univers et des produits du quiz (générées une fois, côté serveur).
create table if not exists quiz_photos (key text primary key, url text not null, created_at timestamptz not null default now());
alter table quiz_photos enable row level security;
