import assert from 'node:assert/strict';
import fs from 'node:fs';
import {prepareTicketTransaction1213,commitTicketTransaction1213} from './lib/ticket-transaction1213.js';

const source=fs.readFileSync('lib/ticket-transaction1213.js','utf8');
for(const token of ['appendTicketEvent1195','assertTicketTransition1191','reconcileQuantity1190','payoutReconciliation1192','transferDeadline1193','commitCheckpoint1199','TICKET_PAYOUT_RECONCILIATION_FAILED','TICKET_QUANTITY_INVARIANT','TICKET_EVENT_QTY_INVALID'])assert.ok(source.includes(token),`OS1213 transaction engine missing ${token}`);

const listed={id:'ticket-1',state:'listed',purchased:4,listed:4,sold:0,transferred:0,events:[]};
const buyer={eventId:'gmail-1',type:'buyer',qty:2,at:'2026-09-15T12:00:00.000Z'};
const sale=prepareTicketTransaction1213(listed,buyer,{now:Date.parse('2026-09-15T12:01:00Z')});
assert.equal(sale.next.state,'sold');assert.equal(sale.next.sold,2);assert.equal(sale.next.available,2);assert.equal(sale.next.events.length,1);assert.equal(listed.state,'listed','prepare must not mutate original ticket');
const replay=prepareTicketTransaction1213(sale.next,buyer);assert.equal(replay.replay,true);assert.strictEqual(replay.next,sale.next,'replay must be a no-op');

const secondSale=prepareTicketTransaction1213(sale.next,{eventId:'gmail-2',type:'buyer',qty:2,at:'2026-09-15T12:05:00.000Z'});
assert.equal(secondSale.next.sold,4,'a distinct buyer event must increment sold quantity');
assert.equal(secondSale.next.available,0);
assert.equal(secondSale.next.events.length,2);
const secondSaleReplay=prepareTicketTransaction1213(secondSale.next,{eventId:'gmail-2',type:'buyer',qty:2});
assert.equal(secondSaleReplay.replay,true);assert.equal(secondSaleReplay.next.sold,4,'buyer replay must not double-decrement inventory');

const delivery=prepareTicketTransaction1213(secondSale.next,{eventId:'gmail-3',type:'delivery_required'});
assert.equal(delivery.next.state,'transfer_required');
const transferOne=prepareTicketTransaction1213(delivery.next,{eventId:'gmail-4',type:'transfer_confirmed',qty:2});
assert.equal(transferOne.next.transferred,2);assert.equal(transferOne.next.state,'transfer_required','partial transfer must remain transfer_required');
const transferTwo=prepareTicketTransaction1213(transferOne.next,{eventId:'gmail-5',type:'transfer_confirmed',qty:2});
assert.equal(transferTwo.next.transferred,4);assert.equal(transferTwo.next.state,'transferred','full transfer may become transferred');
const transferReplay=prepareTicketTransaction1213(transferTwo.next,{eventId:'gmail-5',type:'transfer_confirmed',qty:2});
assert.equal(transferReplay.replay,true);assert.equal(transferReplay.next.transferred,4,'transfer replay must not double-count');

assert.throws(()=>prepareTicketTransaction1213({...listed,purchased:1,listed:1},{...buyer,eventId:'gmail-over',qty:2}),/TICKET_QUANTITY_INVARIANT/);
assert.throws(()=>prepareTicketTransaction1213(listed,{eventId:'gmail-zero',type:'buyer',qty:0}),/TICKET_EVENT_QTY_INVALID/);
assert.throws(()=>prepareTicketTransaction1213({...listed,sold:-1},{eventId:'gmail-negative',type:'delivery_required'}),/TICKET_QUANTITY_INVARIANT/);

assert.throws(()=>prepareTicketTransaction1213({id:'p',state:'transferred',purchased:1,listed:1,sold:1,transferred:1,grossCzk:1000,feeCzk:100,events:[]},{eventId:'payout-1',type:'payout_info',grossCzk:1000,feeCzk:100,payoutCzk:850}),/TICKET_PAYOUT_RECONCILIATION_FAILED/);
const paid=prepareTicketTransaction1213({id:'p',state:'transferred',purchased:1,listed:1,sold:1,transferred:1,grossCzk:1000,feeCzk:100,events:[]},{eventId:'payout-2',type:'payout_info',grossCzk:1000,feeCzk:100,payoutCzk:900});assert.equal(paid.next.state,'paid');assert.equal(paid.next.payoutCzk,900);
const payoutReplay=prepareTicketTransaction1213(paid.next,{eventId:'payout-2',type:'payout_info',grossCzk:1000,feeCzk:100,payoutCzk:900});assert.equal(payoutReplay.replay,true);
assert.throws(()=>prepareTicketTransaction1213(paid.next,{eventId:'payout-3',type:'payout_info',grossCzk:1000,feeCzk:100,payoutCzk:900}),/INVALID_TICKET_TRANSITION_paid_paid/,'a distinct event must not mutate terminal paid history');

let writes=0,lastWrite=null;
const committed=await commitTicketTransaction1213({current:listed,event:buyer,checkpoint:{historyId:'h2'},checkpointKey:'gmail-checkpoint:owner:tickets',persist:async next=>{writes++;lastWrite=next}});
assert.equal(writes,1);assert.equal(lastWrite.state,'sold');assert.equal(committed.committed,true);assert.equal(committed.checkpointCommit.checkpoint.historyId,'h2');
let failedWrites=0;await assert.rejects(()=>commitTicketTransaction1213({current:listed,event:buyer,checkpoint:{historyId:'h3'},persist:async()=>{failedWrites++;throw new Error('STORE_WRITE_FAILED')}}),/STORE_WRITE_FAILED/);assert.equal(failedWrites,1,'failed store writes must not report checkpoint commit');

console.log('OS1213 PASS: partial sales/transfers, replay, terminal history, quantity, payout and checkpoint commit are transactional and safe');
