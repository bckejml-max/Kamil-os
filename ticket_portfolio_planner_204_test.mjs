import assert from 'node:assert/strict';
import {ticketScenarioProfit204,buildTicketPortfolioPlanner204} from './js/ticketPortfolioPlannerModel204.js';

const p=ticketScenarioProfit204({allocation:{qty:4,price:1000},marketPrice:2000},.9);
assert.equal(p.modelSellPrice,1800);
assert.equal(p.grossProfit,3200);
assert.equal(p.roiPct,80);

const now=Date.parse('2026-08-27T12:00:00Z');
const input={inventory:[],latest:new Map(),ticketBook:{capitalBudgetCzk:20000},watchlist:[
 {id:'a',name:'Event A',eventDate:'2026-09-20',officialPriceCzk:1000,marketPriceCzk:2000,confidenceScore:90,club:'Club A',category:'football'},
 {id:'b',name:'Event B',eventDate:'2026-10-01',officialPriceCzk:1000,marketPriceCzk:1700,confidenceScore:80,club:'Club B',category:'concert'}
]};
const plan=buildTicketPortfolioPlanner204(input,now,{hardQtyCap:8,eventCapPct:20,groupCapPct:35,dateCapPct:30,categoryCapPct:60});
assert.equal(plan.version,204);
assert.equal(plan.scenarios.length,3);
const c=plan.scenarios.find(x=>x.mode==='CONSERVATIVE');
const b=plan.scenarios.find(x=>x.mode==='BALANCED');
const a=plan.scenarios.find(x=>x.mode==='AGGRESSIVE');
assert.equal(c.reservePct,30);assert.equal(b.reservePct,10);assert.equal(a.reservePct,5);
assert.equal(c.marketRealization,.8);assert.equal(b.marketRealization,.9);assert.equal(a.marketRealization,1);
assert.ok(c.available<=b.available&&b.available<=a.available);
for(const s of plan.scenarios){for(const r of s.rows){assert.ok(r.allocation.qty<=r.allocation.maxQty);assert.ok(r.allocation.capital<=r.allocation.maxBudget);}}
assert.equal(plan.recommended,'BALANCED');
console.log('OS 204 TICKET PORTFOLIO PLANNER PASS');
