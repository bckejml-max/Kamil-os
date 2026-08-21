-- Kamil OS 32.4 — Recovery Shield permission hardening
-- Production-applied: authenticated client may only SELECT and INSERT own snapshots.

alter table public.kamil_os_snapshots enable row level security;

drop policy if exists kamil_snapshots_delete_own on public.kamil_os_snapshots;

revoke all privileges on table public.kamil_os_snapshots from anon;
revoke all privileges on table public.kamil_os_snapshots from authenticated;
grant select, insert on table public.kamil_os_snapshots to authenticated;

-- Existing policies expected:
-- kamil_snapshots_select_own: USING ((select auth.uid()) = user_id)
-- kamil_snapshots_insert_own: WITH CHECK ((select auth.uid()) = user_id)
-- No authenticated UPDATE/DELETE/TRUNCATE privilege.
