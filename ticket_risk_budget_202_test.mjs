import assert from 'node:assert/strict';
import {buildTicketRiskBudget202} from './js/ticketRiskBudgetModel202.js';

const now=Date.parse('2026-08-27T12:00:00Z');
const verified={resaleAllowed:true,transferCompatible:true,officialSaleStatus:'ON_SALE',restrictionsVerifiedAt:'2026-08-27T10:00:00Z'};
const payout={learnedPayoutRatio:.875,payoutSamples:4,payoutConfidence:'MEDIUM'};
const watchlist=[{id:'w1',name:'Sparta vs Big Match',club:'Sparta',sport:'football',eventDate:'2026-09-20',officialPriceCzk:625,marketPriceCzk:1400,medianPriceCzk:1400,confidenceScore:90,...verified,...payout}];
const ticketBook={capitalBudgetCzk:20000,watchlist};
const base=buildTicketRiskBudget202({inventory:[],latest:new Map(),watchlist,ticketBook},now);
const b=base.rows.find(x=>x.id==='w1');
assert.equal(b.action,'BUY');
assert.equal(b.riskBudget.verdict,'BUY');
assert.equal(b.riskBudget.buyPrice,625);
assert.equal(b.riskBudget.netSafeMaxBuyPrice,810);
assert.equal(b.riskBudget.maxQty,6);

const noPayout=buildTicketRiskBudget202({inventory:[],latest:new Map(),watchlist:[{...watchlist[0],id:'nopayout',learnedPayoutRatio:undefined,payoutSamples:undefined,payoutConfidence:undefined}],ticketBook},now);
const np=noPayout.rows.find(x=>x.id==='nopayout');
assert.equal(np.action,'DATA NEEDED');
assert.equal(np.riskBudget.verdict,'NO BUY');
assert.equal(np.riskBudget.buyPrice,null);

const unverified=buildTicketRiskBudget202({inventory:[],latest:new Map(),watchlist:[{...watchlist[0],id:'verify',resaleAllowed:undefined,transferCompatible:undefined,officialSaleStatus:undefined,restrictionsVerifiedAt:undefined}],ticketBook},now);
const uv=unverified.rows.find(x=>x.id==='verify');
assert.equal(uv.action,'VERIFY');
assert.equal(uv.riskBudget.verdict,'NO BUY');

const concentratedInventory=[{id:'s1',event_name:'Sparta vs A',club:'Sparta',sport:'football',event_date:'2026-09-10',market_status:'LISTED',qty:1,buy_total_czk:5500}];
const c=buildTicketRiskBudget202({inventory:concentratedInventory,latest:new Map(),watchlist,ticketBook},now);
const cr=c.rows.find(x=>x.id==='w1');
assert.equal(cr.riskBudget.verdict,'BUY');
assert.equal(cr.riskBudget.binding.dimension,'group');
assert.equal(cr.riskBudget.allowedBudget,1500);
assert.equal(cr.riskBudget.maxQty,2);

const fullInventory=[{id:'s2',event_name:'Sparta vs A',club:'Sparta',sport:'football',event_date:'2026-09-10',market_status:'LISTED',qty:1,buy_total_czk:7000}];
const f=buildTicketRiskBudget202({inventory:fullInventory,latest:new Map(),watchlist,ticketBook},now);
const fr=f.rows.find(x=>x.id==='w1');
assert.equal(fr.riskBudget.verdict,'CONCENTRATED');
assert.equal(fr.riskBudget.maxQty,0);
console.log('OS 202 PORTFOLIO RISK BUDGET PASS');
