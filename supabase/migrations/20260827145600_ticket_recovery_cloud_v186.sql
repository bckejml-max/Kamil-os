create table if not exists public.ticket_recovery_snapshots (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  version integer not null default 186,
  created_at timestamptz not null,
  file_name text not null default '',
  kind text not null default 'import',
  note text not null default '',
  stats jsonb not null default '{}'::jsonb,
  delta jsonb not null default '{}'::jsonb,
  rows jsonb not null default '[]'::jsonb,
  synced_at timestamptz not null default now(),
  primary key (user_id, id),
  constraint ticket_recovery_rows_array check (jsonb_typeof(rows) = 'array')
);

alter table public.ticket_recovery_snapshots enable row level security;

grant select, insert, update, delete on table public.ticket_recovery_snapshots to authenticated;
revoke all on table public.ticket_recovery_snapshots from anon;

create policy "ticket_recovery_select_own"
on public.ticket_recovery_snapshots
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "ticket_recovery_insert_own"
on public.ticket_recovery_snapshots
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "ticket_recovery_update_own"
on public.ticket_recovery_snapshots
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "ticket_recovery_delete_own"
on public.ticket_recovery_snapshots
for delete
to authenticated
using ((select auth.uid()) = user_id);

create index if not exists ticket_recovery_user_created_idx
on public.ticket_recovery_snapshots (user_id, created_at desc);
