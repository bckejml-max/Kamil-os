import {trueNetWorth,netWorthFxRate,upsertNetWorthSnapshot} from './js/netWorth29.js';
const assert=(x,m)=>{if(!x)throw new Error(m)};
const ref=new Date('2026-08-20T12:00:00+02:00');
const s={
 financePlan:{cashNow:100000,currency:'CZK'},
 xtbHub:{accounts:{a:{currency:'CZK',value:50000},b:{currency:'EUR',value:1000}},report:{fx:{EURCZK:{price:25}}}},
 xtbReport:{czkValue:999999,eurValue:999999},
 debtBook:{items:[{id:'d1',person:'Petr',amount:10000,currency:'CZK',payments:[{amount:2000}],status:'ACTIVE'}]},
 ticketBook:{items:[{id:'t1',name:'Sparta',buy:5000,currency:'CZK',workflow:'HOLD'},{id:'t2',name:'Koncert payout',sell:7000,buy:4000,currency:'CZK',workflow:'PAYOUT WAIT'},{id:'t3',name:'Payout bez ceny',sell:0,buy:3000,currency:'CZK',workflow:'PAYOUT WAIT'},{id:'t4',name:'Prodáno',buy:6000,currency:'CZK',workflow:'SOLD'}]},
 netWorthBook:{items:[{id:'a1',title:'Dům',side:'ASSET',kind:'PROPERTY',value:3000000,currency:'CZK',status:'ACTIVE',updatedAt:'2026-08-01'},{id:'l1',title:'Hypotéka',side:'LIABILITY',kind:'MORTGAGE',value:2000000,currency:'CZK',status:'ACTIVE',updatedAt:'2026-08-01'},{id:'l2',title:'EUR úvěr',side:'LIABILITY',kind:'LOAN',value:100,currency:'EUR',status:'ACTIVE',updatedAt:'2026-08-01'},{id:'old',title:'Archiv',side:'ASSET',value:999999,currency:'CZK',status:'ARCHIVED'}],history:[{id:'old-snap',at:'2026-01-10T10:00:00Z',byCurrency:{CZK:{assets:1000000,liabilities:500000,net:500000},EUR:{assets:500,liabilities:0,net:500}}}]}
};
const r=trueNetWorth(s,ref);
assert(r.byCurrency.CZK.assets===3170000,'CZK assets: cash + XTB + receivable + ticket cost + recorded payout + house');
assert(r.byCurrency.CZK.liabilities===2000000&&r.byCurrency.CZK.net===1170000,'CZK liability deducted');
assert(r.byCurrency.EUR.assets===1000&&r.byCurrency.EUR.liabilities===100&&r.byCurrency.EUR.net===900,'EUR stays separate');
assert(r.base.complete===true&&r.base.net===1192500,'real EURCZK converts complete base net');
assert(netWorthFxRate(s,'EUR','CZK')===25&&netWorthFxRate(s,'CZK','EUR')===0.04,'direct and reverse FX');
assert(!Object.values(r.byCurrency.CZK.sources).some(x=>x.label==='Payout bez ceny'),'unpriced payout not invented');
assert(!Object.values(r.byCurrency.CZK.sources).some(x=>x.label.includes('Prodáno')),'sold ticket excluded');
assert(r.gaps.some(x=>x.includes('pořizovací cenou')),'ticket valuation basis disclosed');
const noFx=structuredClone(s);delete noFx.xtbHub.report.fx;const m=trueNetWorth(noFx,ref);assert(m.base.complete===false&&m.base.net===null&&m.base.missingCurrencies.includes('EUR'),'missing FX hides mixed total');
assert(m.byCurrency.CZK.net===1170000&&m.byCurrency.EUR.net===900,'missing FX does not alter per-currency truth');
const h=structuredClone(s);upsertNetWorthSnapshot(h,new Date('2026-08-20T09:00:00Z'));assert(h.netWorthBook.history.length===2,'snapshot added once');h.financePlan.cashNow=110000;upsertNetWorthSnapshot(h,new Date('2026-08-20T18:00:00Z'));assert(h.netWorthBook.history.length===2,'same-day snapshot replaced, not duplicated');const latest=trueNetWorth(h,new Date('2026-08-21T09:00:00Z'));assert(latest.comparisons.priorSnapshot?.date==='2026-08-20','prior snapshot found');assert(latest.comparisons.deltaFromPrior.CZK.delta===0,'current equals replaced latest snapshot');
console.log('TRUE NET WORTH 29.6 TEST PASS');
