import assert from 'node:assert/strict';
import {prepareTicketReplace182,CLOSED_TICKET_STATUSES_182} from './js/ticketImportIntegrity182.js';

const current=[
 {id:'paid',market_status:'PAYOUT_RECEIVED',event_name:'Paid event',payout_received_czk:4100,marketplace_fee_czk:400,payout_recorded_at:'2026-08-27T08:00:00Z',viagogo_url:'https://example.test/paid'},
 {id:'waiting',market_status:'SOLD_WAITING_PAYMENT',event_name:'Waiting event'},
 {id:'active-old',market_status:'LISTED',event_name:'Old active'},
 {id:'active-keep',market_status:'LISTED',event_name:'Kept active',ask_each_czk:2500}
];
const incoming=[
 {id:'paid',eventName:'Paid event',marketStatus:'NOT_LISTED',payoutReceivedCzk:null,askEachCzk:999},
 {id:'active-keep',eventName:'Kept active',marketStatus:'LISTED'}
];
const out=prepareTicketReplace182(incoming,current);
const paid=out.merged.find(x=>x.id==='paid');
assert.equal(paid.marketStatus,'PAYOUT_RECEIVED','closed workflow must not regress to active from import');
assert.equal(paid.payoutReceivedCzk,4100,'actual payout must prefer cloud accounting value');
assert.equal(paid.marketplaceFeeCzk,400,'actual fee must survive import');
assert.equal(paid.payoutRecordedAt,'2026-08-27T08:00:00Z','payout timestamp must survive import');
assert.match(paid.viagogoUrl,/paid/,'tracking URL must survive import');
assert.equal(out.preservedClosed.length,1,'closed row missing from spreadsheet must be preserved');
assert.equal(out.preservedClosed[0].id,'waiting');
assert.deepEqual(out.staleActiveIds,['active-old'],'only missing active rows may be deleted');
assert(CLOSED_TICKET_STATUSES_182.has('SOLD_UNDELIVERED')&&CLOSED_TICKET_STATUSES_182.has('PAYOUT_RECEIVED'));
console.log('OS 182 TICKET IMPORT INTEGRITY PASS');
