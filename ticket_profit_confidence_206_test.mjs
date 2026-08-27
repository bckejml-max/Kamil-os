import assert from 'node:assert/strict';
import {ticketProfitConfidence206,enrichTicketProfitConfidenceScenario206,buildTicketProfitConfidencePlanner206} from './js/ticketProfitConfidenceModel206.js';

const weak=ticketProfitConfidence206({confidenceScore:50,learnedNet:{status:'LEARNED NET',netProfit:1000,netRevenue:3000,confidence:'VERY_LOW',samples:1}});
const strong=ticketProfitConfidence206({confidenceScore:90,learnedNet:{status:'LEARNED NET',netProfit:1000,netRevenue:3000,confidence:'HIGH',samples:10}});
assert.equal(weak.ok,true);assert.equal(strong.ok,true);
assert.ok(strong.score>weak.score);
assert.ok((strong.range.high-strong.range.low)<(weak.range.high-weak.range.low));
assert.ok(strong.range.low<=1000&&strong.range.high>=1000);

const mixed=enrichTicketProfitConfidenceScenario206({rows:[
 {name:'A',allocation:{qty:2},learnedNet:{status:'LEARNED NET',netProfit:500,netRevenue:2000,confidence:'MEDIUM',samples:5},confidenceScore:80},
 {name:'B',allocation:{qty:2},learnedNet:{status:'GROSS ONLY',netProfit:null,netRevenue:null},confidenceScore:80}
]});
assert.equal(mixed.profitConfidence.fullCoverage,false);
assert.equal(mixed.profitConfidence.fullRange,null);
assert.ok(mixed.profitConfidence.knownRange);
assert.equal(mixed.profitConfidence.coveragePct,50);

const now=Date.parse('2026-08-27T12:00:00Z');
const sold=[];
for(let i=0;i<8;i++)sold.push({id:`sold${i}`,market_status:'PAID',marketplace:'Viagogo',sell_total_czk:2000,payout_received_czk:1750});
const input={inventory:sold,latest:new Map(),ticketBook:{capitalBudgetCzk:20000},watchlist:[
 {id:'a',name:'Event A',eventDate:'2026-09-20',officialPriceCzk:1000,marketPriceCzk:2000,confidenceScore:90,marketplace:'Viagogo',club:'Club A',category:'football'}
]};
const plan=buildTicketProfitConfidencePlanner206(input,now,{hardQtyCap:8,eventCapPct:20,groupCapPct:35,dateCapPct:30,categoryCapPct:60});
assert.equal(plan.version,206);
assert.equal(plan.scenarios.length,3);
assert.equal(plan.recommended,'BALANCED');
const balanced=plan.balanced;
assert.ok(balanced.profitConfidence.score>=80);
assert.equal(balanced.profitConfidence.fullCoverage,true);
assert.ok(balanced.profitConfidence.fullRange.low<=balanced.profitConfidence.fullRange.center);
assert.ok(balanced.profitConfidence.fullRange.high>=balanced.profitConfidence.fullRange.center);
console.log('OS 206 PROFIT CONFIDENCE ENGINE PASS');
