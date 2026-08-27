import assert from 'node:assert/strict';
import {buildTicketRecoveryDiff189,TICKET_RECOVERY_DIFF_VERSION_189,ticketRecoveryDiffLabel189} from './js/ticketRecoveryDiff189.js';

assert.equal(TICKET_RECOVERY_DIFF_VERSION_189,189);
const current=[
 {id:'a',event_name:'A',qty:2,market_status:'LISTED',buy_total_czk:1000},
 {id:'b',event_name:'B',qty:1,market_status:'PAYOUT_RECEIVED',buy_total_czk:500,sell_total_czk:900},
 {id:'c',event_name:'C',qty:4,market_status:'NOT_LISTED',buy_total_czk:2000}
];
const target=[
 {id:'a',event_name:'A',qty:2,market_status:'NOT_LISTED',buy_total_czk:1000},
 {id:'b',event_name:'B',qty:1,market_status:'LISTED',buy_total_czk:500,sell_total_czk:0},
 {id:'d',event_name:'D',qty:3,market_status:'LISTED',buy_total_czk:1200}
];
const diff=buildTicketRecoveryDiff189(current,target);
assert.equal(diff.summary.added,1);
assert.equal(diff.summary.changed,2);
assert.equal(diff.summary.removed,1);
assert.equal(diff.summary.statusChanged,2);
assert.equal(diff.summary.protected,1);
assert.equal(diff.protected[0].id,'b','closed payout row must be flagged as protected from downgrade');
assert.equal(diff.removed[0].before.id,'c');
assert.match(ticketRecoveryDiffLabel189(current[0]),/A · 2 ks · LISTED/);

const removedClosed=buildTicketRecoveryDiff189([{id:'x',event_name:'Sold',qty:1,market_status:'SOLD_WAITING_PAYMENT'}],[]);
assert.equal(removedClosed.summary.removed,0);
assert.equal(removedClosed.summary.protected,1,'closed records absent from snapshot are protected, not treated as normal removals');

console.log('OS 189 TICKET RECOVERY DIFF PASS');
