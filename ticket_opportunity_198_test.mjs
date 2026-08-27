import assert from 'node:assert/strict';
import {ticketOpportunityScore198,ticketComplianceGate198,buildTicketOpportunityScanner198,TICKET_OPPORTUNITY_VERSION_198} from './js/ticketOpportunityModel198.js';

const now=Date.parse('2026-08-27T12:00:00Z');
const verified={resaleAllowed:true,transferCompatible:true,officialSaleStatus:'ON_SALE',restrictionsVerifiedAt:'2026-08-27T10:00:00Z'};
const payout={learnedPayoutRatio:.875,payoutSamples:4,payoutConfidence:'MEDIUM'};
const strong={id:'a',name:'Derby',eventDate:'2026-09-20',officialPriceCzk:1000,marketPriceCzk:1900,confidenceScore:90,competitorCount:6,sameSectionCount:3,...verified,...payout};
const s=ticketOpportunityScore198(strong,now);
assert.equal(TICKET_OPPORTUNITY_VERSION_198,198);
assert.equal(s.action,'BUY');
assert.equal(s.rawAction,'BUY');
assert.equal(s.compliance.verified,true);
assert.equal(s.buyFinance.ready,true);
assert.ok(s.score>=68);
assert.equal(s.upsidePct,90);
assert.equal(s.grossSpreadCeiling,1260);
assert.equal(s.netSafeMaxBuyPrice,1100);
assert.equal(s.maxBuyPrice,1100);
assert.ok(s.netSafeMaxBuyPrice<s.grossSpreadCeiling);

const noPayout=ticketOpportunityScore198({...strong,learnedPayoutRatio:undefined,payoutSamples:undefined,payoutConfidence:undefined},now);
assert.equal(noPayout.rawAction,'BUY');
assert.equal(noPayout.action,'DATA NEEDED');
assert.equal(noPayout.maxBuyPrice,null);
assert.equal(noPayout.grossSpreadCeiling,1260);

const unknownCompliance=ticketOpportunityScore198({...strong,resaleAllowed:undefined,transferCompatible:undefined,officialSaleStatus:undefined,restrictionsVerifiedAt:undefined},now);
assert.equal(unknownCompliance.rawAction,'BUY');
assert.equal(unknownCompliance.action,'VERIFY');
assert.equal(unknownCompliance.compliance.verified,false);
assert.ok(unknownCompliance.compliance.missing.includes('resaleAllowed'));

const blocked=ticketOpportunityScore198({...strong,resaleAllowed:false},now);
assert.equal(blocked.rawAction,'BUY');
assert.equal(blocked.action,'BLOCK');
assert.equal(blocked.compliance.blocked,true);
assert.equal(ticketComplianceGate198({...verified,transferCompatible:false}).blocked,true);

const noMarket=ticketOpportunityScore198({...strong,marketPriceCzk:0},now);
assert.notEqual(noMarket.action,'BUY');
const noOfficial=ticketOpportunityScore198({...strong,officialPriceCzk:0},now);
assert.notEqual(noOfficial.action,'BUY');
const weak=ticketOpportunityScore198({...strong,marketPriceCzk:1150,confidenceScore:40},now);
assert.notEqual(weak.action,'BUY');

const latest=new Map([['owned',{market_price_czk:1800,official_price_czk:900,median_price_czk:1750,multi_market_confidence:88,competitor_count:5,same_section_count:2}]]);
const scan=buildTicketOpportunityScanner198({inventory:[{id:'owned',event_name:'Owned Match',event_date:'2026-09-18',market_status:'LISTED',buy_each_czk:900,...verified}],latest,watchlist:[strong]},now);
assert.equal(scan.version,198);
assert.equal(scan.rows.length,2);
assert.ok(scan.buy.length>=1);
assert.equal(scan.verify.length,0);
assert.ok(scan.rows.some(x=>x.kind==='BUY_MORE'));
assert.ok(scan.rows.some(x=>x.kind==='WATCHLIST'));
assert.ok(scan.summary.dataNeeded>=1);

const verifyScan=buildTicketOpportunityScanner198({inventory:[],latest:new Map(),watchlist:[{...strong,id:'verify',resaleAllowed:undefined,transferCompatible:undefined,officialSaleStatus:undefined,restrictionsVerifiedAt:undefined}]},now);
assert.equal(verifyScan.summary.buy,0);
assert.equal(verifyScan.summary.verify,1);
console.log('OS 198 TICKET OPPORTUNITY SCANNER PASS');
