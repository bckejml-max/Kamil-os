import assert from 'node:assert/strict';
import {ticketRepricingGuard194,timeMarketFactor194,TICKET_REPRICING_GUARD_VERSION_194} from './js/ticketRepricingGuardModel194.js';

assert.equal(TICKET_REPRICING_GUARD_VERSION_194,194);
assert.equal(timeMarketFactor194(30),1.06);
assert.equal(timeMarketFactor194(10),1.02);
assert.equal(timeMarketFactor194(2),.98);

const row={id:'jab',event_name:'Sparta - Jablonec',event_date:'2026-09-12T18:00:00+02:00',qty:2,buy_each_czk:625,buy_total_czk:1250,ask_each_czk:1999,market_status:'LISTED'};
const learning={byMarket:{Viagogo:{count:4,ratio:.875,feeRate:.125,confidence:'MEDIUM'}},knownGlobal:{count:4,ratio:.875,feeRate:.125},global:{count:4,ratio:.875,feeRate:.125}};
const now=Date.parse('2026-08-27T12:00:00+02:00');

const highMarket=ticketRepricingGuard194(row,learning,{market_price_czk:2300},now);
assert.equal(highMarket.action,'RAISE TO');
assert.ok(highMarket.recommendedAsk>=highMarket.neverBelow);
assert.equal(highMarket.neverBelow,1072);

const lowMarket=ticketRepricingGuard194({...row,ask_each_czk:1999},learning,{market_price_czk:900},now);
assert.equal(lowMarket.action,'DROP TO');
assert.equal(lowMarket.recommendedAsk,1070); // rounded display target must be corrected up by hard guard below
assert.ok(lowMarket.recommendedAsk>=Math.round(lowMarket.neverBelow/10)*10);

const underFloor=ticketRepricingGuard194({...row,ask_each_czk:700},learning,{market_price_czk:900},now);
assert.equal(underFloor.action,'RAISE TO');
assert.ok(underFloor.recommendedAsk>=underFloor.neverBelow-5);

const noHistory=ticketRepricingGuard194(row,{byMarket:{},knownGlobal:{count:0},global:{count:0}},{market_price_czk:1500},now);
assert.equal(noHistory.action,'PAYOUT DATA NEEDED');
assert.equal(noHistory.recommendedAsk,null);

console.log('OS 194 TICKET REPRICING GUARD PASS');
