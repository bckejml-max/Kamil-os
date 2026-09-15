import assert from 'node:assert/strict';
import fs from 'node:fs';
import {prepareTicketTransaction1213,commitTicketTransaction1213} from './lib/ticket-transaction1213.js';

const source=fs.readFileSync('lib/ticket-transaction1213.js','utf8');
for(const token of ['appendTicketEvent1195','assertTicketTransition1191','reconcileQuantity1190','payoutReconciliation1192','transferDeadline1193','commitCheckpoint1199','TICKET_PAYOUT_RECONCILIATION_FAILED','TICKET_QUANTITY_INVARIANT'])assert.ok(source.includes(token),`OS1213 transaction engine missing ${token}`);

const listed={id:'ticket-1',state:'listed',purchased:4,listed:4,sold:0,transferred:0,events:[]};
const buyer={eventId:'gmail-1',type:'buyer',qty:2,at:'2026-09-15T12:00:00.000Z'};
const sale=prepareTicketTransaction1213(listed,buyer,{now:Date.parse('2026-09-15T12:01:00Z')});
assert.equal(sale.next.state,'sold');assert.equal(sale.next.sold,2);assert.equal(sale.next.available,2);assert.equal(sale.next.events.length,1);assert.equal(listed.state,'listed','prepare must not mutate original ticket');
const replay=prepareTicketTransaction1213(sale.next,buyer);assert.equal(replay.replay,true);assert.strictEqual(replay.next,sale.next,'replay must be a no-op');
assert.throws(()=>prepareTicketTransaction1213({...listed,purchased:1,listed:1},{...buyer,eventId:'gmail-2',qty:2,sold:2}),/TICKET_QUANTITY_INVARIANT/);
assert.throws(()=>prepareTicketTransaction1213({id:'p',state:'transferred',purchased:1,listed:1,sold:1,transferred:1,grossCzk:1000,feeCzk:100,events:[]},{eventId:'payout-1',type:'payout_info',grossCzk:1000,feeCzk:100,payoutCzk:850}),/TICKET_PAYOUT_RECONCILIATION_FAILED/);
const paid=prepareTicketTransaction1213({id:'p',state:'transferred',purchased:1,listed:1,sold:1,transferred:1,grossCzk:1000,feeCzk:100,events:[]},{eventId:'payout-2',type:'payout_info',grossCzk:1000,feeCzk:100,payoutCzk:900});assert.equal(paid.next.state,'paid');assert.equal(paid.next.payoutCzk,900);

let writes=0,lastWrite=null;
const committed=await commitTicketTransaction1213({current:listed,event:buyer,checkpoint:{historyId:'h2'},checkpointKey:'gmail-checkpoint:owner:tickets',persist:async next=>{writes++;lastWrite=next}});
assert.equal(writes,1);assert.equal(lastWrite.state,'sold');assert.equal(committed.committed,true);assert.equal(committed.checkpointCommit.checkpoint.historyId,'h2');
let failedWrites=0;await assert.rejects(()=>commitTicketTransaction1213({current:listed,event:buyer,checkpoint:{historyId:'h3'},persist:async()=>{failedWrites++;throw new Error('STORE_WRITE_FAILED')}}),/STORE_WRITE_FAILED/);assert.equal(failedWrites,1,'failed store writes must not report checkpoint commit');

console.log('OS1213 PASS: ticket event, state, quantity, payout and checkpoint commit are transactional and replay-safe');
