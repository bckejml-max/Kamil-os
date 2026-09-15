-- OS1217: harden Gmail ticket commits against stale clients and tampered payloads.

alter table public.ticket_gmail_state1215
  add column if not exists revision bigint not null default 0 check (revision >= 0);

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
  payload jsonb;
  tid text;
  state_text text;
  market_text text;
  expected_revision bigint;
  current_revision bigint;
  purchased numeric;
  listed numeric;
  sold numeric;
  transferred numeric;
  amount numeric;
  changed integer := 0;
begin
  if uid is null then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
  if jsonb_typeof(coalesce(p_items,'[]'::jsonb)) <> 'array' then raise exception 'TICKET_GMAIL_ITEMS_ARRAY_REQUIRED' using errcode='22023'; end if;
  if jsonb_typeof(coalesce(p_checkpoint,'{}'::jsonb)) <> 'object' then raise exception 'TICKET_GMAIL_CHECKPOINT_OBJECT_REQUIRED' using errcode='22023'; end if;

  -- Serialize Gmail reconciliation for one owner even across tabs/devices.
  perform pg_advisory_xact_lock(hashtext(uid::text));

  for item in select value from jsonb_array_elements(coalesce(p_items,'[]'::jsonb)) loop
    tid := nullif(btrim(item->>'ticketId'),'');
    if tid is null then raise exception 'TICKET_ID_REQUIRED' using errcode='22023'; end if;
    payload := coalesce(item->'payload','{}'::jsonb);
    patch := coalesce(item->'patch','{}'::jsonb);
    if jsonb_typeof(payload) <> 'object' then raise exception 'TICKET_PAYLOAD_OBJECT_REQUIRED' using errcode='22023'; end if;
    if jsonb_typeof(patch) <> 'object' then raise exception 'TICKET_PATCH_OBJECT_REQUIRED' using errcode='22023'; end if;
    if nullif(payload->>'id','') is distinct from tid then raise exception 'TICKET_PAYLOAD_ID_MISMATCH' using errcode='22023'; end if;
    if jsonb_typeof(coalesce(payload->'events','[]'::jsonb)) <> 'array' then raise exception 'TICKET_EVENTS_ARRAY_REQUIRED' using errcode='22023'; end if;

    state_text := lower(coalesce(payload->>'state',''));
    if state_text not in ('listed','sold','transfer_required','transferred','paid') then
      raise exception 'TICKET_STATE_INVALID:%', state_text using errcode='22023';
    end if;

    purchased := coalesce((payload->>'purchased')::numeric,0);
    listed := coalesce((payload->>'listed')::numeric,0);
    sold := coalesce((payload->>'sold')::numeric,0);
    transferred := coalesce((payload->>'transferred')::numeric,0);
    if purchased < 0 or listed < 0 or sold < 0 or transferred < 0
       or listed > purchased or sold > purchased or sold > listed or transferred > sold then
      raise exception 'TICKET_QUANTITY_INVARIANT' using errcode='23514';
    end if;

    market_text := nullif(patch->>'market_status','');
    if market_text is not null and market_text not in ('SOLD_UNDELIVERED','SOLD_WAITING_PAYMENT','PAYOUT_RECEIVED') then
      raise exception 'TICKET_MARKET_STATUS_INVALID:%', market_text using errcode='22023';
    end if;
    if patch ? 'sell_total_czk' then amount := (patch->>'sell_total_czk')::numeric; if amount < 0 then raise exception 'TICKET_SELL_TOTAL_NEGATIVE' using errcode='23514'; end if; end if;
    if patch ? 'sell_each_czk' then amount := (patch->>'sell_each_czk')::numeric; if amount < 0 then raise exception 'TICKET_SELL_EACH_NEGATIVE' using errcode='23514'; end if; end if;
    if patch ? 'marketplace_fee_czk' then amount := (patch->>'marketplace_fee_czk')::numeric; if amount < 0 then raise exception 'TICKET_FEE_NEGATIVE' using errcode='23514'; end if; end if;

    expected_revision := coalesce((item->>'expectedRevision')::bigint,0);
    if expected_revision < 0 then raise exception 'TICKET_REVISION_INVALID' using errcode='22023'; end if;
    select revision into current_revision
      from public.ticket_gmail_state1215
      where user_id=uid and ticket_id=tid
      for update;
    current_revision := coalesce(current_revision,0);
    if current_revision <> expected_revision then
      raise exception 'TICKET_GMAIL_CONCURRENT_UPDATE:%:%', expected_revision, current_revision using errcode='40001';
    end if;

    update public.ticket_inventory
       set market_status = coalesce(market_text, market_status),
           delivered_at = case when patch ? 'delivered_at' then nullif(patch->>'delivered_at','')::timestamptz else delivered_at end,
           sell_total_czk = case when patch ? 'sell_total_czk' then (patch->>'sell_total_czk')::numeric else sell_total_czk end,
           sell_each_czk = case when patch ? 'sell_each_czk' then (patch->>'sell_each_czk')::numeric else sell_each_czk end,
           marketplace_fee_czk = case when patch ? 'marketplace_fee_czk' then (patch->>'marketplace_fee_czk')::numeric else marketplace_fee_czk end,
           sale_source = coalesce(nullif(patch->>'sale_source',''), sale_source),
           updated_at = now()
     where user_id = uid and id = tid;
    if not found then raise exception 'TICKET_NOT_FOUND:%', tid using errcode='P0002'; end if;

    insert into public.ticket_gmail_state1215(user_id,ticket_id,payload,revision,updated_at)
    values(uid,tid,payload,expected_revision+1,now())
    on conflict(user_id,ticket_id) do update
      set payload=excluded.payload,revision=excluded.revision,updated_at=excluded.updated_at;
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
