import assert from 'node:assert/strict';
import {TICKET_MARKET_DESK_VERSION_190,ticketSwapPlan190,buildTicketMarketDeskRow190,buildTicketMarketDesk190} from './js/ticketMarketDeskModel190.js';

assert.equal(TICKET_MARKET_DESK_VERSION_190,190);
const sparta={id:'sparta-jablonec-c11',event_name:'Sparta vs Jablonec - C11',qty:2,section:'C11',buy_each_czk:625,buy_total_czk:1250,ask_each_czk:1999,market_status:'LISTED',viagogo_url:'https://example.test/viagogo'};
const ts=ticketSwapPlan190(sparta);
assert.equal(ts.eligible,true);
assert.equal(ts.maxAskEach,750);
assert.equal(ts.netEach,712.5);
assert.equal(ts.netTotal,1425);

const row=buildTicketMarketDeskRow190(sparta,{consensus:{viagogo_price_czk:1005,stubhub_price_czk:1450,stubhub_url:'https://example.test/stubhub'}});
assert.equal(row.recommendation,'CROSS-CHECK STUBHUB');
assert.equal(row.markets[0].listed,true);
assert.equal(row.markets[0].askEach,1999);
assert.equal(row.markets[1].marketEach,1450);
assert.match(row.reason,/TicketSwap standardní strop 750 Kč/);

const desk=buildTicketMarketDesk190([sparta,{id:'sold',event_name:'Sold',qty:1,market_status:'PAID',buy_each_czk:100}],new Map([[sparta.id,{consensus:{stubhub_url:'https://example.test/stubhub'}}]]));
assert.equal(desk.coverage.active,1);
assert.equal(desk.coverage.viagogo,1);
assert.equal(desk.coverage.stubhubKnown,1);
assert.equal(desk.coverage.ticketSwapEligible,1);
console.log('OS 190 TICKET MARKET DESK PASS');
