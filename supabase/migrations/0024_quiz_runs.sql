-- Suivi du quiz (Ventes) : jusqu'à quelle question chaque visiteur est allé, et s'il l'a fini.
create table if not exists public.quiz_runs (
  id text primary key,
  visitor text,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  max_index int not null default 0,
  last_step text,
  total int,
  has_idea boolean,
  finished boolean not null default false
);
create index if not exists quiz_runs_started_idx on public.quiz_runs (started_at desc);
alter table public.quiz_runs enable row level security;
