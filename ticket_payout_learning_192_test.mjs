import assert from 'node:assert/strict';
import {buildTicketPayoutLearning192,estimateTicketNet192,buildTicketNetDesk192,inferTicketMarketplace192} from './js/ticketPayoutLearningModel192.js';

assert.equal(inferTicketMarketplace192({viagogo_url:'https://viagogo.com/x'}),'Viagogo');
assert.equal(inferTicketMarketplace192({stubhub_url:'https://stubhub.com/x'}),'StubHub');

const inventory=[
 {id:'sold1',marketplace:'Viagogo',sell_total_czk:4000,payout_received_czk:3520,market_status:'PAYOUT_RECEIVED'},
 {id:'sold2',marketplace:'Viagogo',sell_total_czk:2000,marketplace_fee_czk:240,market_status:'PAYOUT_RECEIVED'},
 {id:'sold3',marketplace:'StubHub',sell_total_czk:3000,payout_received_czk:2700,market_status:'PAYOUT_RECEIVED'},
 {id:'active',event_name:'Sparta vs Jablonec',section:'C11',qty:2,ask_each_czk:1999,market_status:'LISTED',viagogo_url:'https://viagogo.com/jablonec'}
];
const learning=buildTicketPayoutLearning192(inventory);
assert.equal(learning.totalSamples,3);
assert.equal(learning.byMarket.Viagogo.count,2);
assert.ok(Math.abs(learning.byMarket.Viagogo.ratio-0.88)<0.0001);
const est=estimateTicketNet192(inventory[3],learning,'Viagogo');
assert.equal(est.ok,true);
assert.equal(est.samples,2);
assert.equal(est.net,3518);

const empty=buildTicketPayoutLearning192([inventory[3]]);
const unknown=estimateTicketNet192(inventory[3],empty,'Viagogo');
assert.equal(unknown.ok,false);
assert.equal(unknown.reason,'INSUFFICIENT_HISTORY');
assert.equal(unknown.net,null);

const desk=buildTicketNetDesk192(inventory);
assert.equal(desk.rows.length,1);
assert.equal(desk.rows[0].viagogo.ok,true);
console.log('OS 192 TICKET PAYOUT LEARNING PASS');
