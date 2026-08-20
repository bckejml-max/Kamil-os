-- Kamil OS 31.4 Smart Sync shadow schema
-- Applied to Supabase project Appka as migrations:
--   kamil_os_smart_sync_shadow_31_4
--   kamil_os_smart_sync_shadow_grants_31_4
create table if not exists public.kamil_os_changes (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id text not null,
  seq bigint not null,
  domain text not null,
  entity_id text not null,
  op text not null check (op in ('UPSERT','DELETE')),
  payload jsonb,
  client_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (user_id, device_id, seq)
);
alter table public.kamil_os_changes enable row level security;
revoke all privileges on table public.kamil_os_changes from authenticated;
grant select, insert on table public.kamil_os_changes to authenticated;
revoke all privileges on table public.kamil_os_changes from anon;
create policy kamil_os_changes_select_own on public.kamil_os_changes for select to authenticated using ((select auth.uid()) = user_id);
create policy kamil_os_changes_insert_own on public.kamil_os_changes for insert to authenticated with check ((select auth.uid()) = user_id);
create index if not exists kamil_os_changes_user_created_idx on public.kamil_os_changes (user_id, created_at desc);
create index if not exists kamil_os_changes_user_domain_entity_idx on public.kamil_os_changes (user_id, domain, entity_id, created_at desc);
