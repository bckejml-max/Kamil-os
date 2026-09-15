import assert from 'node:assert/strict';
import {prepareTicketTransaction1213} from './lib/ticket-transaction1213.js';

const listed={id:'ticket-replay',state:'listed',purchased:4,listed:4,sold:0,transferred:0,events:[]};
const buyer={eventId:'gmail-replay-1',type:'buyer',qty:2,at:'2026-09-15T12:00:00.000Z'};
const sale=prepareTicketTransaction1213(listed,buyer,{now:Date.parse('2026-09-15T12:01:00Z')});

const safeReplay=prepareTicketTransaction1213(sale.next,{...buyer,at:'2026-09-15T12:10:00.000Z'});
assert.equal(safeReplay.replay,true,'same semantic event must remain replay-safe even if ingestion timestamp differs');
assert.strictEqual(safeReplay.next,sale.next,'safe replay must not mutate ticket state');

assert.throws(
 ()=>prepareTicketTransaction1213(sale.next,{...buyer,qty:1}),
 error=>error?.code==='TICKET_EVENT_REPLAY_CONFLICT'&&error?.detail?.eventId==='gmail-replay-1'&&error?.detail?.previous?.qty===2&&error?.detail?.incoming?.qty===1,
 'same eventId with changed quantity must fail closed'
);
assert.throws(
 ()=>prepareTicketTransaction1213(sale.next,{...buyer,type:'transfer_confirmed'}),
 error=>error?.code==='TICKET_EVENT_REPLAY_CONFLICT',
 'same eventId with changed event type must fail closed'
);

const payoutBase={id:'ticket-payout',state:'transferred',purchased:1,listed:1,sold:1,transferred:1,grossCzk:1000,feeCzk:100,events:[]};
const payoutEvent={eventId:'gmail-payout-1',type:'payout_info',gross_czk:1000,fee_czk:100,payout_czk:900,at:'2026-09-15T13:00:00.000Z'};
const paid=prepareTicketTransaction1213(payoutBase,payoutEvent,{now:Date.parse('2026-09-15T13:01:00Z')});

const payoutAliasReplay=prepareTicketTransaction1213(paid.next,{eventId:'gmail-payout-1',type:'payout_info',grossCzk:1000,feeCzk:100,payoutCzk:900});
assert.equal(payoutAliasReplay.replay,true,'equivalent snake_case/camelCase payout aliases must be replay-safe');
assert.throws(
 ()=>prepareTicketTransaction1213(paid.next,{...payoutEvent,payout_czk:899}),
 error=>error?.code==='TICKET_EVENT_REPLAY_CONFLICT'&&error?.detail?.previous?.payoutCzk===900&&error?.detail?.incoming?.payoutCzk===899,
 'same payout eventId with changed money must fail closed'
);

console.log('OS1214 PASS: ticket event replays are idempotent only when semantic payloads match');
