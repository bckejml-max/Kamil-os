import assert from 'node:assert/strict';
import {sellProbabilityScore195,ticketSellLadder195,TICKET_SELL_LADDER_VERSION_195} from './js/ticketSellLadderModel195.js';

assert.equal(TICKET_SELL_LADDER_VERSION_195,195);
assert.ok(sellProbabilityScore195(900,1000,5)>sellProbabilityScore195(1200,1000,5));
assert.ok(sellProbabilityScore195(1000,1000,1)>sellProbabilityScore195(1000,1000,30));

const row={id:'jab',event_name:'Sparta - Jablonec',event_date:'2026-09-12T18:00:00+02:00',qty:2,buy_each_czk:625,buy_total_czk:1250,ask_each_czk:1999,market_status:'LISTED'};
const learning={byMarket:{Viagogo:{count:4,ratio:.875,feeRate:.125,confidence:'MEDIUM'}},knownGlobal:{count:4,ratio:.875,feeRate:.125},global:{count:4,ratio:.875,feeRate:.125}};
const now=Date.parse('2026-08-27T12:00:00+02:00');
const x=ticketSellLadder195(row,learning,{market_price_czk:1400},now);
assert.equal(x.marketEach,1400);
assert.ok(x.ladder.length>=5);
assert.ok(x.best);
assert.equal(x.best.safety.code,'SAFE +50%');
assert.ok(x.best.price>=x.floors.roi50.askEachFloor);
const fast=x.ladder.find(v=>v.key==='FAST');
const premium=x.ladder.find(v=>v.key==='PREMIUM');
assert.ok(fast.score>premium.score);
assert.ok(x.ladder.every(v=>v.net?.ok));

const noMarket=ticketSellLadder195(row,learning,{},now);
assert.equal(noMarket.ladder.length,0);
assert.equal(noMarket.best,null);

console.log('OS 195 TICKET SELL LADDER PASS');
