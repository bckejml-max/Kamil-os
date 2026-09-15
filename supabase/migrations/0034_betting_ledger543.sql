-- OS1181-1186: authenticated, owner-scoped betting ledger.
-- Apply this migration in Supabase before expecting remote writes to become available.

create table if not exists public.betting_ledger543_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  bankroll_czk numeric not null default 0 check (bankroll_czk >= 0),
  unit_czk numeric not null default 0 check (unit_czk >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.betting_ledger543_bets (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  status text not null default 'OPEN' check (status in ('OPEN','WIN','LOSS','VOID')),
  stake_czk numeric not null default 0 check (stake_czk >= 0),
  odds numeric check (odds is null or odds > 1),
  pnl_czk numeric,
  placed_at timestamptz,
  settled_at timestamptz,
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.betting_ledger543_settings enable row level security;
alter table public.betting_ledger543_bets enable row level security;

grant select, insert, update, delete on table public.betting_ledger543_settings to authenticated;
grant select, insert, update, delete on table public.betting_ledger543_bets to authenticated;
revoke all on table public.betting_ledger543_settings from anon;
revoke all on table public.betting_ledger543_bets from anon;

create policy "betting_ledger543_settings_select_own" on public.betting_ledger543_settings for select to authenticated using ((select auth.uid()) = user_id);
create policy "betting_ledger543_settings_insert_own" on public.betting_ledger543_settings for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "betting_ledger543_settings_update_own" on public.betting_ledger543_settings for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "betting_ledger543_settings_delete_own" on public.betting_ledger543_settings for delete to authenticated using ((select auth.uid()) = user_id);

create policy "betting_ledger543_bets_select_own" on public.betting_ledger543_bets for select to authenticated using ((select auth.uid()) = user_id);
create policy "betting_ledger543_bets_insert_own" on public.betting_ledger543_bets for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "betting_ledger543_bets_update_own" on public.betting_ledger543_bets for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "betting_ledger543_bets_delete_own" on public.betting_ledger543_bets for delete to authenticated using ((select auth.uid()) = user_id);

create or replace function public.betting_ledger543_guard_settled()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.status in ('WIN','LOSS','VOID') then
    raise exception 'BETTING_LEDGER_SETTLED_IMMUTABLE' using errcode = '23514';
  end if;
  if new.status in ('WIN','LOSS','VOID') then
    if new.settled_at is null then
      raise exception 'BETTING_LEDGER_SETTLED_AT_REQUIRED' using errcode = '23514';
    end if;
    if new.status = 'WIN' and new.pnl_czk is distinct from round(new.stake_czk * (coalesce(new.odds,0) - 1), 2) then
      raise exception 'BETTING_LEDGER_WIN_PNL_INVALID' using errcode = '23514';
    elsif new.status = 'LOSS' and new.pnl_czk is distinct from round(-new.stake_czk, 2) then
      raise exception 'BETTING_LEDGER_LOSS_PNL_INVALID' using errcode = '23514';
    elsif new.status = 'VOID' and new.pnl_czk is distinct from 0 then
      raise exception 'BETTING_LEDGER_VOID_PNL_INVALID' using errcode = '23514';
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists betting_ledger543_settled_guard on public.betting_ledger543_bets;
create trigger betting_ledger543_settled_guard
before update on public.betting_ledger543_bets
for each row execute function public.betting_ledger543_guard_settled();

create index if not exists betting_ledger543_bets_user_status_idx on public.betting_ledger543_bets (user_id, status, placed_at desc);
