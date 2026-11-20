-- Réponses au petit questionnaire montré quand un client arrête son abonnement (facultatif).
create table if not exists public.cancel_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  email text,
  plan text,
  reason text,      -- pourquoi il arrête
  wish text,        -- ce qui l'aurait fait rester
  details text,     -- un mot libre (facultatif)
  created_at timestamptz not null default now()
);
create index if not exists cancel_feedback_created_idx on public.cancel_feedback (created_at desc);
alter table public.cancel_feedback enable row level security;
