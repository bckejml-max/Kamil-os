-- OS746: make the private-cloud security contract reproducible.
-- Main state is owner-scoped; legacy singleton data hubs remain read-only
-- to authenticated users until their schema is migrated to per-user rows.

do $$
begin
  if to_regclass('public.kamil_os_state') is not null then
    execute 'alter table public.kamil_os_state enable row level security';
    execute 'revoke all on table public.kamil_os_state from anon';
    execute 'grant select, insert, update, delete on table public.kamil_os_state to authenticated';
    execute 'drop policy if exists kamil_os_state_owner_select on public.kamil_os_state';
    execute 'drop policy if exists kamil_os_state_owner_insert on public.kamil_os_state';
    execute 'drop policy if exists kamil_os_state_owner_update on public.kamil_os_state';
    execute 'drop policy if exists kamil_os_state_owner_delete on public.kamil_os_state';
    execute 'create policy kamil_os_state_owner_select on public.kamil_os_state for select to authenticated using (auth.uid() = user_id)';
    execute 'create policy kamil_os_state_owner_insert on public.kamil_os_state for insert to authenticated with check (auth.uid() = user_id)';
    execute 'create policy kamil_os_state_owner_update on public.kamil_os_state for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)';
    execute 'create policy kamil_os_state_owner_delete on public.kamil_os_state for delete to authenticated using (auth.uid() = user_id)';
  end if;

  if to_regclass('public.kamil_calendar_cache') is not null then
    execute 'alter table public.kamil_calendar_cache enable row level security';
    execute 'revoke all on table public.kamil_calendar_cache from anon';
    execute 'revoke insert, update, delete on table public.kamil_calendar_cache from authenticated';
    execute 'grant select on table public.kamil_calendar_cache to authenticated';
    execute 'drop policy if exists kamil_calendar_authenticated_read on public.kamil_calendar_cache';
    execute 'create policy kamil_calendar_authenticated_read on public.kamil_calendar_cache for select to authenticated using (auth.uid() is not null)';
  end if;

  if to_regclass('public.kamil_xtb_data') is not null then
    execute 'alter table public.kamil_xtb_data enable row level security';
    execute 'revoke all on table public.kamil_xtb_data from anon';
    execute 'revoke insert, update, delete on table public.kamil_xtb_data from authenticated';
    execute 'grant select on table public.kamil_xtb_data to authenticated';
    execute 'drop policy if exists kamil_xtb_authenticated_read on public.kamil_xtb_data';
    execute 'create policy kamil_xtb_authenticated_read on public.kamil_xtb_data for select to authenticated using (auth.uid() is not null)';
  end if;
end
$$;
