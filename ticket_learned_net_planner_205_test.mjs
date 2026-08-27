import assert from 'node:assert/strict';
import {buildTicketLearnedNetPlanner205} from './js/ticketLearnedNetPlannerModel205.js';

const now=Date.parse('2026-08-27T12:00:00Z');
const opts={hardQtyCap:8,eventCapPct:20,groupCapPct:35,dateCapPct:30,categoryCapPct:60};
const soldViagogo={id:'sold-vg',market_status:'PAID',marketplace:'Viagogo',sell_total_czk:2000,payout_received_czk:1750};
const base={ticketBook:{capitalBudgetCzk:30000},latest:new Map(),watchlist:[
 {id:'a',name:'Event A',eventDate:'2026-09-20',officialPriceCzk:1000,marketPriceCzk:2000,confidenceScore:90,club:'Club A',category:'football',marketplace:'Viagogo'},
 {id:'b',name:'Event B',eventDate:'2026-10-01',officialPriceCzk:1000,marketPriceCzk:1800,confidenceScore:85,club:'Club B',category:'concert',marketplace:'StubHub'}
]};

const mixed=buildTicketLearnedNetPlanner205({...base,inventory:[soldViagogo]},now,opts);
assert.equal(mixed.version,205);
assert.equal(mixed.learning.byMarket.Viagogo.ratio,.875);
const mb=mixed.balanced;
assert.ok(mb.learnedNet.learned>0);
assert.ok(mb.learnedNet.missing>0);
assert.equal(mb.learnedNet.displayProfitMode,'MIXED');
assert.equal(mb.learnedNet.fullNetProfit,null);
const learnedRow=mb.rows.find(r=>r.learnedNet?.status==='LEARNED NET');
assert.ok(learnedRow);
assert.ok(learnedRow.learnedNet.netRevenue<learnedRow.learnedNet.grossRevenue);
assert.ok(learnedRow.learnedNet.netProfit<learnedRow.profitModel.grossProfit);
const grossOnly=mb.rows.find(r=>r.learnedNet?.status==='GROSS ONLY');
assert.ok(grossOnly);

const allVgInput={...base,watchlist:base.watchlist.map(x=>({...x,marketplace:'Viagogo'})),inventory:[soldViagogo]};
const full=buildTicketLearnedNetPlanner205(allVgInput,now,opts).balanced;
assert.equal(full.learnedNet.coveragePct,100);
assert.equal(full.learnedNet.displayProfitMode,'LEARNED NET');
assert.notEqual(full.learnedNet.fullNetProfit,null);
assert.notEqual(full.learnedNet.fullNetRoiPct,null);

const none=buildTicketLearnedNetPlanner205({...base,inventory:[]},now,opts).balanced;
assert.equal(none.learnedNet.coveragePct,0);
assert.equal(none.learnedNet.displayProfitMode,'GROSS ONLY');
assert.equal(none.learnedNet.fullNetProfit,null);
assert.equal(none.learnedNet.netKnownProfit,0);
console.log('OS 205 TICKET LEARNED NET PLANNER PASS');
