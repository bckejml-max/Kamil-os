-- OS1215: durable owner-scoped Gmail ticket event state and atomic inventory/checkpoint commit.

create table if not exists public.ticket_gmail_state1215 (
  user_id uuid not null references auth.users(id) on delete cascade,
  ticket_id text not null,
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (user_id, ticket_id)
);

create table if not exists public.ticket_gmail_sync1215 (
  user_id uuid primary key references auth.users(id) on delete cascade,
  checkpoint jsonb not null default '{}'::jsonb check (jsonb_typeof(checkpoint) = 'object'),
  updated_at timestamptz not null default now()
);

alter table public.ticket_gmail_state1215 enable row level security;
alter table public.ticket_gmail_sync1215 enable row level security;
grant select, insert, update, delete on table public.ticket_gmail_state1215 to authenticated;
grant select, insert, update, delete on table public.ticket_gmail_sync1215 to authenticated;
revoke all on table public.ticket_gmail_state1215 from anon;
revoke all on table public.ticket_gmail_sync1215 from anon;

create policy "ticket_gmail_state1215_select_own" on public.ticket_gmail_state1215 for select to authenticated using ((select auth.uid()) = user_id);
create policy "ticket_gmail_state1215_insert_own" on public.ticket_gmail_state1215 for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "ticket_gmail_state1215_update_own" on public.ticket_gmail_state1215 for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "ticket_gmail_state1215_delete_own" on public.ticket_gmail_state1215 for delete to authenticated using ((select auth.uid()) = user_id);
create policy "ticket_gmail_sync1215_select_own" on public.ticket_gmail_sync1215 for select to authenticated using ((select auth.uid()) = user_id);
create policy "ticket_gmail_sync1215_insert_own" on public.ticket_gmail_sync1215 for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "ticket_gmail_sync1215_update_own" on public.ticket_gmail_sync1215 for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "ticket_gmail_sync1215_delete_own" on public.ticket_gmail_sync1215 for delete to authenticated using ((select auth.uid()) = user_id);

create or replace function public.commit_ticket_gmail_batch1215(p_items jsonb, p_checkpoint jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  item jsonb;
  patch jsonb;
  tid text;
  changed integer := 0;
begin
  if uid is null then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
  if jsonb_typeof(coalesce(p_items,'[]'::jsonb)) <> 'array' then raise exception 'TICKET_GMAIL_ITEMS_ARRAY_REQUIRED' using errcode='22023'; end if;
  if jsonb_typeof(coalesce(p_checkpoint,'{}'::jsonb)) <> 'object' then raise exception 'TICKET_GMAIL_CHECKPOINT_OBJECT_REQUIRED' using errcode='22023'; end if;

  for item in select value from jsonb_array_elements(coalesce(p_items,'[]'::jsonb)) loop
    tid := nullif(btrim(item->>'ticketId'),'');
    if tid is null then raise exception 'TICKET_ID_REQUIRED' using errcode='22023'; end if;
    if jsonb_typeof(coalesce(item->'payload','{}'::jsonb)) <> 'object' then raise exception 'TICKET_PAYLOAD_OBJECT_REQUIRED' using errcode='22023'; end if;
    patch := coalesce(item->'patch','{}'::jsonb);
    if jsonb_typeof(patch) <> 'object' then raise exception 'TICKET_PATCH_OBJECT_REQUIRED' using errcode='22023'; end if;

    update public.ticket_inventory
       set market_status = coalesce(nullif(patch->>'market_status',''), market_status),
           delivered_at = case when patch ? 'delivered_at' then nullif(patch->>'delivered_at','')::timestamptz else delivered_at end,
           sell_total_czk = case when patch ? 'sell_total_czk' then (patch->>'sell_total_czk')::numeric else sell_total_czk end,
           sell_each_czk = case when patch ? 'sell_each_czk' then (patch->>'sell_each_czk')::numeric else sell_each_czk end,
           marketplace_fee_czk = case when patch ? 'marketplace_fee_czk' then (patch->>'marketplace_fee_czk')::numeric else marketplace_fee_czk end,
           sale_source = coalesce(nullif(patch->>'sale_source',''), sale_source),
           updated_at = now()
     where user_id = uid and id = tid;
    if not found then raise exception 'TICKET_NOT_FOUND:%', tid using errcode='P0002'; end if;

    insert into public.ticket_gmail_state1215(user_id,ticket_id,payload,updated_at)
    values(uid,tid,item->'payload',now())
    on conflict(user_id,ticket_id) do update set payload=excluded.payload,updated_at=excluded.updated_at;
    changed := changed + 1;
  end loop;

  insert into public.ticket_gmail_sync1215(user_id,checkpoint,updated_at)
  values(uid,coalesce(p_checkpoint,'{}'::jsonb),now())
  on conflict(user_id) do update set checkpoint=excluded.checkpoint,updated_at=excluded.updated_at;

  return jsonb_build_object('ok',true,'count',changed,'checkpoint',coalesce(p_checkpoint,'{}'::jsonb));
end;
$$;

grant execute on function public.commit_ticket_gmail_batch1215(jsonb,jsonb) to authenticated;
revoke execute on function public.commit_ticket_gmail_batch1215(jsonb,jsonb) from anon;

create index if not exists ticket_gmail_state1215_user_updated_idx on public.ticket_gmail_state1215(user_id,updated_at desc);
