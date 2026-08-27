import assert from 'node:assert/strict';
import {ticketOpportunityScore198,buildTicketOpportunityScanner198,TICKET_OPPORTUNITY_VERSION_198} from './js/ticketOpportunityModel198.js';

const now=Date.parse('2026-08-27T12:00:00Z');
const strong={id:'a',name:'Derby',eventDate:'2026-09-20',officialPriceCzk:1000,marketPriceCzk:1900,confidenceScore:90,competitorCount:6,sameSectionCount:3};
const s=ticketOpportunityScore198(strong,now);
assert.equal(TICKET_OPPORTUNITY_VERSION_198,198);
assert.equal(s.action,'BUY');
assert.ok(s.score>=68);
assert.equal(s.upsidePct,90);
assert.ok(s.maxBuyPrice<=Math.floor(1900/1.5));

const noMarket=ticketOpportunityScore198({...strong,marketPriceCzk:0},now);
assert.notEqual(noMarket.action,'BUY');
const noOfficial=ticketOpportunityScore198({...strong,officialPriceCzk:0},now);
assert.notEqual(noOfficial.action,'BUY');

const weak=ticketOpportunityScore198({...strong,marketPriceCzk:1150,confidenceScore:40},now);
assert.notEqual(weak.action,'BUY');

const latest=new Map([['owned',{market_price_czk:1800,official_price_czk:900,median_price_czk:1750,multi_market_confidence:88,competitor_count:5,same_section_count:2}]]);
const scan=buildTicketOpportunityScanner198({inventory:[{id:'owned',event_name:'Owned Match',event_date:'2026-09-18',market_status:'LISTED',buy_each_czk:900}],latest,watchlist:[strong]},now);
assert.equal(scan.version,198);
assert.equal(scan.rows.length,2);
assert.ok(scan.buy.length>=1);
assert.ok(scan.rows.some(x=>x.kind==='BUY_MORE'));
assert.ok(scan.rows.some(x=>x.kind==='WATCHLIST'));
console.log('OS 198 TICKET OPPORTUNITY SCANNER PASS');
