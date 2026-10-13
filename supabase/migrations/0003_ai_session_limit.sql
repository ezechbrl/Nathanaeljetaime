-- Deux limites d'IA par client, comme Claude :
--   1. une recharge toutes les 5 h : 1 € par tranche de 5 h (la tranche démarre à la première utilisation) ;
--   2. 3 € par semaine glissante (montant réglé dans lib/server/budget.ts), puis blocage de 24 h.
-- À coller dans Supabase → SQL Editor → Run (après 0001 et 0002).

alter table public.users
  add column if not exists ai_session_start timestamptz,
  add column if not exists ai_session_spent_micros bigint not null default 0;

drop function if exists public.ai_budget_check(uuid, bigint);
drop function if exists public.ai_budget_add(uuid, bigint, bigint);

-- Renvoie (bloqué_jusqu'à, raison) : raison = 'week' ou 'session' ; (null, null) si l'IA est disponible.
create or replace function public.ai_budget_check(p_user uuid, p_week_budget bigint, p_session_budget bigint, p_session_seconds int)
returns table (blocked_until timestamptz, reason text) language plpgsql security definer set search_path = public as $$
declare u record; v_session interval := make_interval(secs => p_session_seconds);
begin
  select * into u from users where id = p_user for update;
  if not found then return query select null::timestamptz, null::text; return; end if;

  -- Limite de la semaine.
  if u.ai_blocked_until is not null and u.ai_blocked_until > now() then
    return query select u.ai_blocked_until, 'week'::text; return;
  end if;
  if u.ai_blocked_until is not null or u.ai_window_start < now() - interval '7 days' then
    update users set ai_spent_micros = 0, ai_window_start = now(), ai_blocked_until = null where id = p_user;
  elsif u.ai_spent_micros >= p_week_budget then
    update users set ai_blocked_until = now() + interval '24 hours', ai_spent_micros = 0, ai_session_start = null, ai_session_spent_micros = 0 where id = p_user;
    return query select now() + interval '24 hours', 'week'::text; return;
  end if;

  -- Recharge toutes les 5 h.
  if u.ai_session_start is not null and u.ai_session_start + v_session <= now() then
    update users set ai_session_start = null, ai_session_spent_micros = 0 where id = p_user;
  elsif u.ai_session_start is not null and u.ai_session_spent_micros >= p_session_budget then
    return query select u.ai_session_start + v_session, 'session'::text; return;
  end if;

  return query select null::timestamptz, null::text;
end $$;

-- Ajoute le coût d'un appel aux deux compteurs. Déclenche le blocage de 24 h si la limite de la semaine est dépassée.
create or replace function public.ai_budget_add(p_user uuid, p_micros bigint, p_week_budget bigint)
returns void language plpgsql security definer set search_path = public as $$
declare v_spent bigint;
begin
  update users set
    ai_spent_micros = ai_spent_micros + p_micros,
    ai_session_start = coalesce(ai_session_start, now()),
    ai_session_spent_micros = ai_session_spent_micros + p_micros
  where id = p_user returning ai_spent_micros into v_spent;
  if v_spent >= p_week_budget then
    update users set ai_blocked_until = now() + interval '24 hours', ai_spent_micros = 0, ai_session_start = null, ai_session_spent_micros = 0 where id = p_user;
  end if;
end $$;

revoke execute on function public.ai_budget_check(uuid, bigint, bigint, int) from public, anon, authenticated;
revoke execute on function public.ai_budget_add(uuid, bigint, bigint) from public, anon, authenticated;
