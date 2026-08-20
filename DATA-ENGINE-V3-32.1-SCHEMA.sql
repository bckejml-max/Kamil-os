-- Kamil OS 32.1 Data Engine v3 — audit copy of production migration
create table if not exists public.kamil_os_history (
  user_id uuid not null references auth.users(id) on delete cascade,
  record_key text not null,
  bucket text not null check (bucket in ('decision','networth','ticket','trade','import')),
  happened_at timestamptz null,
  payload jsonb not null default '{}'::jsonb,
  source_version text null,
  updated_at timestamptz not null default now(),
  primary key (user_id, record_key)
);
alter table public.kamil_os_history enable row level security;
create policy kamil_os_history_select_own on public.kamil_os_history for select to authenticated using ((select auth.uid()) = user_id);
create policy kamil_os_history_insert_own on public.kamil_os_history for insert to authenticated with check ((select auth.uid()) = user_id);
create policy kamil_os_history_update_own on public.kamil_os_history for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
revoke all privileges on table public.kamil_os_history from anon;
revoke all privileges on table public.kamil_os_history from authenticated;
grant select, insert, update on table public.kamil_os_history to authenticated;
create index if not exists kamil_os_history_user_bucket_at_idx on public.kamil_os_history (user_id, bucket, happened_at desc nulls last);
