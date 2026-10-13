-- Budget d'IA par client : 5 € par semaine glissante, puis blocage de 24 h.
-- À coller dans Supabase → SQL Editor → Run (après 0001_init.sql).

alter table public.users
  add column if not exists ai_spent_micros bigint not null default 0,       -- dépense en millionièmes d'euro
  add column if not exists ai_window_start timestamptz not null default now(),
  add column if not exists ai_blocked_until timestamptz;

-- Vérifie si le client peut utiliser l'IA. Renvoie la date de fin de blocage s'il est bloqué, sinon null.
create or replace function public.ai_budget_check(p_user uuid, p_budget bigint)
returns timestamptz language plpgsql security definer set search_path = public as $$
declare u record;
begin
  select ai_spent_micros, ai_window_start, ai_blocked_until into u from users where id = p_user for update;
  if not found then return null; end if;
  if u.ai_blocked_until is not null and u.ai_blocked_until > now() then
    return u.ai_blocked_until;
  end if;
  -- Fin du blocage, ou semaine écoulée : le compteur repart de zéro.
  if u.ai_blocked_until is not null or u.ai_window_start < now() - interval '7 days' then
    update users set ai_spent_micros = 0, ai_window_start = now(), ai_blocked_until = null where id = p_user;
    return null;
  end if;
  if u.ai_spent_micros >= p_budget then
    update users set ai_blocked_until = now() + interval '24 hours', ai_spent_micros = 0 where id = p_user;
    return now() + interval '24 hours';
  end if;
  return null;
end $$;

-- Ajoute le coût d'un appel. Déclenche le blocage de 24 h si le budget est dépassé.
create or replace function public.ai_budget_add(p_user uuid, p_micros bigint, p_budget bigint)
returns timestamptz language plpgsql security definer set search_path = public as $$
declare v_spent bigint;
begin
  update users set ai_spent_micros = ai_spent_micros + p_micros where id = p_user returning ai_spent_micros into v_spent;
  if v_spent >= p_budget then
    update users set ai_blocked_until = now() + interval '24 hours', ai_spent_micros = 0 where id = p_user;
    return now() + interval '24 hours';
  end if;
  return null;
end $$;

revoke execute on function public.ai_budget_check(uuid, bigint) from public, anon, authenticated;
revoke execute on function public.ai_budget_add(uuid, bigint, bigint) from public, anon, authenticated;
