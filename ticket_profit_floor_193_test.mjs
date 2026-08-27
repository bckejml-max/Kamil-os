import assert from 'node:assert/strict';
import {buildTicketPayoutLearning192} from './js/ticketPayoutLearningModel192.js';
import {ticketProfitFloor193,buildTicketProfitFloorRow193} from './js/ticketProfitFloorModel193.js';

const history=[
 {id:'s1',marketplace:'Viagogo',sell_total_czk:4000,payout_received_czk:3500,market_status:'PAYOUT_RECEIVED'},
 {id:'s2',marketplace:'Viagogo',sell_total_czk:2000,payout_received_czk:1750,market_status:'PAYOUT_RECEIVED'}
];
const learning=buildTicketPayoutLearning192(history);
assert.equal(learning.byMarket.Viagogo.ratio,.875);
const row={id:'jablonec',event_name:'Sparta Praha vs. Jablonec',section:'C11',qty:2,buy_each_czk:625,ask_each_czk:1999,market_status:'LISTED'};
const be=ticketProfitFloor193(row,learning,'Viagogo',0);
const r20=ticketProfitFloor193(row,learning,'Viagogo',.2);
const r50=ticketProfitFloor193(row,learning,'Viagogo',.5);
assert.equal(be.ok,true);
assert.equal(be.askEachFloor,715);
assert.equal(r20.askEachFloor,858);
assert.equal(r50.askEachFloor,1072);
const verdict=buildTicketProfitFloorRow193(row,learning);
assert.equal(verdict.verdict,'SAFE +50%');
const low=buildTicketProfitFloorRow193({...row,ask_each_czk:700},learning);
assert.equal(low.verdict,'BELOW BREAK-EVEN');
const unknown=ticketProfitFloor193(row,buildTicketPayoutLearning192([]),'Viagogo',.2);
assert.equal(unknown.ok,false);
assert.equal(unknown.reason,'INSUFFICIENT_HISTORY');
assert.equal(unknown.askEachFloor,null);
console.log('OS 193 TICKET PROFIT FLOOR PASS');
