import assert from 'node:assert/strict';
import fs from 'node:fs';
import {planTicketGmailBatch1215} from './lib/ticket-gmail-batch1215.js';

const inventory=[{id:'ticket-1',qty:4,marketplace_order_id:'ORDER-1',market_status:'SOLD_UNDELIVERED'}];
const messages=[
 {id:'gmail-1',order_id:'ORDER-1',type:'buyer',qty:2,ts:'2026-09-15T10:00:00Z'},
 {id:'gmail-2',order_id:'ORDER-1',type:'buyer',qty:2,ts:'2026-09-15T10:01:00Z'},
 {id:'gmail-3',order_id:'ORDER-1',type:'transfer_confirmed',qty:2,ts:'2026-09-15T10:02:00Z'},
 {id:'gmail-4',order_id:'ORDER-1',type:'transfer_confirmed',qty:2,ts:'2026-09-15T10:03:00Z'}
];
const first=planTicketGmailBatch1215({inventory,messages,checkpoint:{historyId:'200'},now:Date.parse('2026-09-15T10:04:00Z')});
assert.equal(first.items.length,1);
assert.equal(first.items[0].expectedRevision,0);
assert.equal(first.items[0].payload.sold,4,'two partial sales must accumulate to 4/4');
assert.equal(first.items[0].payload.transferred,4,'two partial transfers must accumulate to 4/4');
assert.equal(first.items[0].payload.state,'transferred');
assert.equal(first.items[0].patch.market_status,'SOLD_WAITING_PAYMENT');
assert.equal(first.unmatched.length,0);
assert.equal(first.review.length,0);

const replay=planTicketGmailBatch1215({inventory,messages,states:[{ticket_id:'ticket-1',payload:first.items[0].payload,revision:7}],checkpoint:{historyId:'201'},now:Date.parse('2026-09-15T10:05:00Z')});
assert.equal(replay.items[0].expectedRevision,7,'planner must carry durable optimistic revision');
assert.equal(replay.replays.length,4,'same Gmail messages must be replay-safe');
assert.equal(replay.items[0].payload.sold,4);
assert.equal(replay.items[0].payload.transferred,4);
assert.throws(()=>planTicketGmailBatch1215({inventory,messages:[{...messages[0],qty:1}],states:[{ticket_id:'ticket-1',payload:first.items[0].payload,revision:7}]}),e=>e?.code==='TICKET_EVENT_REPLAY_CONFLICT','changed payload with same Gmail id must fail closed');

const payout=planTicketGmailBatch1215({inventory,messages:[{id:'gmail-pay',order_id:'ORDER-1',type:'payout_info',payout_czk:900,fee_czk:100,ts:'2026-09-15T11:00:00Z'}],states:[{ticket_id:'ticket-1',payload:first.items[0].payload,revision:1}],checkpoint:{historyId:'202'},now:Date.parse('2026-09-15T11:01:00Z')});
assert.equal(payout.items[0].expectedRevision,1);
assert.equal(payout.items[0].payload.state,'paid');
assert.equal(payout.items[0].payload.payoutCzk,900);
assert.equal(payout.items[0].patch.market_status,'PAYOUT_RECEIVED');
assert.equal(payout.items[0].patch.marketplace_fee_czk,100);

const ambiguousQty=planTicketGmailBatch1215({inventory,messages:[{id:'gmail-q',order_id:'ORDER-1',type:'buyer',qty:null}]});
assert.equal(ambiguousQty.items.length,0,'missing sale quantity must never default to one ticket');
assert.equal(ambiguousQty.review[0].reviewReason,'QTY_REQUIRED');
const ambiguousPayout=planTicketGmailBatch1215({inventory,messages:[{id:'gmail-p',order_id:'ORDER-1',type:'payout_info',payout_czk:900}]});
assert.equal(ambiguousPayout.items.length,0,'incomplete payout must not auto-commit');
assert.equal(ambiguousPayout.review[0].reviewReason,'PAYOUT_COMPONENTS_REQUIRED');
const unmatched=planTicketGmailBatch1215({inventory,messages:[{id:'gmail-x',order_id:'UNKNOWN',type:'buyer',qty:1}],checkpoint:{historyId:'203'}});
assert.equal(unmatched.items.length,0);
assert.equal(unmatched.unmatched.length,1);

const client=fs.readFileSync('js/ticketGmailSync429.js','utf8');
assert.match(client,/planTicketGmailBatch1215/,'live Gmail client must use OS1215 planner');
assert.match(client,/ticket-gmail-sync\?mode=tickets/,'live client must explicitly request ticket mode');
assert.match(client,/select\('ticket_id,payload,revision'\)/,'live client must load optimistic revision');
assert.match(client,/ticket_gmail_sync1215/,'live client must load durable checkpoint');
assert.match(client,/ticket_gmail_state1215/,'live client must load durable event state');
assert.match(client,/commit_ticket_gmail_batch1215/,'live client must use atomic DB commit RPC');
assert.match(client,/TICKET_GMAIL_CONCURRENT_UPDATE/,'live client must surface stale concurrent writes');
assert.match(client,/plan\.unmatched\.length\+plan\.review\.length>0/,'unmatched or ambiguous messages must hold checkpoint');
assert.doesNotMatch(client,/function patchFor\(/,'legacy direct patch path must be removed');

const migration35=fs.readFileSync('supabase/migrations/0035_ticket_gmail_transactions1215.sql','utf8');
assert.match(migration35,/create table if not exists public\.ticket_gmail_state1215/i);
assert.match(migration35,/create table if not exists public\.ticket_gmail_sync1215/i);
const migration36=fs.readFileSync('supabase/migrations/0036_ticket_gmail_concurrency1217.sql','utf8');
assert.match(migration36,/add column if not exists revision bigint/i);
assert.match(migration36,/pg_advisory_xact_lock\(hashtext\(uid::text\)\)/i,'same owner syncs must serialize');
assert.match(migration36,/for update/i,'ticket revision row must be locked');
assert.match(migration36,/TICKET_GMAIL_CONCURRENT_UPDATE/i,'stale revision must fail closed');
assert.match(migration36,/TICKET_QUANTITY_INVARIANT/i,'database must enforce quantity invariant');
assert.match(migration36,/TICKET_MARKET_STATUS_INVALID/i,'database must reject arbitrary market states');
assert.match(migration36,/TICKET_PAYLOAD_ID_MISMATCH/i,'database must bind payload to ticket id');
assert.match(migration36,/TICKET_EVENTS_ARRAY_REQUIRED/i,'event stream must remain an array');
assert.match(migration36,/auth\.uid\(\)/i,'atomic commit must be owner scoped');
assert.match(migration36,/raise exception 'TICKET_NOT_FOUND/i,'missing inventory row must fail closed');

console.log('OS1215-1217 live Gmail ticket transaction guard PASS');
