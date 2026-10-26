-- OS747: isolate legacy calendar/XTB singleton hubs by owner when ownership is unambiguous.
-- Existing legacy rows are assigned only when kamil_os_state contains exactly one distinct owner.
-- With multiple/unknown owners, legacy rows remain inaccessible rather than leaking across accounts.

do $$
declare
  owner_count integer := 0;
  sole_owner uuid := null;
begin
  if to_regclass('public.kamil_os_state') is not null then
    select count(*), max(user_id::text)::uuid
      into owner_count, sole_owner
      from (select distinct user_id from public.kamil_os_state where user_id is not null) owners;
  end if;

  if to_regclass('public.kamil_calendar_cache') is not null then
    execute 'alter table public.kamil_calendar_cache add column if not exists user_id uuid';
    if owner_count = 1 and sole_owner is not null then
      execute format('update public.kamil_calendar_cache set user_id = %L::uuid where user_id is null', sole_owner);
    end if;
    execute 'alter table public.kamil_calendar_cache enable row level security';
    execute 'revoke all on table public.kamil_calendar_cache from anon';
    execute 'revoke insert, update, delete on table public.kamil_calendar_cache from authenticated';
    execute 'grant select on table public.kamil_calendar_cache to authenticated';
    execute 'drop policy if exists kamil_calendar_authenticated_read on public.kamil_calendar_cache';
    execute 'drop policy if exists kamil_calendar_owner_select on public.kamil_calendar_cache';
    execute 'create policy kamil_calendar_owner_select on public.kamil_calendar_cache for select to authenticated using (auth.uid() = user_id)';
    execute 'create index if not exists kamil_calendar_cache_user_idx on public.kamil_calendar_cache (user_id, id)';
  end if;

  if to_regclass('public.kamil_xtb_data') is not null then
    execute 'alter table public.kamil_xtb_data add column if not exists user_id uuid';
    if owner_count = 1 and sole_owner is not null then
      execute format('update public.kamil_xtb_data set user_id = %L::uuid where user_id is null', sole_owner);
    end if;
    execute 'alter table public.kamil_xtb_data enable row level security';
    execute 'revoke all on table public.kamil_xtb_data from anon';
    execute 'revoke insert, update, delete on table public.kamil_xtb_data from authenticated';
    execute 'grant select on table public.kamil_xtb_data to authenticated';
    execute 'drop policy if exists kamil_xtb_authenticated_read on public.kamil_xtb_data';
    execute 'drop policy if exists kamil_xtb_owner_select on public.kamil_xtb_data';
    execute 'create policy kamil_xtb_owner_select on public.kamil_xtb_data for select to authenticated using (auth.uid() = user_id)';
    execute 'create index if not exists kamil_xtb_data_user_idx on public.kamil_xtb_data (user_id, id)';
  end if;
end
$$;
