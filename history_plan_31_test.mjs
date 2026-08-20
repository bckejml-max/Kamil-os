import {historyPlan31} from './js/historyPlan31.js';
const assert=(x,m)=>{if(!x)throw new Error(m)};
const state={decisionJournal:{items:[{id:'d1',at:'2026-08-20T10:00:00Z',action:'HOLD'}]},netWorthBook:{history:[{id:'n1',at:'2026-08-01',value:1}]},ticketBook:{history:[{id:'t1',at:'2026-08-02',status:'SOLD'}]},tradeJournal:{trades:[{ticker:'WDAY',date:'2026-08-01',qty:1},{ticker:'WDAY',date:'2026-08-02',qty:2}]},importCenter:{history:[{id:'i1',at:'2026-08-03',fileName:'x.csv',imported:2}]},vault:{items:[{password:'secret'}]},documents:{raw:'never'}};
const p=historyPlan31(state);assert(p.total===6,'expected all safe history rows');assert(p.counts.trade===2,'trade count invalid');
const trades=p.records.filter(x=>x.bucket==='trade');assert(trades.length===2&&trades[0].key!==trades[1].key,'same ticker trades must not collide');
assert(!p.records.some(x=>x.bucket==='vault'||x.bucket==='documents'),'sensitive/raw domains must not be mirrored');assert(!JSON.stringify(p.records).includes('secret'),'vault secret leaked into mirror plan');
const again=historyPlan31(state);assert(JSON.stringify(p.records.map(x=>x.key))===JSON.stringify(again.records.map(x=>x.key)),'fallback keys must be deterministic');
console.log('HISTORY PLAN 31.3 TEST PASS');
